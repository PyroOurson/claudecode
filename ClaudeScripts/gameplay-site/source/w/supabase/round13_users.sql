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
  if v_me = 2 then
    return;
  end if;
  if v_me <= private.rank_of(p_uid) then
    raise exception 'You can only manage accounts below your rank' using errcode = '42501';
  end if;
end;
$$;

create or replace function private.session_gone()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_sid text := auth.jwt() ->> 'session_id';
begin
  if v_sid is null or v_sid !~ '^[0-9a-f-]{36}$' then
    return false;
  end if;
  return not exists (select 1 from auth.sessions s where s.id = v_sid::uuid);
exception when others then
  return false;
end;
$$;

create or replace function public.touch_presence(p_lang text default null, p_game text default null)
returns table (role text, locked boolean, locked_reason text, locked_until timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_uid uuid := auth.uid();
  v_lang text := lower(btrim(coalesce(p_lang, '')));
  v_game text := lower(btrim(coalesce(p_game, '')));
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if private.session_gone() then
    raise exception 'Session ended' using errcode = '28000';
  end if;
  if v_lang !~ '^[a-z]{2}$' then
    v_lang := null;
  end if;
  if v_game !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
    v_game := null;
  end if;
  perform private.lock_expire(v_uid);
  if not private.over('pr:' || v_uid::text, date_trunc('minute', now()), 30) then
    update public.profiles p set last_seen = now(), last_lang = coalesce(v_lang, p.last_lang), last_game = coalesce(v_game, p.last_game) where p.id = v_uid;
  end if;
  return query select p.role, p.locked, p.locked_reason, p.locked_until from public.profiles p where p.id = v_uid;
end;
$$;

create or replace function public.admin_sign_out(p_uid uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_n integer := 0;
begin
  perform private.guard_rank(p_uid);
  if not exists (select 1 from auth.users u where u.id = p_uid) then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  begin
    delete from auth.refresh_tokens where user_id = p_uid::text;
    delete from auth.sessions where user_id = p_uid;
    get diagnostics v_n = row_count;
  exception when insufficient_privilege or undefined_table or undefined_column then
    raise exception 'The database does not allow ending sessions from SQL' using errcode = '42501';
  end;
  perform private.admin_log('sign_out', p_uid, jsonb_build_object('sessions', v_n));
  return v_n;
end;
$$;

create or replace function public.admin_set_display_name(p_uid uuid, p_name text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_name text := private.clean_text(p_name, 32);
  v_old text;
begin
  perform private.guard_rank(p_uid);
  select p.display_name into v_old from public.profiles p where p.id = p_uid;
  update public.profiles p set display_name = v_name where p.id = p_uid;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  perform private.admin_log('display_name', p_uid, jsonb_build_object('from', v_old, 'to', v_name));
  return v_name;
end;
$$;

create or replace function public.admin_set_email(p_uid uuid, p_email text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_mail text := lower(btrim(coalesce(p_email, '')));
  v_old text;
begin
  perform private.guard_rank(p_uid);
  if v_mail !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_mail) > 254 then
    raise exception 'That email does not look valid' using errcode = '22023';
  end if;
  if exists (select 1 from auth.users u where lower(u.email) = v_mail and u.id <> p_uid) then
    raise exception 'That email already has an account' using errcode = '23505';
  end if;
  select u.email into v_old from auth.users u where u.id = p_uid;
  if v_old is null and not exists (select 1 from auth.users u where u.id = p_uid) then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  begin
    update auth.users set email = v_mail, email_confirmed_at = coalesce(email_confirmed_at, now()), email_change = '', email_change_token_new = '', updated_at = now() where id = p_uid;
    update auth.identities set identity_data = identity_data || jsonb_build_object('email', v_mail), updated_at = now() where user_id = p_uid and provider = 'email';
  exception when insufficient_privilege then
    raise exception 'The database does not allow changing emails from SQL' using errcode = '42501';
  end;
  update public.test_accounts t set email = v_mail where t.user_id = p_uid;
  perform private.admin_log('email', p_uid, jsonb_build_object('from', v_old, 'to', v_mail));
  return v_mail;
end;
$$;

create or replace function public.admin_create_user(p_email text, p_username text, p_display text, p_password text, p_role text default 'user', p_note text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_role text := coalesce(nullif(lower(btrim(coalesce(p_role, ''))), ''), 'user');
  v_out jsonb;
  v_id uuid;
  v_name text := private.clean_text(p_display, 32);
begin
  if v_role not in ('user', 'admin', 'owner') then
    raise exception 'Role must be user, admin or owner' using errcode = '22023';
  end if;
  if v_role <> 'user' then
    perform private.need_owner();
  end if;
  v_out := public.admin_create_test_account(p_username, p_password, p_email, p_note);
  v_id := (v_out ->> 'id')::uuid;
  update public.profiles p set display_name = coalesce(v_name, p.display_name), role = v_role where p.id = v_id;
  return v_out || jsonb_build_object('display_name', coalesce(v_name, v_out ->> 'username'), 'role', v_role);
end;
$$;

revoke all on function private.session_gone() from public, anon, authenticated;
revoke all on function public.touch_presence(text, text) from public, anon, authenticated;
revoke all on function public.admin_sign_out(uuid) from public, anon, authenticated;
revoke all on function public.admin_set_display_name(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_set_email(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_create_user(text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.touch_presence(text, text) to authenticated;
grant execute on function public.admin_sign_out(uuid) to authenticated;
grant execute on function public.admin_set_display_name(uuid, text) to authenticated;
grant execute on function public.admin_set_email(uuid, text) to authenticated;
grant execute on function public.admin_create_user(text, text, text, text, text, text) to authenticated;
notify pgrst, 'reload schema';
