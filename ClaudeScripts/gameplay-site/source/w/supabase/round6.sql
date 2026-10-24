create table if not exists public.admin_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  admin_id uuid,
  action text not null check (action ~ '^[a-z_]{2,32}$'),
  target_user uuid,
  detail jsonb not null default '{}'::jsonb check (pg_column_size(detail) <= 32768)
);
create index if not exists admin_log_target_idx on public.admin_log (target_user, id desc);
alter table public.admin_log enable row level security;
revoke all on public.admin_log from anon, authenticated;
grant all on public.admin_log to service_role;

create or replace function private.admin_log(p_action text, p_target uuid, p_detail jsonb default '{}'::jsonb)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  insert into public.admin_log (admin_id, action, target_user, detail)
  values (auth.uid(), p_action, p_target, coalesce(jsonb_strip_nulls(p_detail), '{}'::jsonb));
end;
$$;

alter table public.profiles add column if not exists locked_until timestamptz;
alter table public.profiles add column if not exists seen_version integer;
alter table public.profiles drop constraint if exists profiles_seen_version_check;
alter table public.profiles add constraint profiles_seen_version_check check (seen_version is null or seen_version between 0 and 1000000);
create index if not exists profiles_locked_until_idx on public.profiles (locked_until) where locked and locked_until is not null;
grant select (seen_version) on public.profiles to authenticated;
grant update (seen_version) on public.profiles to authenticated;

