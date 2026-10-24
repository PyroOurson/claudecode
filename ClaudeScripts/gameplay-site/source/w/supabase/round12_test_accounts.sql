create table if not exists public.test_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  password text not null,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.test_accounts enable row level security;
revoke all on table public.test_accounts from public, anon, authenticated;

create or replace function public.admin_create_test_account(p_username text, p_password text, p_email text default null, p_note text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_id uuid := gen_random_uuid();
  v_user text := lower(trim(coalesce(p_username, '')));
  v_mail text := lower(trim(coalesce(p_email, '')));
  v_note text := nullif(left(trim(coalesce(p_note, '')), 200), '');
begin
  if v_user = '' then
    v_user := 'test' || lpad((floor(random() * 100000))::int::text, 5, '0');
  end if;
  if not private.username_ok(v_user) then
    raise exception 'Username: 3 to 20 letters, numbers, dots or underscores' using errcode = '22023';
  end if;
  if exists (select 1 from public.profiles p where lower(p.username) = v_user) then
    raise exception 'That username is taken' using errcode = '23505';
  end if;
  if p_password is null or char_length(p_password) < 8 then
    raise exception 'Password must be at least 8 characters' using errcode = '22023';
  end if;
  if octet_length(p_password) > 72 then
    raise exception 'Password must be at most 72 characters' using errcode = '22023';
  end if;
  if v_mail = '' then
    v_mail := v_user || '.' || substr(md5(v_id::text), 1, 6) || '@test.example.com';
  end if;
  if v_mail !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_mail) > 254 then
    raise exception 'That email does not look valid' using errcode = '22023';
  end if;
  if exists (select 1 from auth.users u where lower(u.email) = v_mail) then
    raise exception 'That email already has an account' using errcode = '23505';
  end if;
  begin
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_mail, extensions.crypt(p_password, extensions.gen_salt('bf', 10)), now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('username', v_user, 'display_name', v_user),
      now(), now(), '', '', '', '');
    insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (v_id::text, v_id, jsonb_build_object('sub', v_id::text, 'email', v_mail, 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now());
  exception when insufficient_privilege then
    raise exception 'The database does not allow creating accounts from SQL' using errcode = '42501';
  end;
  update public.profiles p set username = v_user where p.id = v_id and p.username is null;
  insert into public.test_accounts (user_id, email, password, note, created_by) values (v_id, v_mail, p_password, v_note, v_me);
  perform private.admin_log('test_account', v_id, jsonb_build_object('email', v_mail));
  return jsonb_build_object('id', v_id, 'email', v_mail, 'username', v_user, 'password', p_password);
end;
$$;

create or replace function public.admin_test_accounts()
returns table (user_id uuid, email text, username text, password text, note text, created_at timestamptz, created_by text, last_sign_in_at timestamptz, locked boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return query
  select t.user_id, t.email, p.username, t.password, t.note, t.created_at, coalesce(c.username, c.display_name), u.last_sign_in_at, coalesce(p.locked, false)
  from public.test_accounts t
  join auth.users u on u.id = t.user_id
  left join public.profiles p on p.id = t.user_id
  left join public.profiles c on c.id = t.created_by
  order by t.created_at desc;
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
  update public.test_accounts t set password = p_password where t.user_id = p_uid;
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

revoke all on function public.admin_create_test_account(text, text, text, text) from public, anon, authenticated;
revoke all on function public.admin_test_accounts() from public, anon, authenticated;
revoke all on function public.admin_set_password(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_create_test_account(text, text, text, text) to authenticated;
grant execute on function public.admin_test_accounts() to authenticated;
grant execute on function public.admin_set_password(uuid, text) to authenticated;
notify pgrst, 'reload schema';
