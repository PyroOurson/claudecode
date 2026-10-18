alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin', 'owner'));

create or replace function private.need_admin()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if not exists (select 1 from public.profiles p where p.id = v_uid and p.role in ('admin', 'owner') and not p.locked) then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  return v_uid;
end;
$$;

create or replace function private.need_owner()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if not exists (select 1 from public.profiles p where p.id = v_uid and p.role = 'owner' and not p.locked) then
    raise exception 'Owners only' using errcode = '42501';
  end if;
  return v_uid;
end;
$$;

create or replace function private.guard_owner_target(p_uid uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.profiles p where p.id = p_uid and p.role = 'owner')
    and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner' and not p.locked) then
    raise exception 'Only an owner can change an owner' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'owner') and not p.locked);
$$;

create or replace function public.admin_set_role(p_uid uuid, p_role text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_owner boolean;
  v_old text;
begin
  if p_role is null or p_role not in ('user', 'admin', 'owner') then
    raise exception 'Role must be user, admin or owner' using errcode = '22023';
  end if;
  v_owner := exists (select 1 from public.profiles p where p.id = v_me and p.role = 'owner');
  perform 1 from public.profiles p where p.role in ('admin', 'owner') for update;
  select p.role into v_old from public.profiles p where p.id = p_uid for update;
  if v_old is null then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  if v_old = p_role then
    return p_role;
  end if;
  if not v_owner and (p_role = 'owner' or v_old in ('admin', 'owner')) then
    raise exception 'Only an owner can do this' using errcode = '42501';
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
  perform private.guard_owner_target(p_uid);
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
  perform private.guard_owner_target(p_uid);
  if p_uid = v_me and coalesce(p_locked, false) then
    raise exception 'You cannot lock your own account' using errcode = '42501';
  end if;
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
  perform private.guard_owner_target(p_uid);
  if p_uid = v_me then
    raise exception 'You cannot lock your own account' using errcode = '42501';
  end if;
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
  perform private.guard_owner_target(p_uid);
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
  perform private.guard_owner_target(p_uid);
  if p_uid = v_me then
    raise exception 'You cannot delete your own account here' using errcode = '42501';
  end if;
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
  perform private.guard_owner_target(p_uid);
  if not exists (select 1 from auth.users u where u.id = p_uid) then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  perform private.admin_log('reset_email', p_uid, '{}'::jsonb);
  return true;
end;
$$;

create or replace function private.ticket_message_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_admin boolean;
begin
  new.body := nullif(btrim(regexp_replace(regexp_replace(replace(left(coalesce(new.body, ''), 4000), E'\r', ''), E'[\\x01-\\x09\\x0b-\\x1f\\x7f]', '', 'g'), E'\n{3,}', E'\n\n', 'g')), '');
  if new.body is null then
    raise exception 'Write a message' using errcode = '22023';
  end if;
  new.body := left(new.body, 2000);
  new.created_at := now();
  select t.user_id into v_owner from public.tickets t where t.id = new.ticket_id;
  if v_owner is null then
    raise exception 'Ticket not found' using errcode = 'P0002';
  end if;
  if (select count(*) from public.ticket_messages m where m.ticket_id = new.ticket_id) >= 500 then
    raise exception 'Too many messages in this ticket' using errcode = '54000';
  end if;
  if v_uid is null then
    return new;
  end if;
  v_admin := exists (select 1 from public.profiles p where p.id = v_uid and p.role in ('admin', 'owner') and not p.locked);
  if v_owner <> v_uid and not v_admin then
    raise exception 'Not your ticket' using errcode = '42501';
  end if;
  new.author_id := v_uid;
  new.is_admin := v_admin and v_owner <> v_uid;
  if private.over('tm:' || v_uid::text, date_trunc('minute', now()), 20) or private.over('th:' || v_uid::text, date_trunc('hour', now()), 300) then
    raise exception 'Too many messages' using errcode = '54000';
  end if;
  update public.tickets t set updated_at = now(), status = case when new.is_admin then t.status else 'open' end where t.id = new.ticket_id;
  if new.is_admin then
    perform private.admin_log('ticket_reply', v_owner, jsonb_build_object('ticket', new.ticket_id));
  end if;
  return new;
end;
$$;

create table if not exists public.site_gate (
  id smallint primary key default 1 check (id = 1),
  slot jsonb not null check (pg_column_size(slot) <= 2048),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
alter table public.site_gate enable row level security;
revoke all on public.site_gate from anon, authenticated;
grant all on public.site_gate to service_role;

create or replace function public.get_gate_slot()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select g.slot from public.site_gate g where g.id = 1;
$$;

create or replace function public.owner_set_gate(p_slot jsonb)
returns timestamptz
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_owner();
  v_n integer;
begin
  if p_slot is null or jsonb_typeof(p_slot) <> 'object'
    or (select count(*) from jsonb_object_keys(p_slot)) <> 5
    or p_slot -> 'v' is distinct from '1'::jsonb
    or jsonb_typeof(p_slot -> 'n') is distinct from 'number'
    or jsonb_typeof(p_slot -> 's') is distinct from 'string'
    or jsonb_typeof(p_slot -> 'i') is distinct from 'string'
    or jsonb_typeof(p_slot -> 'c') is distinct from 'string'
    or (p_slot ->> 'n') !~ '^[0-9]{6,7}$'
    or (p_slot ->> 's') !~ '^[A-Za-z0-9+/]{22}==$'
    or (p_slot ->> 'i') !~ '^[A-Za-z0-9+/]{16}$'
    or (p_slot ->> 'c') !~ '^[A-Za-z0-9+/]{64}$' then
    raise exception 'Bad password slot' using errcode = '22023';
  end if;
  v_n := (p_slot ->> 'n')::integer;
  if v_n < 100000 or v_n > 5000000 then
    raise exception 'Bad password slot' using errcode = '22023';
  end if;
  insert into public.site_gate (id, slot, updated_at, updated_by)
    values (1, jsonb_build_object('v', 1, 's', p_slot ->> 's', 'n', v_n, 'i', p_slot ->> 'i', 'c', p_slot ->> 'c'), now(), v_me)
    on conflict (id) do update set slot = excluded.slot, updated_at = excluded.updated_at, updated_by = excluded.updated_by;
  perform private.admin_log('site_password', null, '{}'::jsonb);
  return now();
end;
$$;

update public.profiles p set role = 'owner'
  where p.id = (select u.id from auth.users u where u.email = 'gabriel06401@gmail.com')
    and p.role is distinct from 'owner';

revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.admin_set_role(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_set_password(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_lock(uuid, boolean, text) from public, anon, authenticated;
revoke all on function public.admin_lock_until(uuid, text, timestamptz) from public, anon, authenticated;
revoke all on function public.admin_set_username(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_delete_user(uuid) from public, anon, authenticated;
revoke all on function public.admin_log_reset(uuid) from public, anon, authenticated;
revoke all on function public.get_gate_slot() from public, anon, authenticated;
revoke all on function public.owner_set_gate(jsonb) from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_set_password(uuid, text) to authenticated;
grant execute on function public.admin_lock(uuid, boolean, text) to authenticated;
grant execute on function public.admin_lock_until(uuid, text, timestamptz) to authenticated;
grant execute on function public.admin_set_username(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
grant execute on function public.admin_log_reset(uuid) to authenticated;
grant execute on function public.get_gate_slot() to anon, authenticated;
grant execute on function public.owner_set_gate(jsonb) to authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