create or replace function private.lock_expire(p_uid uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  with x as (
    update public.profiles p
      set locked = false, locked_reason = null, locked_until = null
      where p.locked and p.locked_until is not null and p.locked_until <= now() and (p_uid is null or p.id = p_uid)
      returning p.id
  )
  insert into public.admin_log (admin_id, action, target_user)
  select null, 'expire', x.id from x;
end;
$$;

drop function if exists public.my_status();
create or replace function public.my_status()
returns table (role text, locked boolean, locked_reason text, locked_until timestamptz)
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return;
  end if;
  perform private.lock_expire(auth.uid());
  return query select p.role, p.locked, p.locked_reason, p.locked_until from public.profiles p where p.id = auth.uid();
end;
$$;

drop function if exists public.touch_presence(text, text);
create or replace function public.touch_presence(p_lang text default null, p_game text default null)
returns table (role text, locked boolean, locked_reason text, locked_until timestamptz)
language plpgsql
volatile
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

drop function if exists public.admin_list_users();
create or replace function public.admin_list_users()
returns table (id uuid, created_at timestamptz, last_sign_in_at timestamptz, last_seen timestamptz, providers text[], email_confirmed boolean, email_confirmed_at timestamptz, last_lang text, last_game text, role text, email text, username text, display_name text, friends integer, fav_game text, locked boolean, locked_reason text, has_password boolean, seconds_played bigint, plays bigint, locked_until timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  return query
    select u.id, u.created_at::timestamptz, u.last_sign_in_at::timestamptz, p.last_seen,
      coalesce(
        (select array_agg(v.value order by v.value) from jsonb_array_elements_text(case when jsonb_typeof(u.raw_app_meta_data -> 'providers') = 'array' then u.raw_app_meta_data -> 'providers' else '[]'::jsonb end) v),
        case when u.raw_app_meta_data ->> 'provider' is not null then array[u.raw_app_meta_data ->> 'provider'] else array[]::text[] end
      ),
      u.email_confirmed_at is not null, u.email_confirmed_at::timestamptz,
      p.last_lang, p.last_game, coalesce(p.role, 'user'), u.email::text, p.username, p.display_name,
      (select count(*)::integer from public.friends f where f.user_id = u.id),
      (select s.game_id from public.game_stats s where s.user_id = u.id and (s.seconds_played > 0 or s.plays > 0) order by s.seconds_played desc, s.plays desc, s.last_played desc nulls last limit 1),
      coalesce(p.locked, false) and (p.locked_until is null or p.locked_until > now()),
      case when p.locked_until is null or p.locked_until > now() then p.locked_reason end,
      coalesce(u.encrypted_password, '') <> '',
      (select coalesce(sum(s.seconds_played), 0)::bigint from public.game_stats s where s.user_id = u.id),
      (select coalesce(sum(s.plays), 0)::bigint from public.game_stats s where s.user_id = u.id),
      case when coalesce(p.locked, false) and p.locked_until > now() then p.locked_until end
    from auth.users u
    left join public.profiles p on p.id = u.id
    where u.deleted_at is null
    order by u.created_at desc
    limit 10000;
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
  v_me uuid := private.need_admin();
  v_old text;
begin
  if p_role is null or p_role not in ('user', 'admin') then
    raise exception 'Role must be user or admin' using errcode = '22023';
  end if;
  perform 1 from public.profiles p where p.role = 'admin' for update;
  select p.role into v_old from public.profiles p where p.id = p_uid for update;
  if v_old is null then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  if v_old = 'admin' and p_role <> 'admin' and not exists (select 1 from public.profiles p where p.role = 'admin' and not p.locked and p.id <> p_uid) then
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
  if exists (select 1 from public.profiles p where p.id = p_uid and p.role = 'admin') then
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

create or replace function public.admin_delete_ticket(p_ticket bigint)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  perform private.admin_log('ticket_delete', t.user_id, jsonb_build_object('ticket', t.id, 'subject', t.subject)) from public.tickets t where t.id = p_ticket;
  delete from public.ticket_messages m where m.ticket_id = p_ticket;
  delete from public.tickets t where t.id = p_ticket;
  if not found then
    raise exception 'Ticket not found' using errcode = 'P0002';
  end if;
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
  v_admin := exists (select 1 from public.profiles p where p.id = v_uid and p.role = 'admin' and not p.locked);
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

create or replace function public.ticket_set_status(p_ticket bigint, p_status text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if p_status is null or p_status not in ('open', 'closed') then
    raise exception 'Status must be open or closed' using errcode = '22023';
  end if;
  update public.tickets t set status = p_status, updated_at = now()
    where t.id = p_ticket and (t.user_id = v_uid or public.is_admin());
  if not found then
    raise exception 'Ticket not found' using errcode = 'P0002';
  end if;
  perform private.admin_log('ticket_status', t.user_id, jsonb_build_object('ticket', t.id, 'status', p_status, 'subject', t.subject)) from public.tickets t where t.id = p_ticket and t.user_id <> v_uid and public.is_admin();
  return p_status;
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
  if not exists (select 1 from auth.users u where u.id = p_uid) then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  perform private.admin_log('reset_email', p_uid, '{}'::jsonb);
  return true;
end;
$$;

create or replace function public.admin_log_list(p_limit integer default 50, p_before bigint default null, p_target uuid default null)
returns table (id bigint, at timestamptz, admin_id uuid, admin_username text, admin_display text, action text, target_user uuid, target_username text, target_display text, detail jsonb)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  return query
    select l.id, l.at, l.admin_id, a.username, a.display_name, l.action, l.target_user, t.username, t.display_name, l.detail
    from public.admin_log l
    left join public.profiles a on a.id = l.admin_id
    left join public.profiles t on t.id = l.target_user
    where (p_before is null or l.id < p_before) and (p_target is null or l.target_user = p_target)
    order by l.id desc
    limit greatest(1, least(coalesce(p_limit, 50), 200));
end;
$$;

create table if not exists public.site_flags (
  id smallint primary key default 1 check (id = 1),
  maintenance boolean not null default false,
  maintenance_msg text check (maintenance_msg is null or char_length(maintenance_msg) <= 500),
  banner text check (banner is null or char_length(banner) <= 300),
  banner_level text not null default 'info' check (banner_level in ('info', 'warning')),
  banner_until timestamptz,
  disabled_games text[] not null default '{}'::text[] check (cardinality(disabled_games) <= 200),
  disabled_msg text check (disabled_msg is null or char_length(disabled_msg) <= 300),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
insert into public.site_flags (id) values (1) on conflict (id) do nothing;
alter table public.site_flags enable row level security;
revoke all on public.site_flags from anon, authenticated;
grant all on public.site_flags to service_role;

create or replace function public.get_site_flags()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select jsonb_build_object(
      'maintenance', f.maintenance,
      'maintenance_msg', f.maintenance_msg,
      'banner', case when f.banner_until is null or f.banner_until > now() then f.banner end,
      'banner_level', f.banner_level,
      'banner_until', f.banner_until,
      'disabled_games', to_jsonb(f.disabled_games),
      'disabled_msg', f.disabled_msg,
      'updated_at', f.updated_at
    )
    from public.site_flags f where f.id = 1
  ), '{}'::jsonb);
$$;

create or replace function public.admin_set_site_flags(p_flags jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_old jsonb := public.get_site_flags();
  v_games text[];
  v_until timestamptz;
  v_level text := coalesce(p_flags ->> 'banner_level', 'info');
begin
  if p_flags is null or jsonb_typeof(p_flags) <> 'object' then
    raise exception 'Bad flags' using errcode = '22023';
  end if;
  if v_level not in ('info', 'warning') then
    v_level := 'info';
  end if;
  select coalesce(array_agg(distinct g.value order by g.value), '{}'::text[]) into v_games
    from jsonb_array_elements_text(case when jsonb_typeof(p_flags -> 'disabled_games') = 'array' then p_flags -> 'disabled_games' else '[]'::jsonb end) g
    where g.value ~ '^[a-z0-9][a-z0-9-]{0,39}$';
  if cardinality(v_games) > 200 then
    raise exception 'Too many games' using errcode = '22023';
  end if;
  begin
    v_until := nullif(p_flags ->> 'banner_until', '')::timestamptz;
  exception when others then
    raise exception 'Bad end time' using errcode = '22023';
  end;
  insert into public.site_flags (id) values (1) on conflict (id) do nothing;
  update public.site_flags f set
    maintenance = coalesce((p_flags ->> 'maintenance')::boolean, false),
    maintenance_msg = private.clean_text(p_flags ->> 'maintenance_msg', 500),
    banner = private.clean_text(p_flags ->> 'banner', 300),
    banner_level = v_level,
    banner_until = v_until,
    disabled_games = v_games,
    disabled_msg = private.clean_text(p_flags ->> 'disabled_msg', 300),
    updated_at = now(),
    updated_by = v_me
  where f.id = 1;
  perform private.admin_log('site', null, jsonb_build_object('before', v_old, 'after', public.get_site_flags()));
  return public.get_site_flags();
end;
$$;

create table if not exists public.favourites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game_id text not null check (game_id ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, game_id)
);
alter table public.favourites enable row level security;
drop policy if exists "favourites: read own" on public.favourites;
create policy "favourites: read own" on public.favourites for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "favourites: insert own" on public.favourites;
create policy "favourites: insert own" on public.favourites for insert to authenticated
  with check (user_id = (select auth.uid()));
drop policy if exists "favourites: delete own" on public.favourites;
create policy "favourites: delete own" on public.favourites for delete to authenticated
  using (user_id = (select auth.uid()));
revoke all on public.favourites from anon, authenticated;
grant all on public.favourites to service_role;
grant select, delete on public.favourites to authenticated;
grant insert (user_id, game_id) on public.favourites to authenticated;
drop trigger if exists favourites_cap on public.favourites;
create trigger favourites_cap before insert on public.favourites
  for each row execute function private.cap_rows('user_id', '300', 'game_id');

revoke all on function public.my_status() from public, anon, authenticated;
revoke all on function public.touch_presence(text, text) from public, anon, authenticated;
revoke all on function public.admin_list_users() from public, anon, authenticated;
revoke all on function public.admin_set_role(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_set_password(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_lock(uuid, boolean, text) from public, anon, authenticated;
revoke all on function public.admin_lock_until(uuid, text, timestamptz) from public, anon, authenticated;
revoke all on function public.admin_set_username(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_delete_user(uuid) from public, anon, authenticated;
revoke all on function public.admin_delete_ticket(bigint) from public, anon, authenticated;
revoke all on function public.ticket_set_status(bigint, text) from public, anon, authenticated;
revoke all on function public.admin_log_reset(uuid) from public, anon, authenticated;
revoke all on function public.admin_log_list(integer, bigint, uuid) from public, anon, authenticated;
revoke all on function public.get_site_flags() from public, anon, authenticated;
revoke all on function public.admin_set_site_flags(jsonb) from public, anon, authenticated;
grant execute on function public.my_status() to authenticated;
grant execute on function public.touch_presence(text, text) to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_set_password(uuid, text) to authenticated;
grant execute on function public.admin_lock(uuid, boolean, text) to authenticated;
grant execute on function public.admin_lock_until(uuid, text, timestamptz) to authenticated;
grant execute on function public.admin_set_username(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
grant execute on function public.admin_delete_ticket(bigint) to authenticated;
grant execute on function public.ticket_set_status(bigint, text) to authenticated;
grant execute on function public.admin_log_reset(uuid) to authenticated;
grant execute on function public.admin_log_list(integer, bigint, uuid) to authenticated;
grant execute on function public.get_site_flags() to anon, authenticated;
grant execute on function public.admin_set_site_flags(jsonb) to authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
