create or replace function private.rank_of(p_uid uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select case p.role when 'owner' then 2 when 'admin' then 1 else 0 end from public.profiles p where p.id = p_uid), 0);
$$;

create or replace function private.guard_rank(p_uid uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me integer := coalesce((select case p.role when 'owner' then 2 when 'admin' then 1 else 0 end from public.profiles p where p.id = auth.uid() and not p.locked), 0);
begin
  if v_me <= private.rank_of(p_uid) then
    raise exception 'You can only manage accounts below your rank' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.admin_set_role(p_uid uuid, p_role text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_owner();
  v_old text;
begin
  if p_role is null or p_role not in ('user', 'admin', 'owner') then
    raise exception 'Role must be user, admin or owner' using errcode = '22023';
  end if;
  perform 1 from public.profiles p where p.role in ('admin', 'owner') for update;
  select p.role into v_old from public.profiles p where p.id = p_uid for update;
  if v_old is null then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  if v_old = p_role then
    return p_role;
  end if;
  if v_old = 'owner' and not exists (select 1 from public.profiles p where p.role = 'owner' and not p.locked and p.id <> p_uid) then
    raise exception 'There must be at least one owner' using errcode = '42501';
  end if;
  if v_old in ('admin', 'owner') and p_role = 'user' and not exists (select 1 from public.profiles p where p.role in ('admin', 'owner') and not p.locked and p.id <> p_uid) then
    raise exception 'There must be at least one admin' using errcode = '42501';
  end if;
  update public.profiles p set role = p_role where p.id = p_uid;
  perform private.admin_log('role', p_uid, jsonb_build_object('from', v_old, 'to', p_role));
  return p_role;
end;
$$;

create or replace function public.admin_set_password(p_uid uuid, p_password text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_out text := 'signed_out';
begin
  perform private.guard_rank(p_uid);
  if p_password is null or char_length(p_password) < 8 then
    raise exception 'Password must be at least 8 characters' using errcode = '22023';
  end if;
  if octet_length(p_password) > 72 then
    raise exception 'Password must be at most 72 characters' using errcode = '22023';
  end if;
  begin
    update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf', 10)), updated_at = now() where id = p_uid and deleted_at is null;
  exception when insufficient_privilege then
    raise exception 'The database does not allow changing passwords from SQL' using errcode = '42501';
  end;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  begin
    delete from auth.refresh_tokens where user_id = p_uid::text;
  exception when insufficient_privilege or undefined_table or undefined_column then
    v_out := 'sessions_kept';
  end;
  begin
    delete from auth.sessions where user_id = p_uid;
  exception when insufficient_privilege or undefined_table or undefined_column then
    v_out := 'sessions_kept';
  end;
  perform private.admin_log('password', p_uid, jsonb_build_object('sessions', v_out));
  return v_out;
end;
$$;

create or replace function public.admin_lock(p_uid uuid, p_locked boolean, p_reason text default null)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  if p_uid = v_me and coalesce(p_locked, false) then
    raise exception 'You cannot lock your own account' using errcode = '42501';
  end if;
  perform private.guard_rank(p_uid);
  update public.profiles p
    set locked = coalesce(p_locked, false),
      locked_reason = case when coalesce(p_locked, false) then private.clean_text(p_reason, 500) end,
      locked_until = null
    where p.id = p_uid;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  perform private.admin_log(case when coalesce(p_locked, false) then 'lock' else 'unlock' end, p_uid, case when coalesce(p_locked, false) then jsonb_build_object('reason', private.clean_text(p_reason, 500)) else '{}'::jsonb end);
  return coalesce(p_locked, false);
end;
$$;

create or replace function public.admin_lock_until(p_uid uuid, p_reason text default null, p_until timestamptz default null)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_reason text := private.clean_text(p_reason, 500);
begin
  if p_uid = v_me then
    raise exception 'You cannot lock your own account' using errcode = '42501';
  end if;
  perform private.guard_rank(p_uid);
  if p_until is not null and (p_until <= now() or p_until > now() + interval '10 years') then
    raise exception 'Pick an end time in the future' using errcode = '22023';
  end if;
  update public.profiles p
    set locked = true, locked_reason = v_reason, locked_until = p_until
    where p.id = p_uid;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  perform private.admin_log('lock', p_uid, jsonb_build_object('reason', v_reason, 'until', p_until));
  return true;
end;
$$;

create or replace function public.admin_set_username(p_uid uuid, p_name text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_name text := lower(btrim(coalesce(p_name, '')));
begin
  perform private.need_admin();
  perform private.guard_rank(p_uid);
  if not private.username_ok(v_name) then
    raise exception 'Username not allowed' using errcode = '22023';
  end if;
  if exists (select 1 from public.profiles p where p.username = v_name and p.id <> p_uid) then
    raise exception 'Username taken' using errcode = '23505';
  end if;
  perform private.admin_log('username', p_uid, jsonb_build_object('from', (select p.username from public.profiles p where p.id = p_uid), 'to', v_name));
  update public.profiles p set username = v_name where p.id = p_uid;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  return v_name;
end;
$$;

create or replace function public.admin_delete_user(p_uid uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  if p_uid = v_me then
    raise exception 'You cannot delete your own account here' using errcode = '42501';
  end if;
  perform private.guard_rank(p_uid);
  if exists (select 1 from public.profiles p where p.id = p_uid and p.role in ('admin', 'owner')) then
    raise exception 'Make this admin a regular user first' using errcode = '42501';
  end if;
  if not exists (select 1 from auth.users u where u.id = p_uid) then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  perform private.admin_log('delete_user', p_uid, (select jsonb_build_object('username', p.username, 'display_name', p.display_name) from public.profiles p where p.id = p_uid));
  update public.analytics_events set user_id = null where user_id = p_uid;
  delete from public.dms where from_id = p_uid or to_id = p_uid;
  delete from public.friends where user_id = p_uid or friend_id = p_uid;
  delete from public.friend_requests where from_id = p_uid or to_id = p_uid;
  delete from auth.users where id = p_uid;
  return 'deleted';
end;
$$;

create or replace function public.admin_log_reset(p_uid uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  perform private.guard_rank(p_uid);
  if not exists (select 1 from auth.users u where u.id = p_uid) then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  perform private.admin_log('reset_email', p_uid, '{}'::jsonb);
  return true;
end;
$$;

drop function if exists private.guard_owner_target(uuid);

revoke all on function public.admin_set_role(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_set_password(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_lock(uuid, boolean, text) from public, anon, authenticated;
revoke all on function public.admin_lock_until(uuid, text, timestamptz) from public, anon, authenticated;
revoke all on function public.admin_set_username(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_delete_user(uuid) from public, anon, authenticated;
revoke all on function public.admin_log_reset(uuid) from public, anon, authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_set_password(uuid, text) to authenticated;
grant execute on function public.admin_lock(uuid, boolean, text) to authenticated;
grant execute on function public.admin_lock_until(uuid, text, timestamptz) to authenticated;
grant execute on function public.admin_set_username(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
grant execute on function public.admin_log_reset(uuid) to authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
notify pgrst, 'reload schema';
