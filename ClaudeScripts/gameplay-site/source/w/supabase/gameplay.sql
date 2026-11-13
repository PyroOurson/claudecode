-- Gameplay Games database: the one file for every Supabase project (a new empty project or production).
-- Safe to run any number of times. It never deletes or rewrites user data, apart from the one-time clean-ups in
-- the last section, each recorded in private.once_done so it runs once. Change this file only, and put the date
-- of the change at the top of the section you change.

-- ============================================================================
-- 2026-11-13 Base schema: accounts, games, friends, messages, parties, admin, analytics (rounds 1 to 19)
-- ============================================================================
create schema if not exists private;
create extension if not exists pgcrypto with schema extensions;
create schema if not exists admin;
revoke all on schema private from public, anon, authenticated;
revoke all on schema admin from public, anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.username_ok(p_name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_name is not null
    and p_name ~ '^[a-z0-9_.]{3,20}$'
    and p_name !~ '^\.|\.$|\.\.'
    and p_name not in ('admin', 'administrator', 'gameplay', 'support', 'help', 'root', 'system', 'moderator', 'mod', 'staff', 'official', 'owner', 'null', 'undefined', 'guest', 'anonymous', 'everyone', 'nobody', 'me', 'you');
$$;

create or replace function private.clean_text(p_text text, p_max integer)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(left(btrim(regexp_replace(regexp_replace(coalesce(p_text, ''), '[[:cntrl:]]', '', 'g'), '\s+', ' ', 'g')), p_max), '');
$$;

create or replace function private.cap_rows()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_col text := tg_argv[0];
  v_limit integer := tg_argv[1]::integer;
  v_key_col text := tg_argv[2];
  v_owner uuid := (to_jsonb(new) ->> v_owner_col)::uuid;
  v_exists boolean := false;
  v_count integer;
begin
  if v_key_col is not null then
    execute format('select exists (select 1 from %I.%I where %I = $1 and %I = $2)', tg_table_schema, tg_table_name, v_owner_col, v_key_col)
      into v_exists using v_owner, to_jsonb(new) ->> v_key_col;
    if v_exists then
      return new;
    end if;
  end if;
  execute format('select count(*) from %I.%I where %I = $1', tg_table_schema, tg_table_name, v_owner_col)
    into v_count using v_owner;
  if v_count >= v_limit then
    raise exception 'Too many rows in %', tg_table_name using errcode = '54000';
  end if;
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles drop constraint if exists profiles_username_check;
alter table public.profiles add constraint profiles_username_check check (username is null or (username ~ '^[a-z0-9_.]{3,20}$' and username !~ '^\.|\.$|\.\.' and username <> all (array['admin', 'administrator', 'gameplay', 'support', 'help', 'root', 'system', 'moderator', 'mod', 'staff', 'official', 'owner', 'null', 'undefined', 'guest', 'anonymous', 'everyone', 'nobody', 'me', 'you'])));
alter table public.profiles drop constraint if exists profiles_display_name_check;
alter table public.profiles add constraint profiles_display_name_check check (display_name is null or (char_length(display_name) between 1 and 32 and display_name !~ '[[:cntrl:]]'));
alter table public.profiles drop constraint if exists profiles_avatar_url_check;
alter table public.profiles add constraint profiles_avatar_url_check check (avatar_url is null or (char_length(avatar_url) <= 500 and avatar_url ~ '^https://'));
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists locked boolean not null default false;
alter table public.profiles add column if not exists locked_reason text;
alter table public.profiles add column if not exists last_seen timestamptz;
alter table public.profiles add column if not exists last_lang text;
alter table public.profiles add column if not exists last_game text;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin', 'owner'));
alter table public.profiles drop constraint if exists profiles_locked_reason_check;
alter table public.profiles add constraint profiles_locked_reason_check check (locked_reason is null or char_length(locked_reason) <= 500);
alter table public.profiles drop constraint if exists profiles_last_lang_check;
alter table public.profiles add constraint profiles_last_lang_check check (last_lang is null or last_lang ~ '^[a-z]{2}$');
alter table public.profiles drop constraint if exists profiles_last_game_check;
alter table public.profiles add constraint profiles_last_game_check check (last_game is null or last_game ~ '^[a-z0-9][a-z0-9-]{0,39}$');
create index if not exists profiles_role_idx on public.profiles (role) where role <> 'user';

create unique index if not exists profiles_username_lower_key on public.profiles (lower(username));
create index if not exists profiles_username_prefix_idx on public.profiles (lower(username) text_pattern_ops) where username is not null;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function private.touch_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_name text := private.clean_text(coalesce(v_meta ->> 'display_name', v_meta ->> 'full_name', v_meta ->> 'name'), 32);
  v_avatar text := coalesce(v_meta ->> 'avatar_url', v_meta ->> 'picture');
  v_user text := lower(v_meta ->> 'username');
begin
  if v_avatar is not null and (v_avatar !~ '^https://' or char_length(v_avatar) > 500) then
    v_avatar := null;
  end if;
  if not private.username_ok(v_user) then
    v_user := null;
  end if;
  begin
    insert into public.profiles (id, username, display_name, avatar_url)
    values (new.id, v_user, v_name, v_avatar)
    on conflict (id) do nothing;
  exception when unique_violation or check_violation then
    insert into public.profiles (id, display_name, avatar_url)
    values (new.id, v_name, v_avatar)
    on conflict (id) do nothing;
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

insert into public.profiles (id, display_name)
select u.id, private.clean_text(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'), 32)
from auth.users u
on conflict (id) do nothing;

create table if not exists public.game_stats (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game_id text not null,
  plays integer not null default 0,
  seconds_played double precision not null default 0,
  best_score double precision,
  best_better text not null default 'high',
  last_played timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

alter table public.game_stats drop constraint if exists game_stats_game_id_check;
alter table public.game_stats add constraint game_stats_game_id_check check (game_id ~ '^[a-z0-9][a-z0-9-]{0,39}$');
alter table public.game_stats drop constraint if exists game_stats_plays_check;
alter table public.game_stats add constraint game_stats_plays_check check (plays between 0 and 10000000);
alter table public.game_stats drop constraint if exists game_stats_seconds_check;
alter table public.game_stats add constraint game_stats_seconds_check check (seconds_played >= 0 and seconds_played <= 1000000000);
alter table public.game_stats drop constraint if exists game_stats_best_check;
alter table public.game_stats add constraint game_stats_best_check check (best_score is null or (best_score <> 'NaN'::double precision and abs(best_score) < 1e15));
alter table public.game_stats drop constraint if exists game_stats_better_check;
alter table public.game_stats add constraint game_stats_better_check check (best_better in ('high', 'low'));

create index if not exists game_stats_game_idx on public.game_stats (game_id);

drop trigger if exists game_stats_touch on public.game_stats;
create trigger game_stats_touch before update on public.game_stats
  for each row execute function private.touch_updated_at();
drop trigger if exists game_stats_cap on public.game_stats;
create trigger game_stats_cap before insert on public.game_stats
  for each row execute function private.cap_rows('user_id', '500', 'game_id');

create table if not exists private.sync_batches (
  user_id uuid not null references auth.users (id) on delete cascade,
  batch_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, batch_id)
);

create or replace function public.sync_game_stats(p_batch uuid default null, p_rows jsonb default '[]'::jsonb)
returns setof public.game_stats
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_row jsonb;
  v_new integer := 0;
  v_plays integer;
  v_secs double precision;
  v_best double precision;
  v_better text;
  v_last timestamptz;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 300 then
    raise exception 'p_rows must be an array of at most 300 rows' using errcode = '22023';
  end if;
  if jsonb_array_length(p_rows) > 0 then
    if p_batch is null then
      raise exception 'p_batch is required' using errcode = '22023';
    end if;
    insert into private.sync_batches (user_id, batch_id) values (v_uid, p_batch) on conflict do nothing;
    get diagnostics v_new = row_count;
    if v_new = 1 then
      for v_row in select value from jsonb_array_elements(p_rows) loop
        continue when jsonb_typeof(v_row) <> 'object';
        v_plays := case when jsonb_typeof(v_row -> 'plays') = 'number' then floor(least(greatest((v_row ->> 'plays')::numeric, 0), 100000))::integer else 0 end;
        v_secs := case when jsonb_typeof(v_row -> 'seconds') = 'number' then least(greatest((v_row ->> 'seconds')::numeric, 0), 604800)::double precision else 0 end;
        v_best := case when jsonb_typeof(v_row -> 'best') = 'number' and abs((v_row ->> 'best')::numeric) < 1e15 then (v_row ->> 'best')::double precision end;
        v_better := case when v_row ->> 'better' = 'low' then 'low' else 'high' end;
        v_last := case when jsonb_typeof(v_row -> 'last_played') = 'string' then least(now(), (v_row ->> 'last_played')::timestamptz) end;
        continue when v_plays = 0 and v_secs = 0 and v_best is null and v_last is null;
        insert into public.game_stats as s (user_id, game_id, plays, seconds_played, best_score, best_better, last_played)
        values (v_uid, v_row ->> 'game_id', v_plays, v_secs, v_best, v_better, v_last)
        on conflict (user_id, game_id) do update set
          plays = least(s.plays + excluded.plays, 10000000),
          seconds_played = least(s.seconds_played + excluded.seconds_played, 1000000000),
          best_better = excluded.best_better,
          best_score = case
            when excluded.best_score is null then s.best_score
            when s.best_score is null then excluded.best_score
            when excluded.best_better = 'low' then least(s.best_score, excluded.best_score)
            else greatest(s.best_score, excluded.best_score)
          end,
          last_played = greatest(s.last_played, excluded.last_played);
      end loop;
    end if;
    if random() < 0.02 then
      delete from private.sync_batches where user_id = v_uid and created_at < now() - interval '60 days';
    end if;
  end if;
  return query select * from public.game_stats where user_id = v_uid order by game_id;
end;
$$;

create table if not exists public.game_saves (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  game_id text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

alter table public.game_saves drop constraint if exists game_saves_game_id_check;
alter table public.game_saves add constraint game_saves_game_id_check check (game_id ~ '^[a-z0-9][a-z0-9-]{0,39}$');
alter table public.game_saves drop constraint if exists game_saves_size_check;
alter table public.game_saves add constraint game_saves_size_check check (octet_length(data::text) <= 262144);

drop trigger if exists game_saves_touch_ins on public.game_saves;
create trigger game_saves_touch_ins before insert on public.game_saves
  for each row execute function private.touch_updated_at();
drop trigger if exists game_saves_touch on public.game_saves;
create trigger game_saves_touch before update on public.game_saves
  for each row execute function private.touch_updated_at();
drop trigger if exists game_saves_cap on public.game_saves;
create trigger game_saves_cap before insert on public.game_saves
  for each row execute function private.cap_rows('user_id', '200', 'game_id');

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  client_at timestamptz,
  session_id text not null,
  visitor_id text,
  user_id uuid references auth.users (id) on delete set null,
  event text not null,
  game_id text,
  props jsonb not null default '{}'::jsonb,
  device text
);

alter table public.analytics_events drop constraint if exists analytics_session_check;
alter table public.analytics_events add constraint analytics_session_check check (session_id ~ '^[a-z0-9]{4,40}$');
alter table public.analytics_events drop constraint if exists analytics_visitor_check;
alter table public.analytics_events add constraint analytics_visitor_check check (visitor_id is null or visitor_id ~ '^[a-z0-9]{4,40}$');
alter table public.analytics_events drop constraint if exists analytics_event_check;
alter table public.analytics_events add constraint analytics_event_check check (event ~ '^[a-z0-9_]{1,40}$');
alter table public.analytics_events drop constraint if exists analytics_game_check;
alter table public.analytics_events add constraint analytics_game_check check (game_id is null or game_id ~ '^[a-z0-9][a-z0-9-]{0,39}$');
alter table public.analytics_events drop constraint if exists analytics_props_check;
alter table public.analytics_events add constraint analytics_props_check check (jsonb_typeof(props) = 'object' and octet_length(props::text) <= 4096);
alter table public.analytics_events drop constraint if exists analytics_device_check;
alter table public.analytics_events add constraint analytics_device_check check (device is null or device in ('phone', 'tablet', 'desktop'));

create index if not exists analytics_created_idx on public.analytics_events (created_at);
create index if not exists analytics_event_created_idx on public.analytics_events (event, created_at);
create index if not exists analytics_game_idx on public.analytics_events (game_id, event) where game_id is not null;
create index if not exists analytics_user_idx on public.analytics_events (user_id) where user_id is not null;

create table if not exists private.analytics_rate (
  k text not null,
  w timestamptz not null,
  n integer not null default 0,
  primary key (k, w)
);

create or replace function private.analytics_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz := date_trunc('hour', now());
  v_ip text := '';
  v_n integer;
begin
  new.created_at := now();
  if new.client_at is null or new.client_at > now() + interval '10 minutes' or new.client_at < now() - interval '30 days' then
    new.client_at := now();
  end if;
  begin
    v_ip := btrim(split_part(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ''), ',', 1));
  exception when others then
    v_ip := '';
  end;
  insert into private.analytics_rate as r (k, w, n) values ('s:' || new.session_id, v_window, 1)
    on conflict (k, w) do update set n = r.n + 1
    returning r.n into v_n;
  if v_n > 3000 then
    return null;
  end if;
  if v_ip <> '' then
    insert into private.analytics_rate as r (k, w, n) values ('i:' || md5(v_ip), v_window, 1)
      on conflict (k, w) do update set n = r.n + 1
      returning r.n into v_n;
    if v_n > 20000 then
      return null;
    end if;
  end if;
  if random() < 0.002 then
    delete from private.analytics_rate where w < now() - interval '3 hours';
  end if;
  if random() < 0.0002 then
    delete from public.analytics_events where created_at < now() - interval '2 years';
  end if;
  return new;
end;
$$;

drop trigger if exists analytics_guard on public.analytics_events;
create trigger analytics_guard before insert on public.analytics_events
  for each row execute function private.analytics_guard();

create table if not exists public.friend_requests (
  id bigint generated always as identity primary key,
  from_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  to_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (from_id, to_id)
);

alter table public.friend_requests drop constraint if exists friend_requests_status_check;
alter table public.friend_requests add constraint friend_requests_status_check check (status in ('pending', 'accepted', 'declined'));
alter table public.friend_requests drop constraint if exists friend_requests_self_check;
alter table public.friend_requests add constraint friend_requests_self_check check (from_id <> to_id);

create index if not exists friend_requests_to_idx on public.friend_requests (to_id, status);

drop trigger if exists friend_requests_touch on public.friend_requests;
create trigger friend_requests_touch before update on public.friend_requests
  for each row execute function private.touch_updated_at();
drop trigger if exists friend_requests_cap on public.friend_requests;
create trigger friend_requests_cap before insert on public.friend_requests
  for each row execute function private.cap_rows('from_id', '500');

create table if not exists public.friends (
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

alter table public.friends drop constraint if exists friends_self_check;
alter table public.friends add constraint friends_self_check check (user_id <> friend_id);
create index if not exists friends_friend_idx on public.friends (friend_id);

create table if not exists public.account_deletion_requests (
  user_id uuid primary key references auth.users (id) on delete cascade,
  requested_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.game_stats enable row level security;
alter table public.game_saves enable row level security;
alter table public.analytics_events enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friends enable row level security;
alter table public.account_deletion_requests enable row level security;
alter table private.sync_batches enable row level security;
alter table private.analytics_rate enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
drop policy if exists "profiles: read friends" on public.profiles;
create policy "profiles: read friends" on public.profiles for select to authenticated
  using (
    exists (select 1 from public.friends f where f.user_id = (select auth.uid()) and f.friend_id = profiles.id)
    or exists (select 1 from public.friend_requests r where (r.from_id = (select auth.uid()) and r.to_id = profiles.id) or (r.to_id = (select auth.uid()) and r.from_id = profiles.id))
  );
drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "game_stats: read own" on public.game_stats;
create policy "game_stats: read own" on public.game_stats for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "game_stats: insert own" on public.game_stats;
create policy "game_stats: insert own" on public.game_stats for insert to authenticated
  with check (user_id = (select auth.uid()));
drop policy if exists "game_stats: update own" on public.game_stats;
create policy "game_stats: update own" on public.game_stats for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "game_stats: delete own" on public.game_stats;
create policy "game_stats: delete own" on public.game_stats for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "game_saves: read own" on public.game_saves;
create policy "game_saves: read own" on public.game_saves for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "game_saves: insert own" on public.game_saves;
create policy "game_saves: insert own" on public.game_saves for insert to authenticated
  with check (user_id = (select auth.uid()));
drop policy if exists "game_saves: update own" on public.game_saves;
create policy "game_saves: update own" on public.game_saves for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "game_saves: delete own" on public.game_saves;
create policy "game_saves: delete own" on public.game_saves for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "analytics: insert anonymous" on public.analytics_events;
create policy "analytics: insert anonymous" on public.analytics_events for insert to anon
  with check (user_id is null);
drop policy if exists "analytics: insert signed in" on public.analytics_events;
create policy "analytics: insert signed in" on public.analytics_events for insert to authenticated
  with check (user_id is null or user_id = (select auth.uid()));

drop policy if exists "friend_requests: read own" on public.friend_requests;
create policy "friend_requests: read own" on public.friend_requests for select to authenticated
  using (from_id = (select auth.uid()) or to_id = (select auth.uid()));
drop policy if exists "friend_requests: delete own" on public.friend_requests;
create policy "friend_requests: delete own" on public.friend_requests for delete to authenticated
  using (from_id = (select auth.uid()) or to_id = (select auth.uid()));

drop policy if exists "friends: read own" on public.friends;
create policy "friends: read own" on public.friends for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.profiles, public.game_stats, public.game_saves, public.analytics_events, public.friend_requests, public.friends, public.account_deletion_requests from anon, authenticated;
revoke all on private.sync_batches, private.analytics_rate from anon, authenticated;
grant all on public.profiles, public.game_stats, public.game_saves, public.analytics_events, public.friend_requests, public.friends, public.account_deletion_requests to service_role;

grant select (id, username, display_name, avatar_url, created_at, updated_at) on public.profiles to authenticated;
grant insert (id, username, display_name, avatar_url) on public.profiles to authenticated;
grant update (username, display_name, avatar_url) on public.profiles to authenticated;

grant select, delete on public.game_stats to authenticated;

grant select, delete on public.game_saves to authenticated;
grant insert (user_id, game_id, data) on public.game_saves to authenticated;
grant update (user_id, game_id, data) on public.game_saves to authenticated;

grant insert (client_at, session_id, visitor_id, user_id, event, game_id, props, device) on public.analytics_events to anon, authenticated;

grant select, delete on public.friend_requests to authenticated;
grant select on public.friends to authenticated;

create or replace function public.username_available(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.username_ok(lower(p_name))
    and not exists (select 1 from public.profiles p where lower(p.username) = lower(p_name) and p.id is distinct from auth.uid());
$$;

drop function if exists public.find_profiles(text);

create or replace function public.search_profiles(prefix text)
returns table (username text, display_name text, avatar_url text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_q text := lower(btrim(coalesce(prefix, '')));
  v_n integer;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles where id = v_uid and locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  if char_length(v_q) < 2 or char_length(v_q) > 20 or v_q !~ '^[a-z0-9_.]+$' then
    return;
  end if;
  insert into private.analytics_rate as r (k, w, n) values ('q:' || v_uid::text, date_trunc('minute', now()), 1)
    on conflict (k, w) do update set n = r.n + 1
    returning r.n into v_n;
  if v_n > 120 then
    raise exception 'Too many searches' using errcode = '54000';
  end if;
  if random() < 0.01 then
    delete from private.analytics_rate where w < now() - interval '3 hours';
  end if;
  return query
    select p.username, p.display_name, p.avatar_url
    from public.profiles p
    where p.username is not null
      and p.id <> v_uid
      and lower(p.username) like replace(v_q, '_', '\_') || '%'
    order by lower(p.username) = v_q desc, char_length(p.username), lower(p.username)
    limit 20;
end;
$$;

create or replace function public.login_email(p_login text, p_password text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_key text := lower(btrim(coalesce(p_login, '')));
  v_ip text := '';
  v_n integer;
  v_email text;
  v_hash text;
begin
  if v_key !~ '^[a-z0-9_.]{3,20}$' or coalesce(p_password, '') = '' or char_length(p_password) > 200 then
    return null;
  end if;
  begin
    v_ip := btrim(split_part(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ''), ',', 1));
  exception when others then
    v_ip := '';
  end;
  insert into private.analytics_rate as r (k, w, n) values ('l:' || v_key, date_trunc('hour', now()) + floor(extract(minute from now()) / 15) * interval '15 minutes', 1)
    on conflict (k, w) do update set n = r.n + 1
    returning r.n into v_n;
  if v_n > 10 then
    raise exception 'Too many attempts' using errcode = '54000';
  end if;
  if v_ip <> '' then
    insert into private.analytics_rate as r (k, w, n) values ('li:' || md5(v_ip), date_trunc('hour', now()), 1)
      on conflict (k, w) do update set n = r.n + 1
      returning r.n into v_n;
    if v_n > 100 then
      raise exception 'Too many attempts' using errcode = '54000';
    end if;
  end if;
  select u.email, u.encrypted_password into v_email, v_hash
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = v_key and u.deleted_at is null;
  if v_email is null or coalesce(v_hash, '') = '' then
    return null;
  end if;
  if extensions.crypt(p_password, v_hash) <> v_hash then
    return null;
  end if;
  return v_email;
end;
$$;

create or replace function public.send_friend_request(p_username text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_to uuid;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles where id = v_uid and locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  select id into v_to from public.profiles where lower(username) = lower(btrim(coalesce(p_username, '')));
  if v_to is null then
    return 'not_found';
  end if;
  if v_to = v_uid then
    return 'self';
  end if;
  if exists (select 1 from public.friends where user_id = v_uid and friend_id = v_to) then
    return 'already_friends';
  end if;
  if exists (select 1 from public.friend_requests where from_id = v_to and to_id = v_uid and status = 'pending') then
    update public.friend_requests set status = 'accepted' where from_id = v_to and to_id = v_uid;
    insert into public.friends (user_id, friend_id) values (v_uid, v_to), (v_to, v_uid) on conflict do nothing;
    return 'accepted';
  end if;
  insert into public.friend_requests (from_id, to_id) values (v_uid, v_to)
    on conflict (from_id, to_id) do update set status = 'pending' where public.friend_requests.status = 'declined';
  return 'sent';
end;
$$;

create or replace function public.respond_friend_request(p_id bigint, p_accept boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_from uuid;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  select from_id into v_from from public.friend_requests where id = p_id and to_id = v_uid and status = 'pending';
  if v_from is null then
    return 'not_found';
  end if;
  if p_accept then
    update public.friend_requests set status = 'accepted' where id = p_id;
    insert into public.friends (user_id, friend_id) values (v_uid, v_from), (v_from, v_uid) on conflict do nothing;
    return 'accepted';
  end if;
  update public.friend_requests set status = 'declined' where id = p_id;
  return 'declined';
end;
$$;

create or replace function public.remove_friend(p_friend uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  delete from public.friends where (user_id = v_uid and friend_id = p_friend) or (user_id = p_friend and friend_id = v_uid);
  delete from public.friend_requests where (from_id = v_uid and to_id = p_friend) or (from_id = p_friend and to_id = v_uid);
end;
$$;

create or replace function public.my_friends()
returns table (friend_id uuid, username text, display_name text, avatar_url text, since timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select f.friend_id, p.username, p.display_name, p.avatar_url, f.created_at
  from public.friends f
  join public.profiles p on p.id = f.friend_id
  where f.user_id = auth.uid()
  order by lower(coalesce(p.display_name, p.username));
$$;

create or replace function public.my_friend_requests()
returns table (id bigint, direction text, other_id uuid, username text, display_name text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id,
    case when r.to_id = auth.uid() then 'incoming' else 'outgoing' end,
    case when r.to_id = auth.uid() then r.from_id else r.to_id end,
    p.username, p.display_name, r.created_at
  from public.friend_requests r
  join public.profiles p on p.id = case when r.to_id = auth.uid() then r.from_id else r.to_id end
  where r.status = 'pending' and (r.to_id = auth.uid() or r.from_id = auth.uid())
  order by r.created_at desc;
$$;

create or replace function public.export_my_data()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at, 'providers', u.raw_app_meta_data -> 'providers') from auth.users u where u.id = auth.uid()),
    'profile', (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
    'game_stats', coalesce((select jsonb_agg(to_jsonb(s) order by s.game_id) from public.game_stats s where s.user_id = auth.uid()), '[]'::jsonb),
    'game_saves', coalesce((select jsonb_agg(to_jsonb(s) order by s.game_id) from public.game_saves s where s.user_id = auth.uid()), '[]'::jsonb),
    'friends', coalesce((select jsonb_agg(to_jsonb(f)) from public.my_friends() f), '[]'::jsonb),
    'friend_requests', coalesce((select jsonb_agg(to_jsonb(r)) from public.my_friend_requests() r), '[]'::jsonb),
    'analytics_events', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at) from (select created_at, session_id, event, game_id, props, device from public.analytics_events where user_id = auth.uid() order by created_at desc limit 20000) e), '[]'::jsonb)
  )
  where auth.uid() is not null;
$$;

create or replace function public.delete_my_account()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  delete from public.game_saves where user_id = v_uid;
  delete from public.game_stats where user_id = v_uid;
  delete from public.friends where user_id = v_uid or friend_id = v_uid;
  delete from public.friend_requests where from_id = v_uid or to_id = v_uid;
  update public.analytics_events set user_id = null where user_id = v_uid;
  begin
    delete from auth.users where id = v_uid;
    return 'deleted';
  exception when insufficient_privilege then
    update public.profiles set username = null, display_name = null, avatar_url = null where id = v_uid;
    insert into public.account_deletion_requests (user_id) values (v_uid) on conflict (user_id) do nothing;
    return 'requested';
  end;
end;
$$;

revoke all on function public.username_available(text) from public;
revoke all on function public.search_profiles(text) from public;
revoke all on function public.login_email(text, text) from public;
revoke all on function public.sync_game_stats(uuid, jsonb) from public;
revoke all on function public.send_friend_request(text) from public;
revoke all on function public.respond_friend_request(bigint, boolean) from public;
revoke all on function public.remove_friend(uuid) from public;
revoke all on function public.my_friends() from public;
revoke all on function public.my_friend_requests() from public;
revoke all on function public.export_my_data() from public;
revoke all on function public.delete_my_account() from public;
revoke all on function public.username_available(text) from anon, authenticated;
revoke all on function public.search_profiles(text) from anon, authenticated;
revoke all on function public.login_email(text, text) from anon, authenticated;
revoke all on function public.sync_game_stats(uuid, jsonb) from anon, authenticated;
revoke all on function public.send_friend_request(text) from anon, authenticated;
revoke all on function public.respond_friend_request(bigint, boolean) from anon, authenticated;
revoke all on function public.remove_friend(uuid) from anon, authenticated;
revoke all on function public.my_friends() from anon, authenticated;
revoke all on function public.my_friend_requests() from anon, authenticated;
revoke all on function public.export_my_data() from anon, authenticated;
revoke all on function public.delete_my_account() from anon, authenticated;

grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.search_profiles(text) to authenticated;
grant execute on function public.login_email(text, text) to anon, authenticated;
grant execute on function public.sync_game_stats(uuid, jsonb) to authenticated;
grant execute on function public.send_friend_request(text) to authenticated;
grant execute on function public.respond_friend_request(bigint, boolean) to authenticated;
grant execute on function public.remove_friend(uuid) to authenticated;
grant execute on function public.my_friends() to authenticated;
grant execute on function public.my_friend_requests() to authenticated;
grant execute on function public.export_my_data() to authenticated;
grant execute on function public.delete_my_account() to authenticated;

revoke all on all functions in schema private from public, anon, authenticated;

drop view if exists admin.overview;
drop view if exists admin.daily_active_users;
drop view if exists admin.most_played_games;
drop view if exists admin.most_time_played;
drop view if exists admin.account_game_totals;
drop view if exists admin.retention;
drop view if exists admin.signups_daily;
drop view if exists admin.top_searches;
drop view if exists admin.recent_errors;
drop view if exists admin.devices;
drop view if exists admin.pending_account_deletions;
drop view if exists admin.events_who;

create view admin.events_who with (security_invoker = true) as
select e.*,
  coalesce(e.visitor_id, e.user_id::text, e.session_id) as who,
  (e.created_at at time zone 'Europe/Paris')::date as day
from public.analytics_events e;

create view admin.daily_active_users with (security_invoker = true) as
select day,
  count(distinct who) as active_players,
  count(distinct user_id) as signed_in_players,
  count(distinct session_id) as sessions,
  count(*) filter (where event = 'game_launch') as game_launches,
  round(coalesce(sum(case when event = 'game_time' and jsonb_typeof(props -> 'sec') = 'number' then (props ->> 'sec')::numeric end), 0) / 3600, 2) as hours_played,
  count(*) as events
from admin.events_who
group by day
order by day desc;

create view admin.most_played_games with (security_invoker = true) as
select game_id,
  count(*) filter (where event = 'game_launch') as launches,
  count(*) filter (where event = 'game_play') as plays,
  count(distinct who) filter (where event in ('game_launch', 'game_play')) as players,
  count(*) filter (where event = 'game_launch' and created_at > now() - interval '7 days') as launches_7d,
  count(*) filter (where event = 'game_launch' and created_at > now() - interval '30 days') as launches_30d,
  count(*) filter (where event = 'game_open') as page_opens,
  count(*) filter (where event = 'tile_click') as tile_clicks,
  max(created_at) as last_launch
from admin.events_who
where game_id is not null and event in ('game_launch', 'game_play', 'game_open', 'tile_click')
group by game_id
order by launches desc, plays desc;

create view admin.most_time_played with (security_invoker = true) as
select game_id,
  round(sum((props ->> 'sec')::numeric) / 3600, 2) as hours,
  round(coalesce(sum((props ->> 'sec')::numeric) filter (where created_at > now() - interval '7 days'), 0) / 3600, 2) as hours_7d,
  count(distinct who) as players,
  round(avg((props ->> 'sec')::numeric) / 60, 1) as avg_minutes_per_visit
from admin.events_who
where event = 'game_time' and game_id is not null and jsonb_typeof(props -> 'sec') = 'number'
group by game_id
order by hours desc;

create view admin.account_game_totals with (security_invoker = true) as
select game_id,
  count(*) as accounts,
  sum(plays) as plays,
  round((sum(seconds_played) / 3600)::numeric, 2) as hours,
  max(last_played) as last_played
from public.game_stats
group by game_id
order by plays desc;

create view admin.retention with (security_invoker = true) as
with active as (
  select coalesce(visitor_id, user_id::text) as who, day
  from admin.events_who
  where coalesce(visitor_id, user_id::text) is not null
  group by 1, 2
), firsts as (
  select who, min(day) as first_day from active group by who
)
select f.first_day as cohort_day,
  count(*) as new_players,
  round(100.0 * count(*) filter (where exists (select 1 from active a where a.who = f.who and a.day = f.first_day + 1)) / count(*), 1) as day1_pct,
  round(100.0 * count(*) filter (where exists (select 1 from active a where a.who = f.who and a.day = f.first_day + 7)) / count(*), 1) as day7_pct,
  round(100.0 * count(*) filter (where exists (select 1 from active a where a.who = f.who and a.day = f.first_day + 30)) / count(*), 1) as day30_pct,
  round(100.0 * count(*) filter (where exists (select 1 from active a where a.who = f.who and a.day > f.first_day and a.day <= f.first_day + 7)) / count(*), 1) as back_within_7d_pct
from firsts f
group by f.first_day
order by cohort_day desc;

create view admin.signups_daily with (security_invoker = true) as
select (u.created_at at time zone 'Europe/Paris')::date as day,
  count(*) as signups,
  count(*) filter (where u.raw_app_meta_data ->> 'provider' = 'google') as with_google,
  count(*) filter (where u.raw_app_meta_data ->> 'provider' = 'email') as with_email,
  count(*) filter (where u.email_confirmed_at is not null) as confirmed
from auth.users u
group by 1
order by 1 desc;

create view admin.top_searches with (security_invoker = true) as
select props ->> 'q' as query,
  count(*) as searches,
  count(*) filter (where jsonb_typeof(props -> 'n') = 'number' and (props ->> 'n')::numeric = 0) as with_no_results,
  max(created_at) as last_searched
from public.analytics_events
where event = 'search' and props ? 'q'
group by 1
order by searches desc;

create view admin.recent_errors with (security_invoker = true) as
select created_at, game_id, props ->> 'where' as place, props ->> 'msg' as message, device, session_id
from public.analytics_events
where event = 'error'
order by created_at desc
limit 500;

create view admin.devices with (security_invoker = true) as
select coalesce(device, 'unknown') as device,
  props ->> 'os' as os,
  props ->> 'browser' as browser,
  count(*) as sessions
from public.analytics_events
where event = 'session'
group by 1, 2, 3
order by sessions desc;

create view admin.pending_account_deletions with (security_invoker = true) as
select r.user_id, u.email, r.requested_at
from public.account_deletion_requests r
left join auth.users u on u.id = r.user_id
order by r.requested_at;

create view admin.overview with (security_invoker = true) as
select
  (select count(*) from auth.users) as accounts,
  (select count(*) from auth.users where created_at > now() - interval '7 days') as new_accounts_7d,
  (select count(*) from public.profiles where username is not null) as accounts_with_username,
  (select count(*) from public.analytics_events) as events,
  (select count(distinct who) from admin.events_who where day = (now() at time zone 'Europe/Paris')::date) as active_today,
  (select count(distinct who) from admin.events_who where created_at > now() - interval '7 days') as active_7d,
  (select count(distinct who) from admin.events_who where created_at > now() - interval '30 days') as active_30d,
  (select count(*) from public.analytics_events where event = 'game_launch' and created_at > now() - interval '7 days') as launches_7d,
  (select round(coalesce(sum((props ->> 'sec')::numeric), 0) / 3600, 1) from public.analytics_events where event = 'game_time' and jsonb_typeof(props -> 'sec') = 'number' and created_at > now() - interval '7 days') as hours_played_7d;

create or replace function admin.top_games(p_days integer default 7)
returns table (game_id text, launches bigint, players bigint, hours numeric)
language sql
stable
set search_path = ''
as $$
  select e.game_id,
    count(*) filter (where e.event = 'game_launch'),
    count(distinct coalesce(e.visitor_id, e.user_id::text, e.session_id)),
    round(coalesce(sum(case when e.event = 'game_time' and jsonb_typeof(e.props -> 'sec') = 'number' then (e.props ->> 'sec')::numeric end), 0) / 3600, 2)
  from public.analytics_events e
  where e.game_id is not null and e.created_at > now() - make_interval(days => greatest(1, p_days))
  group by e.game_id
  order by 2 desc, 4 desc;
$$;

revoke all on all tables in schema admin from public, anon, authenticated;
revoke all on all functions in schema admin from public, anon, authenticated;

create or replace function private.over(p_key text, p_window timestamptz, p_max integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_n integer;
begin
  insert into private.analytics_rate as r (k, w, n) values (p_key, p_window, 1)
    on conflict (k, w) do update set n = r.n + 1
    returning r.n into v_n;
  return v_n > p_max;
end;
$$;

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
  if not exists (select 1 from public.profiles p where p.id = v_uid and p.role = 'admin' and not p.locked) then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  return v_uid;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and not p.locked);
$$;

drop function if exists public.my_status();
create or replace function public.my_status()
returns table (role text, locked boolean, locked_reason text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.role, p.locked, p.locked_reason from public.profiles p where p.id = auth.uid();
$$;

drop function if exists public.touch_presence(text,text);
create or replace function public.touch_presence(p_lang text default null, p_game text default null)
returns table (role text, locked boolean, locked_reason text)
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
  if not private.over('pr:' || v_uid::text, date_trunc('minute', now()), 30) then
    update public.profiles p set last_seen = now(), last_lang = coalesce(v_lang, p.last_lang), last_game = coalesce(v_game, p.last_game) where p.id = v_uid;
  end if;
  return query select p.role, p.locked, p.locked_reason from public.profiles p where p.id = v_uid;
end;
$$;

drop function if exists public.admin_list_users();
create or replace function public.admin_list_users()
returns table (id uuid, created_at timestamptz, last_sign_in_at timestamptz, last_seen timestamptz, providers text[], email_confirmed boolean, email_confirmed_at timestamptz, last_lang text, last_game text, role text, email text, username text, display_name text, friends integer, fav_game text, locked boolean, locked_reason text)
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
      coalesce(p.locked, false), p.locked_reason
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
      locked_reason = case when coalesce(p_locked, false) then private.clean_text(p_reason, 500) end
    where p.id = p_uid;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  return coalesce(p_locked, false);
end;
$$;

create table if not exists public.tickets (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tickets drop constraint if exists tickets_subject_check;
alter table public.tickets add constraint tickets_subject_check check (char_length(subject) between 1 and 120 and subject !~ '[[:cntrl:]]');
alter table public.tickets drop constraint if exists tickets_status_check;
alter table public.tickets add constraint tickets_status_check check (status in ('open', 'closed'));
create index if not exists tickets_user_idx on public.tickets (user_id, updated_at desc);
create index if not exists tickets_status_idx on public.tickets (status, updated_at desc);

create table if not exists public.ticket_messages (
  id bigint generated always as identity primary key,
  ticket_id bigint not null references public.tickets (id) on delete cascade,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  body text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.ticket_messages drop constraint if exists ticket_messages_body_check;
alter table public.ticket_messages add constraint ticket_messages_body_check check (char_length(body) between 1 and 2000);
create index if not exists ticket_messages_ticket_idx on public.ticket_messages (ticket_id, id);

create or replace function private.ticket_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  new.subject := private.clean_text(new.subject, 120);
  if new.subject is null then
    raise exception 'Write a subject' using errcode = '22023';
  end if;
  if v_uid is null then
    return new;
  end if;
  new.user_id := v_uid;
  new.status := 'open';
  new.created_at := now();
  new.updated_at := now();
  if private.over('tk:' || v_uid::text, date_trunc('hour', now()), 5) then
    raise exception 'Too many tickets' using errcode = '54000';
  end if;
  return new;
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
  return new;
end;
$$;

drop trigger if exists tickets_guard on public.tickets;
create trigger tickets_guard before insert on public.tickets
  for each row execute function private.ticket_guard();
drop trigger if exists tickets_cap on public.tickets;
create trigger tickets_cap before insert on public.tickets
  for each row execute function private.cap_rows('user_id', '100');
drop trigger if exists ticket_messages_guard on public.ticket_messages;
create trigger ticket_messages_guard before insert on public.ticket_messages
  for each row execute function private.ticket_message_guard();
drop trigger if exists ticket_messages_cap on public.ticket_messages;

alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;

drop policy if exists "tickets: read own or admin" on public.tickets;
create policy "tickets: read own or admin" on public.tickets for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "tickets: insert own" on public.tickets;
create policy "tickets: insert own" on public.tickets for insert to authenticated
  with check (user_id = (select auth.uid()));
drop policy if exists "tickets: update own or admin" on public.tickets;
create policy "tickets: update own or admin" on public.tickets for update to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));
drop policy if exists "ticket_messages: read own or admin" on public.ticket_messages;
create policy "ticket_messages: read own or admin" on public.ticket_messages for select to authenticated
  using (exists (select 1 from public.tickets t where t.id = ticket_messages.ticket_id and (t.user_id = (select auth.uid()) or (select public.is_admin()))));
drop policy if exists "ticket_messages: insert own or admin" on public.ticket_messages;
create policy "ticket_messages: insert own or admin" on public.ticket_messages for insert to authenticated
  with check (author_id = (select auth.uid()) and exists (select 1 from public.tickets t where t.id = ticket_messages.ticket_id and (t.user_id = (select auth.uid()) or (select public.is_admin()))));

revoke all on public.tickets, public.ticket_messages from anon, authenticated;
grant all on public.tickets, public.ticket_messages to service_role;
grant select on public.tickets, public.ticket_messages to authenticated;
grant insert (subject) on public.tickets to authenticated;
grant update (status) on public.tickets to authenticated;
grant insert (ticket_id, body) on public.ticket_messages to authenticated;

create or replace function public.ticket_create(p_subject text, p_body text)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  insert into public.tickets (user_id, subject) values (v_uid, p_subject) returning id into v_id;
  insert into public.ticket_messages (ticket_id, body) values (v_id, p_body);
  return v_id;
end;
$$;

create or replace function public.ticket_send(p_ticket bigint, p_body text)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_id bigint;
begin
  if auth.uid() is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  insert into public.ticket_messages (ticket_id, body) values (p_ticket, p_body) returning id into v_id;
  return v_id;
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
  return p_status;
end;
$$;

create or replace function public.my_tickets()
returns table (id bigint, subject text, status text, created_at timestamptz, updated_at timestamptz, messages integer, last_admin boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select t.id, t.subject, t.status, t.created_at, t.updated_at,
    (select count(*)::integer from public.ticket_messages m where m.ticket_id = t.id),
    coalesce((select m.is_admin from public.ticket_messages m where m.ticket_id = t.id order by m.id desc limit 1), false)
  from public.tickets t
  where t.user_id = auth.uid()
  order by t.status = 'open' desc, t.updated_at desc
  limit 200;
$$;

create or replace function public.admin_tickets()
returns table (id bigint, user_id uuid, username text, display_name text, email text, locked boolean, subject text, status text, created_at timestamptz, updated_at timestamptz, messages integer, last_admin boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  return query
    select t.id, t.user_id, p.username, p.display_name, u.email::text, coalesce(p.locked, false), t.subject, t.status, t.created_at, t.updated_at,
      (select count(*)::integer from public.ticket_messages m where m.ticket_id = t.id),
      coalesce((select m.is_admin from public.ticket_messages m where m.ticket_id = t.id order by m.id desc limit 1), false)
    from public.tickets t
    left join public.profiles p on p.id = t.user_id
    left join auth.users u on u.id = t.user_id
    order by t.status = 'open' desc, t.updated_at desc
    limit 1000;
end;
$$;

drop function if exists public.ticket_thread(bigint);
create or replace function public.ticket_thread(p_ticket bigint)
returns table (id bigint, body text, is_admin boolean, mine boolean, author text, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_admin boolean := public.is_admin();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if not exists (select 1 from public.tickets t where t.id = p_ticket and (t.user_id = v_uid or v_admin)) then
    raise exception 'Ticket not found' using errcode = 'P0002';
  end if;
  return query
    select m.id, m.body, m.is_admin, m.author_id = v_uid,
      case when v_admin then coalesce(p.username, p.display_name) end,
      m.created_at
    from public.ticket_messages m
    left join public.profiles p on p.id = m.author_id
    where m.ticket_id = p_ticket
    order by m.id
    limit 500;
end;
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.my_status() from public, anon, authenticated;
revoke all on function public.touch_presence(text, text) from public, anon, authenticated;
revoke all on function public.admin_list_users() from public, anon, authenticated;
revoke all on function public.admin_set_role(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_set_password(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_lock(uuid, boolean, text) from public, anon, authenticated;
revoke all on function public.ticket_create(text, text) from public, anon, authenticated;
revoke all on function public.ticket_send(bigint, text) from public, anon, authenticated;
revoke all on function public.ticket_set_status(bigint, text) from public, anon, authenticated;
revoke all on function public.my_tickets() from public, anon, authenticated;
revoke all on function public.admin_tickets() from public, anon, authenticated;
revoke all on function public.ticket_thread(bigint) from public, anon, authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_status() to authenticated;
grant execute on function public.touch_presence(text, text) to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_set_password(uuid, text) to authenticated;
grant execute on function public.admin_lock(uuid, boolean, text) to authenticated;
grant execute on function public.ticket_create(text, text) to authenticated;
grant execute on function public.ticket_send(bigint, text) to authenticated;
grant execute on function public.ticket_set_status(bigint, text) to authenticated;
grant execute on function public.my_tickets() to authenticated;
grant execute on function public.admin_tickets() to authenticated;
grant execute on function public.ticket_thread(bigint) to authenticated;

revoke all on all functions in schema private from public, anon, authenticated;

drop function if exists public.admin_list_users();
create or replace function public.admin_list_users()
returns table (id uuid, created_at timestamptz, last_sign_in_at timestamptz, last_seen timestamptz, providers text[], email_confirmed boolean, email_confirmed_at timestamptz, last_lang text, last_game text, role text, email text, username text, display_name text, friends integer, fav_game text, locked boolean, locked_reason text, has_password boolean, seconds_played bigint, plays bigint)
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
      coalesce(p.locked, false), p.locked_reason,
      coalesce(u.encrypted_password, '') <> '',
      (select coalesce(sum(s.seconds_played), 0)::bigint from public.game_stats s where s.user_id = u.id),
      (select coalesce(sum(s.plays), 0)::bigint from public.game_stats s where s.user_id = u.id)
    from auth.users u
    left join public.profiles p on p.id = u.id
    where u.deleted_at is null
    order by u.created_at desc
    limit 10000;
end;
$$;

create or replace function public.admin_user_games(p_uid uuid)
returns table (game_id text, plays integer, seconds_played integer, best_score double precision, last_played timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  return query select s.game_id, s.plays::integer, s.seconds_played::integer, s.best_score::double precision, s.last_played from public.game_stats s where s.user_id = p_uid order by s.seconds_played desc, s.plays desc;
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
  update public.profiles p set username = v_name where p.id = p_uid;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  return v_name;
end;
$$;

create table if not exists public.dms (
  id bigint generated always as identity primary key,
  from_id uuid not null references auth.users (id) on delete cascade,
  to_id uuid not null references auth.users (id) on delete cascade,
  kind text not null default 'text' check (kind in ('text', 'image', 'invite', 'join')),
  body text check (body is null or char_length(body) <= 2000),
  meta jsonb not null default '{}'::jsonb check (pg_column_size(meta) <= 4096),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists dms_pair_idx on public.dms (least(from_id, to_id), greatest(from_id, to_id), id desc);
create index if not exists dms_unread_idx on public.dms (to_id) where read_at is null;
alter table public.dms enable row level security;
revoke all on public.dms from anon, authenticated;
grant all on public.dms to service_role;

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
  update public.analytics_events set user_id = null where user_id = p_uid;
  delete from public.dms where from_id = p_uid or to_id = p_uid;
  delete from public.friends where user_id = p_uid or friend_id = p_uid;
  delete from public.friend_requests where from_id = p_uid or to_id = p_uid;
  delete from auth.users where id = p_uid;
  return 'deleted';
end;
$$;

create or replace function public.dm_send(p_to uuid, p_kind text, p_body text default null, p_meta jsonb default '{}'::jsonb)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_kind text := coalesce(p_kind, 'text');
  v_body text;
  v_meta jsonb := '{}'::jsonb;
  v_id bigint;
begin
  if v_me is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles p where p.id = v_me and p.locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  if not exists (select 1 from public.friends f where f.user_id = v_me and f.friend_id = p_to) then
    raise exception 'Not friends' using errcode = '42501';
  end if;
  if private.over('dm:' || v_me::text, date_trunc('minute', now()), 40) then
    raise exception 'Too many messages' using errcode = '54000';
  end if;
  if v_kind = 'text' then
    v_body := left(btrim(regexp_replace(coalesce(p_body, ''), '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g')), 2000);
    if v_body = '' then
      raise exception 'Write a message' using errcode = '22023';
    end if;
  elsif v_kind = 'image' then
    if coalesce(p_meta ->> 'path', '') !~ ('^' || v_me::text || '/' || p_to::text || '/[a-z0-9-]{8,64}\.(webp|jpg|png|gif)$') then
      raise exception 'Bad image' using errcode = '22023';
    end if;
    v_meta := jsonb_build_object('path', p_meta ->> 'path', 'w', least(greatest(coalesce((p_meta ->> 'w')::int, 0), 0), 8000), 'h', least(greatest(coalesce((p_meta ->> 'h')::int, 0), 0), 8000));
  elsif v_kind in ('invite', 'join') then
    if coalesce(p_meta ->> 'game', '') !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
      raise exception 'Bad game' using errcode = '22023';
    end if;
    if v_kind = 'invite' and coalesce(p_meta ->> 'code', '') !~ '^[A-Z0-9]{3,8}$' then
      raise exception 'Bad code' using errcode = '22023';
    end if;
    v_meta := jsonb_build_object('game', p_meta ->> 'game') || case when v_kind = 'invite' then jsonb_build_object('code', p_meta ->> 'code') else '{}'::jsonb end;
  else
    raise exception 'Bad kind' using errcode = '22023';
  end if;
  insert into public.dms (from_id, to_id, kind, body, meta) values (v_me, p_to, v_kind, v_body, v_meta) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.dm_thread(p_with uuid, p_after bigint default 0)
returns table (id bigint, mine boolean, kind text, body text, meta jsonb, created_at timestamptz, read_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select * from (
    select d.id, d.from_id = auth.uid(), d.kind, d.body, d.meta, d.created_at, d.read_at
    from public.dms d
    where auth.uid() is not null
      and ((d.from_id = auth.uid() and d.to_id = p_with) or (d.to_id = auth.uid() and d.from_id = p_with))
      and d.id > coalesce(p_after, 0)
    order by d.id desc
    limit 200
  ) t order by t.id;
$$;

create or replace function public.dm_read(p_with uuid)
returns integer
language sql
volatile
security definer
set search_path = ''
as $$
  with u as (update public.dms d set read_at = now() where d.to_id = auth.uid() and d.from_id = p_with and d.read_at is null returning 1)
  select count(*)::integer from u;
$$;

drop function if exists public.dm_inbox();
create or replace function public.dm_inbox()
returns table (other_id uuid, last_id bigint, last_kind text, last_body text, last_mine boolean, last_at timestamptz, unread integer, last_meta jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select o.other_id, l.id, l.kind, l.body, l.from_id = auth.uid(), l.created_at,
    (select count(*)::integer from public.dms x where x.to_id = auth.uid() and x.from_id = o.other_id and x.read_at is null),
    l.meta
  from (
    select distinct case when d.from_id = auth.uid() then d.to_id else d.from_id end as other_id
    from public.dms d where auth.uid() is not null and (d.from_id = auth.uid() or d.to_id = auth.uid())
  ) o
  cross join lateral (
    select d.* from public.dms d
    where (d.from_id = auth.uid() and d.to_id = o.other_id) or (d.to_id = auth.uid() and d.from_id = o.other_id)
    order by d.id desc limit 1
  ) l
  order by l.id desc;
$$;

create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  return jsonb_build_object(
    'overview', (select to_jsonb(o) from admin.overview o),
    'daily', coalesce((select jsonb_agg(to_jsonb(d) order by d.day) from (select * from admin.daily_active_users order by day desc limit 30) d), '[]'::jsonb),
    'signups', coalesce((select jsonb_agg(to_jsonb(s) order by s.day) from (select * from admin.signups_daily order by day desc limit 30) s), '[]'::jsonb),
    'games', coalesce((select jsonb_agg(to_jsonb(g)) from (
      select coalesce(m.game_id, t.game_id, e.game_id, a.game_id) as game_id,
        coalesce(m.launches, 0) as launches, coalesce(m.plays, 0) as plays, coalesce(m.players, 0) as players,
        coalesce(m.launches_7d, 0) as launches_7d, coalesce(t.hours, 0) as hours, coalesce(t.hours_7d, 0) as hours_7d,
        coalesce(t.avg_minutes_per_visit, 0) as avg_min, coalesce(e.errors, 0) as errors, coalesce(e.errors_7d, 0) as errors_7d,
        e.last_error, e.last_error_at, coalesce(a.accounts, 0) as accounts, m.last_launch
      from admin.most_played_games m
      full join admin.most_time_played t on t.game_id = m.game_id
      full join (
        select x.game_id, count(*) as errors, count(*) filter (where x.created_at > now() - interval '7 days') as errors_7d,
          (array_agg(x.props ->> 'msg' order by x.created_at desc))[1] as last_error, max(x.created_at) as last_error_at
        from public.analytics_events x where x.event = 'error' and x.game_id is not null group by x.game_id
      ) e on e.game_id = coalesce(m.game_id, t.game_id)
      full join admin.account_game_totals a on a.game_id = coalesce(m.game_id, t.game_id, e.game_id)
    ) g), '[]'::jsonb),
    'players', coalesce((select jsonb_agg(to_jsonb(p)) from (
      select s.user_id, pr.username, pr.display_name, s.game_id, s.plays, s.seconds_played, s.best_score, s.last_played
      from public.game_stats s left join public.profiles pr on pr.id = s.user_id
      order by s.seconds_played desc limit 300
    ) p), '[]'::jsonb),
    'errors', coalesce((select jsonb_agg(to_jsonb(r)) from (select * from admin.recent_errors limit 60) r), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(to_jsonb(d)) from (select * from admin.devices limit 20) d), '[]'::jsonb),
    'searches', coalesce((select jsonb_agg(to_jsonb(q)) from (select * from admin.top_searches limit 25) q), '[]'::jsonb),
    'retention', coalesce((select jsonb_agg(to_jsonb(r)) from (select * from admin.retention limit 14) r), '[]'::jsonb),
    'at', now()
  );
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dm', 'dm', false, 3145728, array['image/webp', 'image/jpeg', 'image/png', 'image/gif'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "dm: upload to friend" on storage.objects;
create policy "dm: upload to friend" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'dm'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.friends f where f.user_id = (select auth.uid()) and f.friend_id::text = (storage.foldername(name))[2])
    and not exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.locked)
  );
drop policy if exists "dm: read own conversations" on storage.objects;
create policy "dm: read own conversations" on storage.objects for select to authenticated
  using (bucket_id = 'dm' and (select auth.uid())::text in ((storage.foldername(name))[1], (storage.foldername(name))[2]));

revoke all on function public.admin_list_users() from public, anon, authenticated;
revoke all on function public.admin_user_games(uuid) from public, anon, authenticated;
revoke all on function public.admin_set_username(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_delete_user(uuid) from public, anon, authenticated;
revoke all on function public.admin_stats() from public, anon, authenticated;
revoke all on function public.dm_send(uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.dm_thread(uuid, bigint) from public, anon, authenticated;
revoke all on function public.dm_read(uuid) from public, anon, authenticated;
revoke all on function public.dm_inbox() from public, anon, authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_user_games(uuid) to authenticated;
grant execute on function public.admin_set_username(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.dm_send(uuid, text, text, jsonb) to authenticated;
grant execute on function public.dm_thread(uuid, bigint) to authenticated;
grant execute on function public.dm_read(uuid) to authenticated;
grant execute on function public.dm_inbox() to authenticated;

create table if not exists public.presence_samples (
  at timestamptz primary key,
  online integer not null check (online between 0 and 1000000)
);
alter table public.presence_samples enable row level security;
revoke all on public.presence_samples from anon, authenticated;
grant all on public.presence_samples to service_role;

create or replace function public.admin_presence_sample(p_online integer)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_at timestamptz := to_timestamp(floor(extract(epoch from now()) / 300) * 300);
begin
  perform private.need_admin();
  insert into public.presence_samples as s (at, online) values (v_at, greatest(0, least(coalesce(p_online, 0), 1000000)))
    on conflict (at) do update set online = greatest(s.online, excluded.online);
  if random() < 0.01 then
    delete from public.presence_samples where at < now() - interval '2 years';
  end if;
  return true;
end;
$$;

create or replace function public.admin_stats_v2(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 366));
  v_to date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_to - (v_days - 1);
  v_since timestamptz := (v_from::timestamp at time zone 'Europe/Paris');
begin
  perform private.need_admin();
  return public.admin_stats() || jsonb_build_object(
    'days', v_days,
    'series', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day', d.day,
        'active', coalesce(e.active, 0),
        'signed_in', coalesce(e.signed_in, 0),
        'sessions', coalesce(e.sessions, 0),
        'launches', coalesce(e.launches, 0),
        'hours', coalesce(e.hours, 0),
        'signups', coalesce(s.signups, 0),
        'peak', p.peak
      ) order by d.day)
      from (select generate_series(v_from, v_to, interval '1 day')::date as day) d
      left join (
        select w.day,
          count(distinct w.who) as active,
          count(distinct w.user_id) as signed_in,
          count(distinct w.session_id) as sessions,
          count(*) filter (where w.event = 'game_launch') as launches,
          round(coalesce(sum(case when w.event = 'game_time' and jsonb_typeof(w.props -> 'sec') = 'number' then (w.props ->> 'sec')::numeric end), 0) / 3600, 2) as hours
        from admin.events_who w
        where w.created_at >= v_since
        group by w.day
      ) e on e.day = d.day
      left join (
        select (u.created_at at time zone 'Europe/Paris')::date as day, count(*) as signups
        from auth.users u
        where u.created_at >= v_since
        group by 1
      ) s on s.day = d.day
      left join (
        select (x.at at time zone 'Europe/Paris')::date as day, max(x.online) as peak
        from public.presence_samples x
        where x.at >= v_since
        group by 1
      ) p on p.day = d.day
    ), '[]'::jsonb),
    'game_days', coalesce((
      select jsonb_object_agg(g.game_id, g.days)
      from (
        select k.game_id, jsonb_agg(coalesce(c.n, 0) order by d.day) as days
        from (select distinct a.game_id from public.analytics_events a where a.event = 'game_launch' and a.game_id is not null and a.created_at >= v_since) k
        cross join (select generate_series(v_from, v_to, interval '1 day')::date as day) d
        left join (
          select a.game_id, (a.created_at at time zone 'Europe/Paris')::date as day, count(*) as n
          from public.analytics_events a
          where a.event = 'game_launch' and a.game_id is not null and a.created_at >= v_since
          group by 1, 2
        ) c on c.game_id = k.game_id and c.day = d.day
        group by k.game_id
      ) g
    ), '{}'::jsonb),
    'game_hours', coalesce((
      select jsonb_object_agg(h.game_id, h.hours)
      from (
        select a.game_id, round(sum((a.props ->> 'sec')::numeric) / 3600, 2) as hours
        from public.analytics_events a
        where a.event = 'game_time' and a.game_id is not null and jsonb_typeof(a.props -> 'sec') = 'number' and a.created_at >= v_since
        group by a.game_id
      ) h
    ), '{}'::jsonb),
    'device_split', coalesce((
      select jsonb_agg(jsonb_build_object('device', z.device, 'sessions', z.n) order by z.n desc)
      from (
        select coalesce(a.device, 'unknown') as device, count(*) as n
        from public.analytics_events a
        where a.event = 'session' and a.created_at >= v_since
        group by 1
      ) z
    ), '[]'::jsonb),
    'peak_samples', (select count(*) from public.presence_samples x where x.at >= v_since)
  );
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
  delete from public.ticket_messages m where m.ticket_id = p_ticket;
  delete from public.tickets t where t.id = p_ticket;
  if not found then
    raise exception 'Ticket not found' using errcode = 'P0002';
  end if;
  return true;
end;
$$;

revoke all on function public.admin_presence_sample(integer) from public, anon, authenticated;
revoke all on function public.admin_stats_v2(integer) from public, anon, authenticated;
revoke all on function public.admin_delete_ticket(bigint) from public, anon, authenticated;
grant execute on function public.admin_presence_sample(integer) to authenticated;
grant execute on function public.admin_stats_v2(integer) to authenticated;
grant execute on function public.admin_delete_ticket(bigint) to authenticated;

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

create index if not exists analytics_session_idx on public.analytics_events (session_id, event);

create or replace function private.analytics_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz := date_trunc('hour', now());
  v_ip text := '';
  v_cc text := '';
  v_n integer;
begin
  new.created_at := now();
  if new.client_at is null or new.client_at > now() + interval '10 minutes' or new.client_at < now() - interval '30 days' then
    new.client_at := now();
  end if;
  begin
    v_ip := btrim(split_part(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ''), ',', 1));
    v_cc := upper(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'cf-ipcountry', ''));
  exception when others then
    v_ip := '';
    v_cc := '';
  end;
  if new.event = 'env_geo' and v_cc ~ '^[A-Z]{2}$' and v_cc not in ('XX', 'T1') then
    new.props := new.props || jsonb_build_object('scc', v_cc);
  end if;
  insert into private.analytics_rate as r (k, w, n) values ('s:' || new.session_id, v_window, 1)
    on conflict (k, w) do update set n = r.n + 1
    returning r.n into v_n;
  if v_n > 3000 then
    return null;
  end if;
  if v_ip <> '' then
    insert into private.analytics_rate as r (k, w, n) values ('i:' || md5(v_ip), v_window, 1)
      on conflict (k, w) do update set n = r.n + 1
      returning r.n into v_n;
    if v_n > 20000 then
      return null;
    end if;
  end if;
  if random() < 0.002 then
    delete from private.analytics_rate where w < now() - interval '3 hours';
  end if;
  if random() < 0.0002 then
    delete from public.analytics_events where created_at < now() - interval '2 years';
  end if;
  return new;
end;
$$;

create table if not exists public.game_votes (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  game_id text not null,
  vote smallint not null,
  user_id uuid references auth.users (id) on delete set null
);
alter table public.game_votes drop constraint if exists game_votes_game_check;
alter table public.game_votes add constraint game_votes_game_check check (game_id ~ '^[a-z0-9][a-z0-9-]{0,39}$');
alter table public.game_votes drop constraint if exists game_votes_vote_check;
alter table public.game_votes add constraint game_votes_vote_check check (vote in (-1, 1));
create unique index if not exists game_votes_user_game on public.game_votes (user_id, game_id) where user_id is not null;
create index if not exists game_votes_game_idx on public.game_votes (game_id);
alter table public.game_votes enable row level security;
revoke all on public.game_votes from anon, authenticated;
grant all on public.game_votes to service_role;

create or replace function public.vote_game(p_game text, p_vote integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_ip text := '';
begin
  if p_game is null or p_game !~ '^[a-z0-9][a-z0-9-]{0,39}$' or p_vote is null or p_vote not in (-1, 1) then
    raise exception 'Bad vote' using errcode = '22023';
  end if;
  begin
    v_ip := btrim(split_part(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ''), ',', 1));
  exception when others then
    v_ip := '';
  end;
  if private.over('v:' || coalesce(v_uid::text, md5(v_ip)), date_trunc('hour', now()), 60) then
    raise exception 'Too many votes' using errcode = '54000';
  end if;
  if v_uid is not null then
    insert into public.game_votes (game_id, vote, user_id) values (p_game, p_vote, v_uid)
      on conflict (user_id, game_id) where user_id is not null do update set vote = excluded.vote, created_at = now();
  else
    insert into public.game_votes (game_id, vote) values (p_game, p_vote);
  end if;
end;
$$;

create or replace function private.jnum(p jsonb, k text)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select case when jsonb_typeof(p -> k) = 'number' then (p ->> k)::numeric end
$$;

create or replace function private.jbool(p jsonb, k text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case when jsonb_typeof(p -> k) = 'boolean' then (p ->> k)::boolean end
$$;

create or replace function private.ins_top(p_event text, p_key text, p_since timestamptz, p_n integer default 15)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k), '[]'::jsonb)
  from (
    select e.props ->> p_key as k, count(distinct e.session_id) as n
    from public.analytics_events e
    where e.event = p_event and e.created_at >= p_since and coalesce(e.props ->> p_key, '') <> ''
    group by 1
    order by 2 desc, 1
    limit p_n
  ) t
$$;

create or replace function private.ins_share(p_event text, p_key text, p_since timestamptz)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('n', count(*), 'yes', count(*) filter (where private.jbool(e.props, p_key)))
  from public.analytics_events e
  where e.event = p_event and e.created_at >= p_since and private.jbool(e.props, p_key) is not null
$$;

create or replace function public.admin_insights(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 366));
  v_since timestamptz := now() - make_interval(days => v_days);
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_today - (v_days - 1);
  r jsonb;
begin
  perform private.need_admin();

  r := jsonb_build_object('days', v_days, 'at', now());

  r := r || jsonb_build_object('coverage', jsonb_build_object(
    'sessions', (select count(distinct session_id) from public.analytics_events where created_at >= v_since),
    'geo', (select count(distinct session_id) from public.analytics_events where event = 'env_geo' and created_at >= v_since),
    'dev', (select count(distinct session_id) from public.analytics_events where event = 'env_dev' and created_at >= v_since)
  ));

  r := r || jsonb_build_object('geo', jsonb_build_object(
    'countries', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select coalesce(nullif(e.props ->> 'cc', ''), e.props ->> 'scc') as k, count(distinct e.session_id) as n
        from public.analytics_events e
        where e.event = 'env_geo' and e.created_at >= v_since and coalesce(nullif(e.props ->> 'cc', ''), e.props ->> 'scc', '') <> ''
        group by 1 order by 2 desc, 1 limit 30
      ) t), '[]'::jsonb),
    'regions', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select concat_ws(', ', e.props ->> 'region', e.props ->> 'cc') as k, count(distinct e.session_id) as n
        from public.analytics_events e
        where e.event = 'env_geo' and e.created_at >= v_since and coalesce(e.props ->> 'region', '') <> ''
        group by 1 order by 2 desc, 1 limit 20
      ) t), '[]'::jsonb),
    'cities', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select concat_ws(', ', e.props ->> 'city', e.props ->> 'cc') as k, count(distinct e.session_id) as n
        from public.analytics_events e
        where e.event = 'env_geo' and e.created_at >= v_since and coalesce(e.props ->> 'city', '') <> ''
        group by 1 order by 2 desc, 1 limit 20
      ) t), '[]'::jsonb),
    'isps', private.ins_top('env_geo', 'isp', v_since, 20),
    'tz', private.ins_top('env_geo', 'tz', v_since, 12),
    'net', private.ins_top('env_geo', 'net', v_since, 6),
    'ctype', private.ins_top('env_geo', 'ctype', v_since, 8),
    'vpn', private.ins_share('env_geo', 'vpn', v_since),
    'dc', private.ins_share('env_geo', 'dc', v_since),
    'save', private.ins_share('env_geo', 'save', v_since),
    'speed', (
      select jsonb_build_object(
        'dl', round(percentile_cont(0.5) within group (order by private.jnum(e.props, 'dl'))::numeric, 1),
        'rtt', round(percentile_cont(0.5) within group (order by private.jnum(e.props, 'rtt'))::numeric))
      from public.analytics_events e
      where e.event = 'env_geo' and e.created_at >= v_since and private.jnum(e.props, 'dl') is not null),
    'hours', coalesce((
      select jsonb_agg(jsonb_build_object('d', t.d, 'h', t.h, 'v', t.v))
      from (
        select extract(isodow from x.t)::int - 1 as d, extract(hour from x.t)::int as h, round(sum(x.sec) / 3600, 2) as v
        from (
          select case when private.jnum(g.props, 'off') between -900 and 900
              then (e.created_at at time zone 'UTC') + make_interval(mins => private.jnum(g.props, 'off')::int)
              else e.created_at at time zone 'Europe/Paris' end as t,
            private.jnum(e.props, 'sec') as sec
          from public.analytics_events e
          left join lateral (
            select g0.props from public.analytics_events g0
            where g0.session_id = e.session_id and g0.event = 'env_geo' limit 1
          ) g on true
          where e.event = 'game_time' and e.created_at >= v_since and private.jnum(e.props, 'sec') > 0
        ) x
        group by 1, 2
      ) t), '[]'::jsonb)
  ));

  r := r || jsonb_build_object('dev', jsonb_build_object(
    'os', private.ins_top('env_dev', 'osv', v_since, 15),
    'browsers', private.ins_top('env_dev', 'brv', v_since, 15),
    'models', private.ins_top('env_dev', 'model', v_since, 15),
    'gpus', private.ins_top('env_dev', 'gpu', v_since, 15),
    'cores', private.ins_top('env_dev', 'cores', v_since, 10),
    'mem', private.ins_top('env_dev', 'mem', v_since, 8),
    'hz', private.ins_top('env_dev', 'hz', v_since, 10),
    'kb', private.ins_top('env_dev', 'kb', v_since, 6),
    'arch', private.ins_top('env_dev', 'arch', v_since, 6),
    'gl2', private.ins_share('env_dev', 'gl2', v_since),
    'wgpu', private.ins_share('env_dev', 'wgpu', v_since),
    'langs', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select e.props -> 'langs' ->> 0 as k, count(distinct e.session_id) as n
        from public.analytics_events e
        where e.event = 'env_dev' and e.created_at >= v_since and jsonb_typeof(e.props -> 'langs') = 'array' and coalesce(e.props -> 'langs' ->> 0, '') <> ''
        group by 1 order by 2 desc, 1 limit 10
      ) t), '[]'::jsonb),
    'pads', private.ins_top('pad', 'kind', v_since, 8),
    'pad_ids', private.ins_top('pad', 'id', v_since, 10)
  ));

  r := r || jsonb_build_object('vitals', coalesce((
    select jsonb_agg(jsonb_build_object('device', t.device, 'n', t.n, 'lcp', t.lcp, 'inp', t.inp, 'cls', t.cls, 'fcp', t.fcp, 'ttfb', t.ttfb) order by t.n desc)
    from (
      select coalesce(e.device, 'unknown') as device, count(*) as n,
        round(percentile_cont(0.75) within group (order by private.jnum(e.props, 'lcp'))::numeric) as lcp,
        round(percentile_cont(0.75) within group (order by private.jnum(e.props, 'inp'))::numeric) as inp,
        round(percentile_cont(0.75) within group (order by private.jnum(e.props, 'cls'))::numeric, 3) as cls,
        round(percentile_cont(0.75) within group (order by private.jnum(e.props, 'fcp'))::numeric) as fcp,
        round(percentile_cont(0.75) within group (order by private.jnum(e.props, 'ttfb'))::numeric) as ttfb
      from public.analytics_events e
      where e.event = 'vitals' and e.created_at >= v_since
      group by 1
    ) t), '[]'::jsonb));

  r := r || jsonb_build_object('games', coalesce((
    select jsonb_agg(to_jsonb(t) order by t.n desc, t.id)
    from (
      select q.game_id as id,
        count(*) as n,
        count(*) filter (where private.jnum(q.props, 'sec') < 30) as early,
        round(avg(private.jnum(q.props, 'sec'))) as sec,
        round(avg(private.jnum(q.props, 'rounds')), 1) as rounds,
        round(avg(private.jnum(q.props, 'fps')), 1) as fps,
        round(percentile_cont(0.1) within group (order by private.jnum(q.props, 'fpsmin'))::numeric, 1) as fps_low,
        round(avg(private.jnum(q.props, 'fps5')), 1) as fps5,
        coalesce(sum(private.jnum(q.props, 'ik')), 0) as ik,
        coalesce(sum(private.jnum(q.props, 'im')), 0) as im,
        coalesce(sum(private.jnum(q.props, 'it')), 0) as it,
        coalesce(sum(private.jnum(q.props, 'ip')), 0) as ip,
        round(avg(private.jnum(q.props, 'lv')), 1) as lv_avg,
        max(private.jnum(q.props, 'lv')) as lv_max,
        count(*) filter (where private.jnum(q.props, 'lv') is not null) as lv_n,
        (select jsonb_agg(jsonb_build_object('lv', z.lv, 'n', z.n) order by z.n desc, z.lv)
          from (select private.jnum(q2.props, 'lv') as lv, count(*) as n from public.analytics_events q2
            where q2.event = 'game_quit' and q2.game_id = q.game_id and q2.created_at >= v_since and private.jnum(q2.props, 'lv') is not null
            group by 1 order by 2 desc, 1 limit 5) z) as quit_lv,
        (select jsonb_build_object('n', count(*),
            'p10', percentile_cont(0.1) within group (order by s.v), 'p25', percentile_cont(0.25) within group (order by s.v),
            'p50', percentile_cont(0.5) within group (order by s.v), 'p75', percentile_cont(0.75) within group (order by s.v),
            'p90', percentile_cont(0.9) within group (order by s.v), 'max', max(s.v))
          from (select x.value::numeric as v from public.analytics_events q3, jsonb_array_elements_text(q3.props -> 'sc') x
            where q3.event = 'game_quit' and q3.game_id = q.game_id and q3.created_at >= v_since and jsonb_typeof(q3.props -> 'sc') = 'array'
              and x.value ~ '^-?[0-9]+(\.[0-9]+)?$') s) as scores,
        (select jsonb_build_object('n', count(*),
            'p50', round(percentile_cont(0.5) within group (order by private.jnum(l.props, 'ms'))::numeric),
            'p90', round(percentile_cont(0.9) within group (order by private.jnum(l.props, 'ms'))::numeric))
          from public.analytics_events l
          where l.event = 'game_launch' and l.game_id = q.game_id and l.created_at >= v_since and private.jbool(l.props, 'lazy') and private.jnum(l.props, 'ms') > 0) as load,
        (select jsonb_build_object('up', count(*) filter (where v.vote = 1), 'down', count(*) filter (where v.vote = -1))
          from public.game_votes v where v.game_id = q.game_id) as votes
      from public.analytics_events q
      where q.event = 'game_quit' and q.game_id is not null and q.created_at >= v_since
      group by q.game_id
    ) t), '[]'::jsonb));

  r := r || jsonb_build_object('votes', coalesce((
    select jsonb_agg(jsonb_build_object('id', t.game_id, 'up', t.up, 'down', t.down) order by t.up + t.down desc, t.game_id)
    from (select game_id, count(*) filter (where vote = 1) as up, count(*) filter (where vote = -1) as down from public.game_votes group by game_id) t), '[]'::jsonb));

  r := r || jsonb_build_object('behaviour', jsonb_build_object(
    'slots', coalesce((
      select jsonb_agg(jsonb_build_object('src', s.src, 'pos', s.pos, 'imp', s.imp, 'clk', coalesce(c.clk, 0)) order by s.src, s.pos)
      from (
        select split_part(x.value, '|', 2) as src, split_part(x.value, '|', 3)::int as pos, count(*) as imp
        from public.analytics_events e, jsonb_array_elements_text(e.props -> 'l') x
        where e.event = 'impr' and e.created_at >= v_since and jsonb_typeof(e.props -> 'l') = 'array' and x.value ~ '^[a-z0-9-]+\|[a-z]+\|[0-9]{1,4}$'
          and split_part(x.value, '|', 3)::int < 24
        group by 1, 2
      ) s
      left join (
        select e.props ->> 'src' as src, private.jnum(e.props, 'pos')::int as pos, count(*) as clk
        from public.analytics_events e
        where e.event = 'tile_click' and e.created_at >= v_since and private.jnum(e.props, 'pos') between 0 and 23
        group by 1, 2
      ) c on c.src = s.src and c.pos = s.pos), '[]'::jsonb),
    'ctr', coalesce((
      select jsonb_agg(jsonb_build_object('id', s.id, 'imp', s.imp, 'clk', coalesce(c.clk, 0)) order by s.imp desc, s.id)
      from (
        select split_part(x.value, '|', 1) as id, count(*) as imp
        from public.analytics_events e, jsonb_array_elements_text(e.props -> 'l') x
        where e.event = 'impr' and e.created_at >= v_since and jsonb_typeof(e.props -> 'l') = 'array' and x.value ~ '^[a-z0-9-]+\|[a-z]+\|[0-9]{1,4}$' and split_part(x.value, '|', 2) <> 'side'
        group by 1 order by 2 desc limit 40
      ) s
      left join (
        select e.game_id as id, count(*) as clk from public.analytics_events e
        where e.event = 'tile_click' and e.created_at >= v_since and coalesce(e.props ->> 'src', '') <> 'side' and e.game_id is not null
        group by 1
      ) c on c.id = s.id), '[]'::jsonb),
    'scroll', (
      select jsonb_build_object('n', count(*), 'avg', round(avg(p)),
        'b25', count(*) filter (where p < 25), 'b50', count(*) filter (where p >= 25 and p < 50), 'b75', count(*) filter (where p >= 50 and p < 75),
        'b90', count(*) filter (where p >= 75 and p < 90), 'b100', count(*) filter (where p >= 90))
      from (select private.jnum(e.props, 'pct') as p from public.analytics_events e where e.event = 'scroll' and e.created_at >= v_since and private.jnum(e.props, 'pct') is not null) s),
    'rage', private.ins_top('rage', 't', v_since, 15),
    'dead', private.ins_top('dead', 't', v_since, 15),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('v', t.v, 'n', t.n, 'sec', t.sec, 'exits', t.exits) order by t.n desc)
      from (
        select e.props ->> 'v' as v, count(*) as n, round(avg(least(private.jnum(e.props, 'sec'), 7200))) as sec, count(*) filter (where private.jbool(e.props, 'exit')) as exits
        from public.analytics_events e
        where e.event = 'page_time' and e.created_at >= v_since and coalesce(e.props ->> 'v', '') <> ''
        group by 1
      ) t), '[]'::jsonb)
  ));

  r := r || jsonb_build_object('rebinds', coalesce((
    select jsonb_agg(jsonb_build_object('game', t.g, 'dev', t.dev, 'act', t.act, 'to', t.to_, 'n', t.n) order by t.n desc)
    from (
      select e.game_id as g, e.props ->> 'dev' as dev, e.props ->> 'act' as act, coalesce(e.props ->> 'to', '') as to_, count(*) as n
      from public.analytics_events e
      where e.event = 'rebind' and e.created_at >= v_since
      group by 1, 2, 3, 4 order by 5 desc limit 25
    ) t), '[]'::jsonb));

  r := r || jsonb_build_object('rl', jsonb_build_object(
    'all', (
      select jsonb_build_object('n', count(*), 'wins', count(*) filter (where private.jbool(e.props, 'win')),
        'goals', round(avg(private.jnum(e.props, 'goals')), 2), 'assists', round(avg(private.jnum(e.props, 'assists')), 2),
        'saves', round(avg(private.jnum(e.props, 'saves')), 2), 'shots', round(avg(private.jnum(e.props, 'shots')), 2),
        'demos', round(avg(private.jnum(e.props, 'demos')), 2), 'boost', round(avg(private.jnum(e.props, 'boost'))),
        'score', round(avg(private.jnum(e.props, 'score'))), 'ot', count(*) filter (where private.jbool(e.props, 'ot')),
        'mvp', count(*) filter (where private.jbool(e.props, 'mvp')))
      from public.analytics_events e where e.event = 'rl_match' and e.created_at >= v_since),
    'by_diff', coalesce((
      select jsonb_agg(to_jsonb(t) order by t.n desc)
      from (
        select coalesce(nullif(e.props ->> 'diff', ''), case when private.jbool(e.props, 'online') then 'online' else 'none' end) as diff,
          count(*) as n, count(*) filter (where private.jbool(e.props, 'win')) as wins,
          round(avg(private.jnum(e.props, 'us') - private.jnum(e.props, 'them')), 2) as margin,
          round(avg(private.jnum(e.props, 'goals')), 2) as goals
        from public.analytics_events e where e.event = 'rl_match' and e.created_at >= v_since
        group by 1
      ) t), '[]'::jsonb),
    'by_size', private.ins_top('rl_match', 'size', v_since, 5)
  ));

  r := r || jsonb_build_object('ads', jsonb_build_object(
    'adblock', private.ins_share('env_dev', 'adb', v_since),
    'slots', coalesce((
      select jsonb_agg(to_jsonb(t) order by t.imp desc)
      from (
        select coalesce(nullif(e.props ->> 'slot', ''), '?') as slot,
          count(*) filter (where e.event = 'ad_impression') as imp,
          count(*) filter (where e.event = 'ad_click') as clk,
          round(coalesce(sum(private.jnum(e.props, 'usd')) filter (where e.event = 'ad_revenue'), 0), 4) as usd
        from public.analytics_events e
        where e.event in ('ad_impression', 'ad_click', 'ad_revenue') and e.created_at >= v_since
        group by 1
      ) t), '[]'::jsonb)
  ));

  r := r || jsonb_build_object('retention', (
    with w as (
      select who, day, max(user_id::text) as uid from admin.events_who where created_at >= now() - interval '400 days' group by who, day
    ), f as (
      select who, min(day) as first, max(uid) as uid from w group by who
    ), st as (
      select who, day, day - (row_number() over (partition by who order by day))::int as grp from w where day >= v_today - 120
    ), runs as (
      select who, count(*) as len, max(day) as last from st group by who, grp
    ), best as (
      select who, max(len) as longest, max(len) filter (where last >= v_today - 1) as cur from runs group by who
    )
    select jsonb_build_object(
      'mau', (select count(distinct who) from w where day >= v_today - 29),
      'dau', (select round(avg(n), 1) from (select day, count(distinct who) as n from w where day between v_from and v_today group by day) d),
      'cohort', (
        select jsonb_agg(jsonb_build_object('d', k.d, 'eligible', k.eligible, 'back', k.back) order by k.d)
        from (
          select n.d,
            count(*) filter (where f.first <= v_today - n.d) as eligible,
            count(*) filter (where f.first <= v_today - n.d and exists (select 1 from w w2 where w2.who = f.who and w2.day = f.first + n.d)) as back
          from (values (1), (7), (30)) n(d)
          cross join f
          where f.first >= v_from - 30
          group by n.d
        ) k),
      'funnel', (
        select jsonb_build_object(
          'visited', count(*),
          'launched', count(*) filter (where exists (select 1 from admin.events_who e where e.who = f.who and e.event = 'game_launch' and e.created_at >= v_since)),
          'played', count(*) filter (where (select coalesce(sum(private.jnum(e.props, 'sec')), 0) from admin.events_who e where e.who = f.who and e.event = 'game_time' and e.created_at >= v_since) >= 60),
          'account', count(*) filter (where f.uid is not null and exists (select 1 from auth.users u where u.id::text = f.uid and u.created_at >= (f.first::timestamp at time zone 'Europe/Paris') - interval '1 day')),
          'returned', count(*) filter (where exists (select 1 from w w2 where w2.who = f.who and w2.day > f.first)))
        from f where f.first >= v_from),
      'streaks', (
        select jsonb_build_object(
          'b1', count(*) filter (where longest = 1), 'b3', count(*) filter (where longest between 2 and 3),
          'b7', count(*) filter (where longest between 4 and 7), 'b14', count(*) filter (where longest between 8 and 14),
          'b15', count(*) filter (where longest >= 15), 'active', count(*) filter (where cur >= 2), 'avg_cur', round(avg(cur) filter (where cur >= 2), 1))
        from best),
      'top_streaks', coalesce((
        select jsonb_agg(jsonb_build_object('id', p.id, 'username', p.username, 'name', p.display_name, 'cur', b.cur, 'longest', b.longest) order by b.cur desc, b.longest desc)
        from (select b0.who, b0.cur, b0.longest, (select max(f0.uid) from f f0 where f0.who = b0.who) as uid from best b0 where b0.cur >= 2 order by b0.cur desc limit 200) b
        join public.profiles p on p.id::text = b.uid
        limit 10), '[]'::jsonb),
      'churn', coalesce((
        select jsonb_agg(jsonb_build_object('id', p.id, 'username', p.username, 'name', p.display_name, 'days', c.days, 'last', c.last, 'hours', c.hours) order by c.days desc, c.last desc)
        from (
          select e.user_id, count(distinct (e.created_at at time zone 'Europe/Paris')::date) as days, max(e.created_at) as last,
            round(coalesce(sum(private.jnum(e.props, 'sec')) filter (where e.event = 'game_time'), 0) / 3600, 1) as hours
          from public.analytics_events e
          where e.user_id is not null and e.created_at >= now() - interval '60 days'
          group by e.user_id
          having count(distinct (e.created_at at time zone 'Europe/Paris')::date) >= 3 and max(e.created_at) < now() - interval '14 days'
          order by 2 desc limit 50
        ) c join public.profiles p on p.id = c.user_id), '[]'::jsonb),
      'churn_all', (
        select count(*) from (
          select who from w where day >= v_today - 59 group by who
          having count(*) >= 3 and max(day) < v_today - 13
        ) z)
    )
  ));

  return r;
end;
$$;

revoke all on function public.admin_insights(integer) from public, anon, authenticated;
grant execute on function public.admin_insights(integer) to authenticated;
revoke all on function public.vote_game(text, integer) from public, anon, authenticated;
grant execute on function public.vote_game(text, integer) to anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
notify pgrst, 'reload schema';
create index if not exists analytics_user_created_idx on public.analytics_events (user_id, created_at desc) where user_id is not null;
create index if not exists analytics_session_idx on public.analytics_events (session_id, event);

create or replace function private.ins_pair(p_event text, p_a text, p_b text, p_sep text, p_since timestamptz, p_n integer default 15)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k), '[]'::jsonb)
  from (
    select (e.props ->> p_a) || p_sep || (e.props ->> p_b) as k, count(distinct e.session_id) as n
    from public.analytics_events e
    where e.event = p_event and e.created_at >= p_since and coalesce(e.props ->> p_a, '') <> '' and coalesce(e.props ->> p_b, '') <> ''
    group by 1
    order by 2 desc, 1
    limit p_n
  ) t
$$;

create or replace function public.admin_insights_more(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_since timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 365)));
  v_sess jsonb;
begin
  perform private.need_admin();
  select jsonb_build_object(
    'n', count(*),
    'dur', percentile_cont(0.5) within group (order by s.dur),
    'dur90', percentile_cont(0.9) within group (order by s.dur),
    'vis', percentile_cont(0.5) within group (order by s.vis),
    'keys', round(avg(s.keys)),
    'clicks', round(avg(s.clicks)),
    'taps', round(avg(s.taps)),
    'mdist', round(avg(s.mdist)),
    'games', round(avg(s.games), 1),
    'gset', round(avg(s.gset), 1),
    'errs', round(avg(s.errs), 2),
    'idle', percentile_cont(0.5) within group (order by s.idle),
    'fs', round(100.0 * count(*) filter (where s.fs > 0) / greatest(count(*), 1)),
    'b', jsonb_build_array(
      jsonb_build_object('k', 'Under 1 min', 'n', count(*) filter (where s.dur < 60)),
      jsonb_build_object('k', '1–5 min', 'n', count(*) filter (where s.dur >= 60 and s.dur < 300)),
      jsonb_build_object('k', '5–15 min', 'n', count(*) filter (where s.dur >= 300 and s.dur < 900)),
      jsonb_build_object('k', '15–30 min', 'n', count(*) filter (where s.dur >= 900 and s.dur < 1800)),
      jsonb_build_object('k', '30–60 min', 'n', count(*) filter (where s.dur >= 1800 and s.dur < 3600)),
      jsonb_build_object('k', 'Over 1 hour', 'n', count(*) filter (where s.dur >= 3600))
    )
  ) into v_sess
  from (
    select e.session_id,
      max(private.jnum(e.props, 'dur')) as dur, max(private.jnum(e.props, 'vis')) as vis,
      max(private.jnum(e.props, 'keys')) as keys, max(private.jnum(e.props, 'clicks')) as clicks, max(private.jnum(e.props, 'taps')) as taps,
      max(private.jnum(e.props, 'mdist')) as mdist, max(private.jnum(e.props, 'games')) as games, max(private.jnum(e.props, 'gset')) as gset,
      max(private.jnum(e.props, 'errs')) as errs, max(private.jnum(e.props, 'idle')) as idle, max(private.jnum(e.props, 'fs')) as fs
    from public.analytics_events e
    where e.event = 'sess_sum' and e.created_at >= v_since
    group by e.session_id
  ) s;
  return jsonb_build_object(
    'sessions', v_sess,
    'screens', private.ins_top('env_scr', 'res', v_since, 15),
    'viewports', private.ins_pair('env_scr', 'vw', 'vh', '×', v_since, 15),
    'dpr', private.ins_top('env_scr', 'dpr', v_since, 10),
    'pointer', private.ins_top('env_scr', 'ptr', v_since, 4),
    'touch', private.ins_top('env_scr', 'tp', v_since, 8),
    'orient', private.ins_top('env_scr', 'ori', v_since, 6),
    'gamut', private.ins_top('env_scr', 'gam', v_since, 4),
    'mode', private.ins_top('env_scr', 'dm', v_since, 5),
    'zoom', private.ins_top('env_scr', 'zoom', v_since, 10),
    'depth', private.ins_top('env_scr', 'cd', v_since, 5),
    'dark', private.ins_share('env_scr', 'dark', v_since),
    'rmo', private.ins_share('env_scr', 'rmo', v_since),
    'hdr', private.ins_share('env_scr', 'hdr', v_since),
    'hov', private.ins_share('env_scr', 'hov', v_since),
    'ext', private.ins_share('env_scr', 'ext', v_since),
    'bench', private.ins_top('env_caps', 'benchb', v_since, 6),
    'quota', private.ins_top('env_caps', 'qb', v_since, 6),
    'heap', private.ins_top('env_caps', 'heap', v_since, 8),
    'battery', private.ins_top('env_caps', 'batb', v_since, 5),
    'charging', private.ins_share('env_caps', 'chg', v_since),
    'gpuv', private.ins_top('env_caps', 'gpuv', v_since, 12),
    'mtex', private.ins_top('env_caps', 'mtex', v_since, 6),
    'locale', private.ins_top('env_caps', 'loc', v_since, 15),
    'hour', private.ins_top('env_caps', 'hc', v_since, 4),
    'refs', private.ins_top('env_caps', 'ref', v_since, 15),
    'land', private.ins_top('env_caps', 'land', v_since, 15),
    'navt', private.ins_top('env_caps', 'navt', v_since, 5),
    'plat', private.ins_top('env_caps', 'plat', v_since, 10),
    'notif', private.ins_top('env_caps', 'notif', v_since, 4),
    'mic', private.ins_top('env_caps', 'mic', v_since, 5),
    'cam', private.ins_top('env_caps', 'cam', v_since, 5),
    'voices', private.ins_top('env_caps', 'voices', v_since, 8),
    'srate', private.ins_top('env_caps', 'sr', v_since, 5),
    'route', private.ins_top('sess_sum', 'route', v_since, 4),
    'acct', private.ins_top('sess_sum', 'acct', v_since, 4),
    'theme', private.ins_top('sess_sum', 'theme', v_since, 4),
    'retries', private.ins_top('party_retry', 'why', v_since, 8),
    'bot', private.ins_share('env_caps', 'bot', v_since),
    'dnt', private.ins_share('env_caps', 'dnt', v_since),
    'gpc', private.ins_share('env_caps', 'gpc', v_since),
    'av1', private.ins_share('env_caps', 'av1', v_since),
    'hevc', private.ins_share('env_caps', 'hevc', v_since),
    'coi', private.ins_share('env_caps', 'coi', v_since),
    'xr', private.ins_share('env_caps', 'xr', v_since),
    'at', now()
  );
end;
$$;

create or replace function public.admin_user_devices(p_uid uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  return coalesce((
    select jsonb_agg(x.o order by x.t desc)
    from (
      select s.session_id, max(s.created_at) as t,
        jsonb_build_object('s', s.session_id, 'first', min(s.created_at), 'last', max(s.created_at), 'device', max(s.device),
          'dev', (select e.props from public.analytics_events e where e.session_id = s.session_id and e.event = 'env_dev' limit 1),
          'geo', (select e.props - 'off' from public.analytics_events e where e.session_id = s.session_id and e.event = 'env_geo' limit 1),
          'scr', (select e.props from public.analytics_events e where e.session_id = s.session_id and e.event = 'env_scr' limit 1),
          'caps', (select e.props - 'ua' from public.analytics_events e where e.session_id = s.session_id and e.event = 'env_caps' limit 1),
          'ua', (select e.props ->> 'ua' from public.analytics_events e where e.session_id = s.session_id and e.event = 'env_caps' limit 1),
          'sum', (select e.props from public.analytics_events e where e.session_id = s.session_id and e.event = 'sess_sum' order by private.jnum(e.props, 'dur') desc nulls last limit 1),
          'events', count(*)) as o
      from public.analytics_events s
      where s.user_id = p_uid
      group by s.session_id
      order by max(s.created_at) desc
      limit 25
    ) x
  ), '[]'::jsonb);
end;
$$;

revoke all on function private.ins_pair(text, text, text, text, timestamptz, integer) from public, anon, authenticated;
revoke all on function public.admin_insights_more(integer) from public, anon, authenticated;
revoke all on function public.admin_user_devices(uuid) from public, anon, authenticated;
grant execute on function public.admin_insights_more(integer) to authenticated;
grant execute on function public.admin_user_devices(uuid) to authenticated;

create or replace function public.admin_insights_more(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_since timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 365)));
  v_sess jsonb;
begin
  perform private.need_admin();
  with s as (
    select e.session_id,
      extract(epoch from max(e.created_at) - min(e.created_at)) as span,
      count(*) filter (where e.event = 'game_launch') as launches,
      count(distinct e.game_id) filter (where e.event = 'game_launch') as gs
    from public.analytics_events e
    where e.created_at >= v_since
    group by e.session_id
  ), m as (
    select e.session_id,
      max(private.jnum(e.props, 'dur')) as dur, max(private.jnum(e.props, 'vis')) as vis,
      max(private.jnum(e.props, 'keys')) as keys, max(private.jnum(e.props, 'clicks')) as clicks, max(private.jnum(e.props, 'taps')) as taps,
      max(private.jnum(e.props, 'mdist')) as mdist, max(private.jnum(e.props, 'games')) as games, max(private.jnum(e.props, 'gset')) as gset,
      max(private.jnum(e.props, 'errs')) as errs, max(private.jnum(e.props, 'idle')) as idle, max(private.jnum(e.props, 'fs')) as fs,
      max(private.jnum(e.props, 'foc')) as foc, max(private.jnum(e.props, 'blur')) as blur, max(private.jnum(e.props, 'wheel')) as wheel,
      max(private.jnum(e.props, 'scr')) as scr, max(private.jnum(e.props, 'copy')) as copy, max(private.jnum(e.props, 'rsz')) as rsz,
      max(private.jnum(e.props, 'off')) as off
    from public.analytics_events e
    where e.event = 'sess_sum' and e.created_at >= v_since
    group by e.session_id
  ), j as (
    select s.session_id, greatest(s.span, coalesce(m.dur, 0)) as dur, greatest(s.launches, coalesce(m.games, 0)) as games,
      greatest(s.gs, coalesce(m.gset, 0)) as gset, m.session_id as ms, m.vis, m.keys, m.clicks, m.taps, m.mdist, m.errs, m.idle, m.fs,
      m.foc, m.blur, m.wheel, m.scr, m.copy, m.rsz, m.off
    from s left join m on m.session_id = s.session_id
  )
  select jsonb_build_object(
    'n', count(*),
    'nm', count(j.ms),
    'dur', percentile_cont(0.5) within group (order by j.dur),
    'dur90', percentile_cont(0.9) within group (order by j.dur),
    'vis', percentile_cont(0.5) within group (order by nullif(j.vis, 0)),
    'keys', round(avg(j.keys)),
    'clicks', round(avg(j.clicks)),
    'taps', round(avg(j.taps)),
    'mdist', round(avg(j.mdist)),
    'wheel', round(avg(j.wheel)),
    'scr', round(avg(j.scr)),
    'foc', round(avg(j.foc), 1),
    'blur', round(avg(j.blur), 1),
    'copy', round(avg(j.copy), 2),
    'rsz', round(avg(j.rsz), 1),
    'off', round(100.0 * count(*) filter (where j.off > 0) / greatest(count(j.ms), 1)),
    'games', round(avg(j.games), 1),
    'gset', round(avg(j.gset), 1),
    'played', round(100.0 * count(*) filter (where j.games > 0) / greatest(count(*), 1)),
    'errs', round(avg(j.errs), 2),
    'idle', percentile_cont(0.5) within group (order by j.idle),
    'fs', round(100.0 * count(*) filter (where j.fs > 0) / greatest(count(j.ms), 1)),
    'b', jsonb_build_array(
      jsonb_build_object('k', 'Under 1 min', 'n', count(*) filter (where j.dur < 60)),
      jsonb_build_object('k', '1–5 min', 'n', count(*) filter (where j.dur >= 60 and j.dur < 300)),
      jsonb_build_object('k', '5–15 min', 'n', count(*) filter (where j.dur >= 300 and j.dur < 900)),
      jsonb_build_object('k', '15–30 min', 'n', count(*) filter (where j.dur >= 900 and j.dur < 1800)),
      jsonb_build_object('k', '30–60 min', 'n', count(*) filter (where j.dur >= 1800 and j.dur < 3600)),
      jsonb_build_object('k', 'Over 1 hour', 'n', count(*) filter (where j.dur >= 3600))
    )
  ) into v_sess
  from j;
  return jsonb_build_object(
    'sessions', v_sess,
    'screens', private.ins_top('env_scr', 'res', v_since, 15),
    'viewports', private.ins_pair('env_scr', 'vw', 'vh', '×', v_since, 15),
    'dpr', private.ins_top('env_scr', 'dpr', v_since, 10),
    'pointer', private.ins_top('env_scr', 'ptr', v_since, 4),
    'touch', private.ins_top('env_scr', 'tp', v_since, 8),
    'orient', private.ins_top('env_scr', 'ori', v_since, 6),
    'gamut', private.ins_top('env_scr', 'gam', v_since, 4),
    'mode', private.ins_top('env_scr', 'dm', v_since, 5),
    'zoom', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select z.s::text as k, count(distinct z.session_id) as n
        from (
          select e.session_id, private.jnum(e.props, 'zoom') as v,
            (select a.x from unnest(array[0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5]::numeric[]) a(x) order by abs(a.x - private.jnum(e.props, 'zoom')) limit 1) as s
          from public.analytics_events e
          where e.event = 'env_scr' and e.created_at >= v_since and e.props ->> 'ptr' = 'fine' and private.jnum(e.props, 'zoom') between 0.25 and 5
        ) z
        where abs(z.s - z.v) / z.s < 0.03
        group by 1 order by 2 desc, 1 limit 10
      ) t), '[]'::jsonb),
    'depth', private.ins_top('env_scr', 'cd', v_since, 5),
    'dark', private.ins_share('env_scr', 'dark', v_since),
    'rmo', private.ins_share('env_scr', 'rmo', v_since),
    'hdr', private.ins_share('env_scr', 'hdr', v_since),
    'hov', private.ins_share('env_scr', 'hov', v_since),
    'ext', private.ins_share('env_scr', 'ext', v_since),
    'bench', private.ins_top('env_caps', 'benchb', v_since, 6),
    'quota', private.ins_top('env_caps', 'qb', v_since, 6),
    'heap', private.ins_top('env_caps', 'heap', v_since, 8),
    'battery', private.ins_top('env_caps', 'batb', v_since, 5),
    'charging', private.ins_share('env_caps', 'chg', v_since),
    'gpuv', private.ins_top('env_caps', 'gpuv', v_since, 12),
    'mtex', private.ins_top('env_caps', 'mtex', v_since, 6),
    'locale', private.ins_top('env_caps', 'loc', v_since, 15),
    'hour', private.ins_top('env_caps', 'hc', v_since, 4)
  ) || jsonb_build_object(
    'refs', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select coalesce(nullif(e.props ->> 'ref', ''), 'direct') as k, count(distinct e.session_id) as n
        from public.analytics_events e
        where e.event = 'env_caps' and e.created_at >= v_since
        group by 1 order by 2 desc, 1 limit 15
      ) t), '[]'::jsonb),
    'land', private.ins_top('env_caps', 'land', v_since, 15),
    'navt', private.ins_top('env_caps', 'navt', v_since, 5),
    'plat', private.ins_top('env_caps', 'plat', v_since, 10),
    'notif', private.ins_top('env_caps', 'notif', v_since, 4),
    'mic', private.ins_top('env_caps', 'mic', v_since, 5),
    'cam', private.ins_top('env_caps', 'cam', v_since, 5),
    'voices', private.ins_top('env_caps', 'voices', v_since, 8),
    'srate', private.ins_top('env_caps', 'sr', v_since, 5),
    'route', private.ins_top('sess_sum', 'route', v_since, 4),
    'acct', private.ins_top('sess_sum', 'acct', v_since, 4),
    'theme', private.ins_top('sess_sum', 'theme', v_since, 4),
    'slang', private.ins_top('sess_sum', 'lang', v_since, 8),
    'retries', private.ins_top('party_retry', 'why', v_since, 8),
    'ctype', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select coalesce(nullif(e.props ->> 'ctype', ''), 'unknown') as k, count(distinct e.session_id) as n
        from public.analytics_events e
        where e.event = 'env_geo' and e.created_at >= v_since
        group by 1 order by 2 desc, 1 limit 8
      ) t), '[]'::jsonb),
    'models', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select coalesce(nullif(e.props ->> 'model', ''),
            case when e.props ->> 'osv' like 'iOS%' then 'iPhone' when e.props ->> 'osv' like 'iPadOS%' then 'iPad' else 'Unknown model' end) as k,
          count(distinct e.session_id) as n
        from public.analytics_events e
        where e.event = 'env_dev' and e.created_at >= v_since and (e.device in ('phone', 'tablet') or coalesce(e.props ->> 'model', '') <> '')
        group by 1 order by 2 desc, 1 limit 15
      ) t), '[]'::jsonb),
    'scores', coalesce((
      select jsonb_object_agg(t.g, t.o)
      from (
        select x.g, jsonb_build_object('n', count(*), 'min', min(x.v), 'p25', percentile_cont(0.25) within group (order by x.v),
          'p50', percentile_cont(0.5) within group (order by x.v), 'p75', percentile_cont(0.75) within group (order by x.v), 'max', max(x.v)) as o
        from (
          select q.game_id as g, a.value::numeric as v
          from public.analytics_events q
          cross join lateral jsonb_array_elements_text(case
            when jsonb_typeof(q.props -> 'sc') = 'array' and jsonb_array_length(q.props -> 'sc') > 0 then q.props -> 'sc'
            when jsonb_typeof(q.props -> 'last') = 'number' then jsonb_build_array(q.props -> 'last')
            else '[]'::jsonb end) a
          where q.event = 'game_quit' and q.game_id is not null and q.created_at >= v_since and a.value ~ '^-?[0-9]{1,15}(\.[0-9]+)?$'
        ) x
        group by x.g
      ) t), '{}'::jsonb),
    'rl_left', (
      select jsonb_build_object('n', count(*), 'played', round(avg(private.jnum(e.props, 'played'))),
        'goals', round(avg(private.jnum(e.props, 'goals')), 2), 'saves', round(avg(private.jnum(e.props, 'saves')), 2),
        'ahead', count(*) filter (where private.jnum(e.props, 'us') > private.jnum(e.props, 'them')),
        'behind', count(*) filter (where private.jnum(e.props, 'us') < private.jnum(e.props, 'them')))
      from public.analytics_events e where e.event = 'rl_left' and e.created_at >= v_since),
    'flags', (
      select jsonb_object_agg(f.k, private.ins_share(f.ev, f.k, v_since))
      from (values ('env_caps', 'wasm'), ('env_caps', 'sab'), ('env_caps', 'swk'), ('env_caps', 'vib'), ('env_caps', 'bt'), ('env_caps', 'usb'),
        ('env_caps', 'ser'), ('env_caps', 'hid'), ('env_caps', 'midi'), ('env_caps', 'share'), ('env_caps', 'wl'), ('env_caps', 'pdf'),
        ('env_caps', 'h264'), ('env_caps', 'vp9'), ('env_caps', 'pers'), ('env_caps', 'ck'), ('env_caps', 'down'), ('env_scr', 'con'),
        ('env_scr', 'fcol'), ('env_scr', 'rtr'), ('env_geo', 'tzm')) f(ev, k)),
    'extra', (
      select jsonb_object_agg(f.k, private.ins_top(f.ev, f.k, v_since, 6))
      from (values ('env_caps', 'spk'), ('env_caps', 'ach'), ('env_caps', 'glx'), ('env_caps', 'cal'), ('env_caps', 'num'), ('env_caps', 'fdw'),
        ('env_caps', 'vend'), ('env_caps', 'hist')) f(ev, k)),
    'bot', private.ins_share('env_caps', 'bot', v_since),
    'dnt', private.ins_share('env_caps', 'dnt', v_since),
    'gpc', private.ins_share('env_caps', 'gpc', v_since),
    'av1', private.ins_share('env_caps', 'av1', v_since),
    'hevc', private.ins_share('env_caps', 'hevc', v_since),
    'coi', private.ins_share('env_caps', 'coi', v_since),
    'xr', private.ins_share('env_caps', 'xr', v_since),
    'at', now()
  );
end;
$$;

revoke all on function public.admin_insights_more(integer) from public, anon, authenticated;
grant execute on function public.admin_insights_more(integer) to authenticated;
notify pgrst, 'reload schema';

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

create or replace function private.client_ip()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_h json;
  v_cf text;
  v_xf text;
begin
  begin
    v_h := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    return '';
  end;
  if v_h is null then
    return '';
  end if;
  v_cf := btrim(coalesce(v_h ->> 'cf-connecting-ip', ''));
  v_xf := btrim(split_part(coalesce(v_h ->> 'x-forwarded-for', ''), ',', 1));
  if v_cf <> '' and v_cf not like '2a06:98c0:3600:%' then
    return left(v_cf, 64);
  end if;
  return left(coalesce(nullif(v_xf, ''), v_cf, ''), 64);
end;
$$;

create table if not exists private.rate_hits (
  id bigint generated always as identity primary key,
  k text not null,
  action text not null,
  uid uuid,
  ip text,
  full_hit boolean not null default false,
  at timestamptz not null default now()
);
create index if not exists rate_hits_k_at_idx on private.rate_hits (k, at desc);
create index if not exists rate_hits_at_idx on private.rate_hits (at);
create index if not exists rate_hits_uid_idx on private.rate_hits (uid, at desc) where uid is not null;
alter table private.rate_hits enable row level security;
revoke all on private.rate_hits from public, anon, authenticated;

create or replace function private.rate_key(p_action text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p_action || ':' || coalesce(auth.uid()::text, 'ip:' || md5(private.client_ip()));
$$;

create or replace function private.rate_wait(p_key text, p_max integer, p_window interval)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(1, ceil(extract(epoch from (min(s.at) + p_window - now())))::integer)
  from (select h.at from private.rate_hits h where h.k = p_key and h.at > now() - p_window order by h.at desc limit greatest(p_max, 1)) s;
$$;

create or replace function private.rate_ok(p_action text, p_max integer, p_window interval, p_key text default null)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_k text := coalesce(p_key, private.rate_key(p_action));
  v_n integer;
  v_ip text := nullif(private.client_ip(), '');
begin
  perform pg_advisory_xact_lock(hashtextextended(v_k, 0));
  select count(*) into v_n from private.rate_hits h where h.k = v_k and h.at > now() - p_window;
  if v_n >= p_max then
    return false;
  end if;
  insert into private.rate_hits (k, action, uid, ip, full_hit) values (v_k, p_action, auth.uid(), case when v_ip is null then null else md5(v_ip) end, p_max > 1 and v_n + 1 >= p_max);
  if random() < 0.005 then
    delete from private.rate_hits where at < now() - interval '8 days';
  end if;
  return true;
end;
$$;

create or replace function private.rate_check(p_action text, p_max integer, p_window interval, p_key text default null)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_k text := coalesce(p_key, private.rate_key(p_action));
begin
  if not private.rate_ok(p_action, p_max, p_window, v_k) then
    raise exception 'rate_limited' using errcode = 'PT429', detail = p_action, hint = 'retry_after=' || coalesce(private.rate_wait(v_k, p_max, p_window), 60);
  end if;
end;
$$;

create or replace function private.is_staff(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = p_uid and p.role in ('admin', 'owner') and not p.locked);
$$;

create table if not exists public.user_blocks (
  blocker uuid not null references auth.users (id) on delete cascade,
  blocked uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);
alter table public.user_blocks drop constraint if exists user_blocks_self_check;
alter table public.user_blocks add constraint user_blocks_self_check check (blocker <> blocked);
create index if not exists user_blocks_blocked_idx on public.user_blocks (blocked);
alter table public.user_blocks enable row level security;
revoke all on public.user_blocks from anon, authenticated;
grant all on public.user_blocks to service_role;
drop trigger if exists user_blocks_cap on public.user_blocks;
create trigger user_blocks_cap before insert on public.user_blocks
  for each row execute function private.cap_rows('blocker', '500');

create or replace function private.blocked_between(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.user_blocks b where (b.blocker = p_a and b.blocked = p_b) or (b.blocker = p_b and b.blocked = p_a));
$$;

create table if not exists private.friend_declines (
  from_id uuid not null references auth.users (id) on delete cascade,
  to_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now(),
  primary key (from_id, to_id)
);
alter table private.friend_declines enable row level security;
revoke all on private.friend_declines from public, anon, authenticated;

create table if not exists public.user_reports (
  id bigint generated always as identity primary key,
  reporter uuid references auth.users (id) on delete set null,
  target uuid references auth.users (id) on delete set null,
  target_username text,
  reason text not null,
  details text,
  context jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  ticket_id bigint references public.tickets (id) on delete set null,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  closed_by uuid
);
alter table public.user_reports drop constraint if exists user_reports_reason_check;
alter table public.user_reports add constraint user_reports_reason_check check (reason in ('spam', 'harassment', 'cheating', 'inappropriate', 'other'));
alter table public.user_reports drop constraint if exists user_reports_details_check;
alter table public.user_reports add constraint user_reports_details_check check (details is null or char_length(details) <= 1000);
alter table public.user_reports drop constraint if exists user_reports_context_check;
alter table public.user_reports add constraint user_reports_context_check check (pg_column_size(context) <= 32768);
alter table public.user_reports drop constraint if exists user_reports_status_check;
alter table public.user_reports add constraint user_reports_status_check check (status in ('open', 'closed'));
create index if not exists user_reports_status_idx on public.user_reports (status, id desc);
create index if not exists user_reports_target_idx on public.user_reports (target, id desc);
create index if not exists user_reports_reporter_idx on public.user_reports (reporter, created_at desc);
alter table public.user_reports enable row level security;
revoke all on public.user_reports from anon, authenticated;
grant all on public.user_reports to service_role;

create or replace function private.display_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if new.display_name is not null then
    new.display_name := nullif(btrim(regexp_replace(new.display_name, E'[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF\u00AD]', '', 'g')), '');
  end if;
  if tg_op = 'UPDATE' and v_uid is not null and v_uid = new.id
    and (new.username is distinct from old.username or new.display_name is distinct from old.display_name)
    and not (new.username is null and new.display_name is null)
    and not private.is_staff(v_uid) then
    if new.username is distinct from old.username then
      perform private.rate_check('username_change', 5, interval '1 day');
    end if;
    if new.display_name is distinct from old.display_name then
      perform private.rate_check('display_change', 20, interval '1 day');
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_display_guard on public.profiles;
create trigger profiles_display_guard before insert or update on public.profiles
  for each row execute function private.display_guard();

create or replace function private.save_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and not private.is_staff(auth.uid()) then
    perform private.rate_check('save_write', 300, interval '10 minutes');
  end if;
  return null;
end;
$$;

drop trigger if exists game_saves_rate on public.game_saves;
create trigger game_saves_rate before insert or update on public.game_saves
  for each statement execute function private.save_guard();

create or replace function private.analytics_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz := date_trunc('hour', now());
  v_ip text := private.client_ip();
  v_cc text := '';
  v_n integer;
begin
  new.created_at := now();
  if new.client_at is null or new.client_at > now() + interval '10 minutes' or new.client_at < now() - interval '30 days' then
    new.client_at := now();
  end if;
  begin
    v_cc := upper(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'cf-ipcountry', ''));
  exception when others then
    v_cc := '';
  end;
  if new.event = 'env_geo' and v_cc ~ '^[A-Z]{2}$' and v_cc not in ('XX', 'T1') then
    new.props := new.props || jsonb_build_object('scc', v_cc);
  end if;
  insert into private.analytics_rate as r (k, w, n) values ('s:' || new.session_id, v_window, 1)
    on conflict (k, w) do update set n = r.n + 1
    returning r.n into v_n;
  if v_n > 3000 then
    return null;
  end if;
  if new.user_id is not null then
    insert into private.analytics_rate as r (k, w, n) values ('u:' || new.user_id::text, v_window, 1)
      on conflict (k, w) do update set n = r.n + 1
      returning r.n into v_n;
    if v_n > 4000 then
      return null;
    end if;
  end if;
  if v_ip <> '' then
    insert into private.analytics_rate as r (k, w, n) values ('i:' || md5(v_ip), v_window, 1)
      on conflict (k, w) do update set n = r.n + 1
      returning r.n into v_n;
    if v_n > 20000 then
      return null;
    end if;
  end if;
  if random() < 0.002 then
    delete from private.analytics_rate where w < now() - interval '3 hours';
  end if;
  if random() < 0.0002 then
    delete from public.analytics_events where created_at < now() - interval '2 years';
  end if;
  return new;
end;
$$;

create or replace function public.username_available(p_name text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  perform private.rate_check('username_check', 60, interval '1 minute');
  perform private.rate_check('username_check_h', 600, interval '1 hour');
  return private.username_ok(lower(p_name))
    and not exists (select 1 from public.profiles p where lower(p.username) = lower(p_name) and p.id is distinct from auth.uid());
end;
$$;

create or replace function public.search_profiles(prefix text)
returns table (username text, display_name text, avatar_url text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_q text := lower(btrim(coalesce(prefix, '')));
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles where id = v_uid and locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  if char_length(v_q) < 2 or char_length(v_q) > 20 or v_q !~ '^[a-z0-9_.]+$' then
    return;
  end if;
  perform private.rate_check('search', 40, interval '1 minute');
  perform private.rate_check('search_h', 400, interval '1 hour');
  return query
    select p.username, p.display_name, p.avatar_url
    from public.profiles p
    where p.username is not null
      and p.id <> v_uid
      and lower(p.username) like replace(v_q, '_', '\_') || '%'
      and not exists (select 1 from public.user_blocks b where b.blocker = p.id and b.blocked = v_uid)
    order by lower(p.username) = v_q desc, char_length(p.username), lower(p.username)
    limit 20;
end;
$$;

create or replace function public.list_people(p_q text default null, p_limit integer default 500)
returns table (id uuid, username text, display_name text, avatar_url text, created_at timestamptz, state text, request_id bigint)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_q text := lower(btrim(regexp_replace(left(coalesce(p_q, ''), 40), '^\s*@', '')));
  v_all boolean;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles pr where pr.id = v_uid and pr.locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  perform private.rate_check('people', 30, interval '1 minute');
  perform private.rate_check('people_h', 300, interval '1 hour');
  v_all := private.is_staff(v_uid) or exists (select 1 from public.test_accounts t where t.user_id = v_uid);
  return query
    select p.id, p.username, p.display_name, p.avatar_url, p.created_at,
      case when f.friend_id is not null then 'friend' when ri.id is not null then 'incoming' when ro.id is not null then 'outgoing' else 'none' end,
      coalesce(ri.id, ro.id)
    from public.profiles p
    left join public.friends f on f.user_id = v_uid and f.friend_id = p.id
    left join public.friend_requests ri on ri.from_id = p.id and ri.to_id = v_uid and ri.status = 'pending'
    left join public.friend_requests ro on ro.from_id = v_uid and ro.to_id = p.id and ro.status = 'pending'
    where p.username is not null
      and p.id <> v_uid
      and not p.locked
      and not exists (select 1 from public.user_blocks b where (b.blocker = p.id and b.blocked = v_uid) or (b.blocker = v_uid and b.blocked = p.id))
      and (v_all or not exists (select 1 from public.test_accounts t where t.user_id = p.id))
      and (v_q = '' or strpos(lower(p.username), v_q) > 0 or strpos(lower(coalesce(p.display_name, '')), v_q) > 0)
    order by lower(coalesce(p.display_name, p.username)), p.username
    limit greatest(1, least(coalesce(p_limit, 500), 1000));
end;
$$;

create or replace function public.login_email(p_login text, p_password text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_key text := lower(btrim(coalesce(p_login, '')));
  v_ip text := private.client_ip();
  v_n integer;
  v_email text;
  v_hash text;
begin
  if v_key !~ '^[a-z0-9_.]{3,20}$' or coalesce(p_password, '') = '' or char_length(p_password) > 200 then
    return null;
  end if;
  insert into private.analytics_rate as r (k, w, n) values ('l:' || v_key, date_trunc('hour', now()) + floor(extract(minute from now()) / 15) * interval '15 minutes', 1)
    on conflict (k, w) do update set n = r.n + 1
    returning r.n into v_n;
  if v_n > 10 then
    raise exception 'Too many attempts' using errcode = '54000';
  end if;
  if v_ip <> '' then
    insert into private.analytics_rate as r (k, w, n) values ('li:' || md5(v_ip), date_trunc('hour', now()), 1)
      on conflict (k, w) do update set n = r.n + 1
      returning r.n into v_n;
    if v_n > 100 then
      raise exception 'Too many attempts' using errcode = '54000';
    end if;
  end if;
  select u.email, u.encrypted_password into v_email, v_hash
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = v_key and u.deleted_at is null;
  if v_email is null or coalesce(v_hash, '') = '' then
    perform extensions.crypt(p_password, extensions.gen_salt('bf', 10));
    return null;
  end if;
  if extensions.crypt(p_password, v_hash) <> v_hash then
    return null;
  end if;
  return v_email;
end;
$$;

create or replace function public.send_friend_request(p_username text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_to uuid;
  v_status text;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles where id = v_uid and locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  select id into v_to from public.profiles where lower(username) = lower(btrim(coalesce(p_username, '')));
  if v_to is null or private.blocked_between(v_uid, v_to) then
    return 'not_found';
  end if;
  if v_to = v_uid then
    return 'self';
  end if;
  if exists (select 1 from public.friends where user_id = v_uid and friend_id = v_to) then
    return 'already_friends';
  end if;
  if exists (select 1 from public.friend_requests where from_id = v_to and to_id = v_uid and status = 'pending') then
    update public.friend_requests set status = 'accepted' where from_id = v_to and to_id = v_uid;
    insert into public.friends (user_id, friend_id) values (v_uid, v_to), (v_to, v_uid) on conflict do nothing;
    delete from private.friend_declines where (from_id = v_uid and to_id = v_to) or (from_id = v_to and to_id = v_uid);
    return 'accepted';
  end if;
  select status into v_status from public.friend_requests where from_id = v_uid and to_id = v_to;
  if v_status = 'pending' then
    return 'sent';
  end if;
  if exists (select 1 from private.friend_declines d where d.from_id = v_uid and d.to_id = v_to and d.at > now() - interval '3 days') then
    return 'cooldown';
  end if;
  if (select count(*) from public.friend_requests r where r.from_id = v_uid and r.status = 'pending') >= 25 then
    return 'too_many_pending';
  end if;
  perform private.rate_check('friend_pair', 3, interval '1 day', 'friend_pair:' || v_uid::text || '>' || v_to::text);
  perform private.rate_check('friend_request', 15, interval '1 hour');
  perform private.rate_check('friend_request_d', 40, interval '1 day');
  insert into public.friend_requests (from_id, to_id) values (v_uid, v_to)
    on conflict (from_id, to_id) do update set status = 'pending' where public.friend_requests.status = 'declined';
  return 'sent';
end;
$$;

create or replace function public.respond_friend_request(p_id bigint, p_accept boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_from uuid;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  select from_id into v_from from public.friend_requests where id = p_id and to_id = v_uid and status = 'pending';
  if v_from is null then
    return 'not_found';
  end if;
  perform private.rate_check('friend_respond', 120, interval '1 hour');
  if p_accept then
    if private.blocked_between(v_uid, v_from) then
      delete from public.friend_requests where id = p_id;
      return 'not_found';
    end if;
    update public.friend_requests set status = 'accepted' where id = p_id;
    insert into public.friends (user_id, friend_id) values (v_uid, v_from), (v_from, v_uid) on conflict do nothing;
    delete from private.friend_declines where (from_id = v_uid and to_id = v_from) or (from_id = v_from and to_id = v_uid);
    return 'accepted';
  end if;
  update public.friend_requests set status = 'declined' where id = p_id;
  insert into private.friend_declines (from_id, to_id, at) values (v_from, v_uid, now())
    on conflict (from_id, to_id) do update set at = excluded.at;
  return 'declined';
end;
$$;

create or replace function public.dm_send(p_to uuid, p_kind text, p_body text default null, p_meta jsonb default '{}'::jsonb)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_kind text := coalesce(p_kind, 'text');
  v_body text;
  v_meta jsonb := '{}'::jsonb;
  v_id bigint;
begin
  if v_me is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles p where p.id = v_me and p.locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  if private.blocked_between(v_me, p_to) or not exists (select 1 from public.friends f where f.user_id = v_me and f.friend_id = p_to) then
    raise exception 'Not friends' using errcode = '42501';
  end if;
  if private.over('dm:' || v_me::text, date_trunc('minute', now()), 40) then
    raise exception 'Too many messages' using errcode = '54000';
  end if;
  if v_kind = 'text' then
    v_body := left(btrim(regexp_replace(coalesce(p_body, ''), '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g')), 2000);
    if v_body = '' then
      raise exception 'Write a message' using errcode = '22023';
    end if;
    perform private.rate_check('dm_text', 30, interval '1 minute');
    perform private.rate_check('dm_text_h', 600, interval '1 hour');
  elsif v_kind = 'image' then
    if coalesce(p_meta ->> 'path', '') !~ ('^' || v_me::text || '/' || p_to::text || '/[a-z0-9-]{8,64}\.(webp|jpg|png|gif)$') then
      raise exception 'Bad image' using errcode = '22023';
    end if;
    perform private.rate_check('dm_image', 10, interval '1 minute');
    perform private.rate_check('dm_image_d', 150, interval '1 day');
    v_meta := jsonb_build_object('path', p_meta ->> 'path', 'w', least(greatest(coalesce((p_meta ->> 'w')::int, 0), 0), 8000), 'h', least(greatest(coalesce((p_meta ->> 'h')::int, 0), 0), 8000));
  elsif v_kind in ('invite', 'join') then
    if coalesce(p_meta ->> 'game', '') !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
      raise exception 'Bad game' using errcode = '22023';
    end if;
    if v_kind = 'invite' and coalesce(p_meta ->> 'code', '') !~ '^[A-Z0-9]{3,8}$' then
      raise exception 'Bad code' using errcode = '22023';
    end if;
    v_meta := jsonb_build_object('game', p_meta ->> 'game') || case when v_kind = 'invite' then jsonb_build_object('code', p_meta ->> 'code') else '{}'::jsonb end;
    if exists (select 1 from public.dms d where d.from_id = v_me and d.to_id = p_to and d.kind = v_kind and d.meta = v_meta and d.read_at is null and d.created_at > now() - interval '30 seconds') then
      select d.id into v_id from public.dms d where d.from_id = v_me and d.to_id = p_to and d.kind = v_kind and d.meta = v_meta and d.read_at is null order by d.id desc limit 1;
      return v_id;
    end if;
    perform private.rate_check('party', 1, interval '3 seconds');
    perform private.rate_check('party_h', 300, interval '1 hour');
    delete from public.dms d where d.from_id = v_me and d.to_id = p_to and d.kind = v_kind and d.read_at is null and d.meta ->> 'game' = v_meta ->> 'game';
  else
    raise exception 'Bad kind' using errcode = '22023';
  end if;
  insert into public.dms (from_id, to_id, kind, body, meta) values (v_me, p_to, v_kind, v_body, v_meta) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.dm_inbox()
returns table (other_id uuid, last_id bigint, last_kind text, last_body text, last_mine boolean, last_at timestamptz, unread integer, last_meta jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select o.other_id, l.id, l.kind, l.body, l.from_id = auth.uid(), l.created_at,
    (select count(*)::integer from public.dms x where x.to_id = auth.uid() and x.from_id = o.other_id and x.read_at is null),
    l.meta
  from (
    select distinct case when d.from_id = auth.uid() then d.to_id else d.from_id end as other_id
    from public.dms d where auth.uid() is not null and (d.from_id = auth.uid() or d.to_id = auth.uid())
  ) o
  cross join lateral (
    select d.* from public.dms d
    where (d.from_id = auth.uid() and d.to_id = o.other_id) or (d.to_id = auth.uid() and d.from_id = o.other_id)
    order by d.id desc limit 1
  ) l
  where not exists (select 1 from public.user_blocks b where b.blocker = auth.uid() and b.blocked = o.other_id)
  order by l.id desc;
$$;

create or replace function public.dm_upload_ok(p_to text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null or p_to is null or p_to !~ '^[0-9a-f-]{36}$' then
    return false;
  end if;
  if private.blocked_between(v_me, p_to::uuid) then
    return false;
  end if;
  return private.rate_ok('dm_upload', 12, interval '1 minute') and private.rate_ok('dm_upload_d', 200, interval '1 day');
end;
$$;

drop policy if exists "dm: upload to friend" on storage.objects;
create policy "dm: upload to friend" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'dm'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.friends f where f.user_id = (select auth.uid()) and f.friend_id::text = (storage.foldername(name))[2])
    and not exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.locked)
    and public.dm_upload_ok((storage.foldername(name))[2])
  );

create or replace function public.ticket_create(p_subject text, p_body text)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if not private.is_staff(v_uid) then
    perform private.rate_check('ticket_create', 3, interval '10 minutes');
    perform private.rate_check('ticket_create_d', 12, interval '1 day');
    if (select count(*) from public.tickets t where t.user_id = v_uid and t.status = 'open') >= 10 then
      raise exception 'Too many open tickets' using errcode = '54000';
    end if;
  end if;
  insert into public.tickets (user_id, subject) values (v_uid, p_subject) returning id into v_id;
  insert into public.ticket_messages (ticket_id, body) values (v_id, p_body);
  return v_id;
end;
$$;

create or replace function public.ticket_send(p_ticket bigint, p_body text)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_id bigint;
begin
  if auth.uid() is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if not private.is_staff(auth.uid()) then
    perform private.rate_check('ticket_send', 10, interval '1 minute');
    perform private.rate_check('ticket_send_d', 200, interval '1 day');
  end if;
  insert into public.ticket_messages (ticket_id, body) values (p_ticket, p_body) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.sync_game_stats(p_batch uuid default null, p_rows jsonb default '[]'::jsonb)
returns setof public.game_stats
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_row jsonb;
  v_new integer := 0;
  v_plays integer;
  v_secs double precision;
  v_best double precision;
  v_better text;
  v_last timestamptz;
  v_prev timestamptz;
  v_budget double precision;
  v_pbudget integer := 20000;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 300 then
    raise exception 'p_rows must be an array of at most 300 rows' using errcode = '22023';
  end if;
  if jsonb_array_length(p_rows) > 0 then
    if p_batch is null then
      raise exception 'p_batch is required' using errcode = '22023';
    end if;
    perform private.rate_check('sync', 150, interval '10 minutes');
    select max(b.created_at) into v_prev from private.sync_batches b where b.user_id = v_uid;
    v_budget := case when v_prev is null then 604800 else least(604800, 3 * greatest(0, extract(epoch from (now() - v_prev))) + 3600) end;
    insert into private.sync_batches (user_id, batch_id) values (v_uid, p_batch) on conflict do nothing;
    get diagnostics v_new = row_count;
    if v_new = 1 then
      for v_row in select value from jsonb_array_elements(p_rows) loop
        continue when jsonb_typeof(v_row) <> 'object';
        continue when coalesce(v_row ->> 'game_id', '') !~ '^[a-z0-9][a-z0-9-]{0,39}$';
        v_plays := case when jsonb_typeof(v_row -> 'plays') = 'number' then floor(least(greatest((v_row ->> 'plays')::numeric, 0), 5000))::integer else 0 end;
        v_plays := least(v_plays, v_pbudget);
        v_pbudget := v_pbudget - v_plays;
        v_secs := case when jsonb_typeof(v_row -> 'seconds') = 'number' then least(greatest((v_row ->> 'seconds')::numeric, 0), 604800)::double precision else 0 end;
        v_secs := least(v_secs, v_budget);
        v_budget := v_budget - v_secs;
        v_best := case when jsonb_typeof(v_row -> 'best') = 'number' and abs((v_row ->> 'best')::numeric) < 1e15 then (v_row ->> 'best')::double precision end;
        v_better := case when v_row ->> 'better' = 'low' then 'low' else 'high' end;
        v_last := case when jsonb_typeof(v_row -> 'last_played') = 'string' and (v_row ->> 'last_played') ~ '^\d{4}-\d{2}-\d{2}' then least(now(), (v_row ->> 'last_played')::timestamptz) end;
        continue when v_plays = 0 and v_secs = 0 and v_best is null and v_last is null;
        insert into public.game_stats as s (user_id, game_id, plays, seconds_played, best_score, best_better, last_played)
        values (v_uid, v_row ->> 'game_id', v_plays, v_secs, v_best, v_better, v_last)
        on conflict (user_id, game_id) do update set
          plays = least(s.plays + excluded.plays, 10000000),
          seconds_played = least(s.seconds_played + excluded.seconds_played, 1000000000),
          best_better = excluded.best_better,
          best_score = case
            when excluded.best_score is null then s.best_score
            when s.best_score is null then excluded.best_score
            when excluded.best_better = 'low' then least(s.best_score, excluded.best_score)
            else greatest(s.best_score, excluded.best_score)
          end,
          last_played = greatest(s.last_played, excluded.last_played);
      end loop;
    end if;
    if random() < 0.02 then
      delete from private.sync_batches where user_id = v_uid and created_at < now() - interval '60 days';
    end if;
  end if;
  return query select * from public.game_stats where user_id = v_uid order by game_id;
end;
$$;

create or replace function public.export_my_data()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return null;
  end if;
  perform private.rate_check('export', 5, interval '1 hour');
  return jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at, 'providers', u.raw_app_meta_data -> 'providers') from auth.users u where u.id = auth.uid()),
    'profile', (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
    'game_stats', coalesce((select jsonb_agg(to_jsonb(s) order by s.game_id) from public.game_stats s where s.user_id = auth.uid()), '[]'::jsonb),
    'game_saves', coalesce((select jsonb_agg(to_jsonb(s) order by s.game_id) from public.game_saves s where s.user_id = auth.uid()), '[]'::jsonb),
    'friends', coalesce((select jsonb_agg(to_jsonb(f)) from public.my_friends() f), '[]'::jsonb),
    'friend_requests', coalesce((select jsonb_agg(to_jsonb(r)) from public.my_friend_requests() r), '[]'::jsonb),
    'blocks', coalesce((select jsonb_agg(jsonb_build_object('blocked', b.blocked, 'created_at', b.created_at)) from public.user_blocks b where b.blocker = auth.uid()), '[]'::jsonb),
    'analytics_events', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at) from (select created_at, session_id, event, game_id, props, device from public.analytics_events where user_id = auth.uid() order by created_at desc limit 20000) e), '[]'::jsonb)
  );
end;
$$;

create or replace function public.delete_my_account()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  perform private.rate_check('delete_account', 3, interval '1 hour');
  delete from public.game_saves where user_id = v_uid;
  delete from public.game_stats where user_id = v_uid;
  delete from public.friends where user_id = v_uid or friend_id = v_uid;
  delete from public.friend_requests where from_id = v_uid or to_id = v_uid;
  delete from public.dms where from_id = v_uid or to_id = v_uid;
  delete from public.user_blocks where blocker = v_uid or blocked = v_uid;
  update public.analytics_events set user_id = null where user_id = v_uid;
  begin
    delete from auth.users where id = v_uid;
    return 'deleted';
  exception when insufficient_privilege then
    update public.profiles set username = null, display_name = null, avatar_url = null where id = v_uid;
    insert into public.account_deletion_requests (user_id) values (v_uid) on conflict (user_id) do nothing;
    return 'requested';
  end;
end;
$$;

create or replace function public.block_user(p_uid uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if p_uid is null or p_uid = v_me then
    return 'self';
  end if;
  if not exists (select 1 from public.profiles p where p.id = p_uid) then
    return 'not_found';
  end if;
  perform private.rate_check('block', 30, interval '1 hour');
  insert into public.user_blocks (blocker, blocked) values (v_me, p_uid) on conflict do nothing;
  delete from public.friends where (user_id = v_me and friend_id = p_uid) or (user_id = p_uid and friend_id = v_me);
  delete from public.friend_requests where (from_id = v_me and to_id = p_uid) or (from_id = p_uid and to_id = v_me);
  delete from public.dms where from_id = p_uid and to_id = v_me and kind in ('invite', 'join') and read_at is null;
  return 'blocked';
end;
$$;

create or replace function public.unblock_user(p_uid uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  perform private.rate_check('unblock', 30, interval '1 hour');
  delete from public.user_blocks where blocker = v_me and blocked = p_uid;
  return 'unblocked';
end;
$$;

create or replace function public.my_blocks()
returns table (blocked uuid, username text, display_name text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select b.blocked, p.username, p.display_name, b.created_at
  from public.user_blocks b
  left join public.profiles p on p.id = b.blocked
  where b.blocker = auth.uid()
  order by b.created_at desc
  limit 500;
$$;

create or replace function public.report_user(p_uid uuid, p_reason text, p_details text default null, p_block boolean default false)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_reason text := lower(btrim(coalesce(p_reason, '')));
  v_details text := nullif(left(btrim(regexp_replace(coalesce(p_details, ''), '[\x01-\x09\x0B-\x1F\x7F]', '', 'g')), 1000), '');
  v_un text;
  v_dn text;
  v_id bigint;
  v_ticket bigint;
  v_ctx jsonb;
begin
  if v_me is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles p where p.id = v_me and p.locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  if p_uid is null or p_uid = v_me then
    raise exception 'Bad target' using errcode = '22023';
  end if;
  select p.username, p.display_name into v_un, v_dn from public.profiles p where p.id = p_uid;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  if v_reason not in ('spam', 'harassment', 'cheating', 'inappropriate', 'other') then
    v_reason := 'other';
  end if;
  select r.id into v_id from public.user_reports r where r.reporter = v_me and r.target = p_uid and r.created_at > now() - interval '1 day' order by r.id desc limit 1;
  if v_id is not null then
    if p_block then
      perform public.block_user(p_uid);
    end if;
    return v_id;
  end if;
  perform private.rate_check('report', 5, interval '1 hour');
  perform private.rate_check('report_d', 15, interval '1 day');
  v_ctx := jsonb_build_object('messages', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'from_reported', m.from_id = p_uid, 'kind', m.kind, 'body', left(coalesce(m.body, ''), 500), 'meta', m.meta, 'at', m.created_at) order by m.id) from (select d.* from public.dms d where (d.from_id = v_me and d.to_id = p_uid) or (d.from_id = p_uid and d.to_id = v_me) order by d.id desc limit 30) m), '[]'::jsonb));
  insert into public.user_reports (reporter, target, target_username, reason, details, context)
    values (v_me, p_uid, v_un, v_reason, v_details, v_ctx) returning id into v_id;
  begin
    insert into public.tickets (user_id, subject) values (v_me, left('Report: ' || coalesce('@' || v_un, v_dn, p_uid::text) || ' (' || v_reason || ')', 120)) returning id into v_ticket;
    insert into public.ticket_messages (ticket_id, body) values (v_ticket, left('Report #' || v_id || E'\nPlayer: ' || coalesce('@' || v_un, '-') || ' - ' || coalesce(v_dn, '-') || E'\nUser id: ' || p_uid::text || E'\nReason: ' || v_reason || coalesce(E'\n\n' || v_details, ''), 2000));
    update public.user_reports set ticket_id = v_ticket where id = v_id;
  exception when others then
    null;
  end;
  if p_block then
    perform public.block_user(p_uid);
  end if;
  return v_id;
end;
$$;

create or replace function public.admin_reports(p_status text default 'open', p_limit integer default 100)
returns table (id bigint, created_at timestamptz, status text, reason text, details text, reporter uuid, reporter_username text, target uuid, target_username text, target_display text, target_locked boolean, target_reports bigint, ticket_id bigint, context jsonb)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  return query
    select r.id, r.created_at, r.status, r.reason, r.details, r.reporter, rp.username, r.target, coalesce(tp.username, r.target_username), tp.display_name, coalesce(tp.locked, false),
      (select count(*) from public.user_reports x where x.target = r.target),
      r.ticket_id, r.context
    from public.user_reports r
    left join public.profiles rp on rp.id = r.reporter
    left join public.profiles tp on tp.id = r.target
    where p_status is null or p_status = 'all' or r.status = p_status
    order by r.id desc
    limit greatest(1, least(coalesce(p_limit, 100), 500));
end;
$$;

create or replace function public.admin_report_set(p_id bigint, p_status text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  if p_status not in ('open', 'closed') then
    raise exception 'Status must be open or closed' using errcode = '22023';
  end if;
  update public.user_reports set status = p_status, closed_at = case when p_status = 'closed' then now() end, closed_by = case when p_status = 'closed' then v_me end where id = p_id;
  if not found then
    raise exception 'Report not found' using errcode = 'P0002';
  end if;
  return p_status;
end;
$$;

create or replace function public.admin_abuse(p_hours integer default 24)
returns table (action text, uid uuid, username text, display_name text, ip text, hits bigint, at_limit bigint, last_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_since timestamptz := now() - make_interval(hours => greatest(1, least(coalesce(p_hours, 24), 192)));
begin
  perform private.need_admin();
  return query
    select h.action, h.uid, p.username, p.display_name, left(case when h.uid is null then max(h.ip) end, 10), count(*), count(*) filter (where h.full_hit), max(h.at)
    from private.rate_hits h
    left join public.profiles p on p.id = h.uid
    where h.at > v_since
    group by h.action, h.uid, p.username, p.display_name, case when h.uid is null then h.ip end
    having count(*) filter (where h.full_hit) > 0 or count(*) >= 20
    order by count(*) filter (where h.full_hit) desc, count(*) desc
    limit 300;
end;
$$;

create or replace function public.admin_rate_reset(p_uid uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_n integer;
begin
  perform private.need_admin();
  delete from private.rate_hits where uid = p_uid;
  get diagnostics v_n = row_count;
  perform private.admin_log('rate_reset', p_uid, jsonb_build_object('rows', v_n));
  return v_n;
end;
$$;

revoke all on function public.username_available(text) from public, anon, authenticated;
revoke all on function public.search_profiles(text) from public, anon, authenticated;
revoke all on function public.list_people(text, integer) from public, anon, authenticated;
revoke all on function public.login_email(text, text) from public, anon, authenticated;
revoke all on function public.send_friend_request(text) from public, anon, authenticated;
revoke all on function public.respond_friend_request(bigint, boolean) from public, anon, authenticated;
revoke all on function public.dm_send(uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.dm_inbox() from public, anon, authenticated;
revoke all on function public.dm_upload_ok(text) from public, anon, authenticated;
revoke all on function public.ticket_create(text, text) from public, anon, authenticated;
revoke all on function public.ticket_send(bigint, text) from public, anon, authenticated;
revoke all on function public.sync_game_stats(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.export_my_data() from public, anon, authenticated;
revoke all on function public.delete_my_account() from public, anon, authenticated;
revoke all on function public.block_user(uuid) from public, anon, authenticated;
revoke all on function public.unblock_user(uuid) from public, anon, authenticated;
revoke all on function public.my_blocks() from public, anon, authenticated;
revoke all on function public.report_user(uuid, text, text, boolean) from public, anon, authenticated;
revoke all on function public.admin_reports(text, integer) from public, anon, authenticated;
revoke all on function public.admin_report_set(bigint, text) from public, anon, authenticated;
revoke all on function public.admin_abuse(integer) from public, anon, authenticated;
revoke all on function public.admin_rate_reset(uuid) from public, anon, authenticated;
grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.search_profiles(text) to authenticated;
grant execute on function public.list_people(text, integer) to authenticated;
grant execute on function public.login_email(text, text) to anon, authenticated;
grant execute on function public.send_friend_request(text) to authenticated;
grant execute on function public.respond_friend_request(bigint, boolean) to authenticated;
grant execute on function public.dm_send(uuid, text, text, jsonb) to authenticated;
grant execute on function public.dm_inbox() to authenticated;
grant execute on function public.dm_upload_ok(text) to authenticated;
grant execute on function public.ticket_create(text, text) to authenticated;
grant execute on function public.ticket_send(bigint, text) to authenticated;
grant execute on function public.sync_game_stats(uuid, jsonb) to authenticated;
grant execute on function public.export_my_data() to authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.block_user(uuid) to authenticated;
grant execute on function public.unblock_user(uuid) to authenticated;
grant execute on function public.my_blocks() to authenticated;
grant execute on function public.report_user(uuid, text, text, boolean) to authenticated;
grant execute on function public.admin_reports(text, integer) to authenticated;
grant execute on function public.admin_report_set(bigint, text) to authenticated;
grant execute on function public.admin_abuse(integer) to authenticated;
grant execute on function public.admin_rate_reset(uuid) to authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
notify pgrst, 'reload schema';

create table if not exists private.presence_ticks (
  at timestamptz not null,
  user_id uuid not null,
  primary key (at, user_id)
);
alter table private.presence_ticks enable row level security;
revoke all on private.presence_ticks from public, anon, authenticated;

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
    insert into private.presence_ticks (at, user_id) values (to_timestamp(floor(extract(epoch from now()) / 300) * 300), v_uid) on conflict do nothing;
    if random() < 0.002 then
      delete from private.presence_ticks where at < now() - interval '400 days';
    end if;
  end if;
  return query select p.role, p.locked, p.locked_reason, p.locked_until from public.profiles p where p.id = v_uid;
end;
$$;

create or replace function private.play_rows(p_since timestamptz)
returns table (session_id text, who text, user_id uuid, game_id text, visit text, at timestamptz, sec numeric)
language sql
stable
set search_path = ''
as $$
  with beats as (
    select e.session_id, coalesce(e.visitor_id, e.user_id::text, e.session_id) as who, e.user_id, e.game_id,
      left(e.props ->> 'v', 40) as visit, e.created_at,
      least(private.jnum(e.props, 'sec'), 43200) as cum
    from public.analytics_events e
    where e.event = 'game_active' and e.game_id is not null and e.created_at >= p_since - interval '2 days'
      and private.jnum(e.props, 'sec') > 0 and coalesce(e.props ->> 'v', '') <> ''
  ), steps as (
    select b.session_id, b.who, b.user_id, b.game_id, b.visit, b.created_at,
      b.cum - coalesce(max(b.cum) over (partition by b.session_id, b.visit order by b.cum, b.created_at rows between unbounded preceding and 1 preceding), 0) as inc
    from beats b
  ), modern as (
    select distinct e.session_id
    from public.analytics_events e
    where e.event = 'game_active' and e.created_at >= p_since - interval '2 days'
  )
  select s.session_id, s.who, s.user_id, s.game_id, s.visit, s.created_at, s.inc
  from steps s
  where s.created_at >= p_since and s.inc > 0
  union all
  select e.session_id, coalesce(e.visitor_id, e.user_id::text, e.session_id), e.user_id, e.game_id, null::text, e.created_at, least(private.jnum(e.props, 'sec'), 43200)
  from public.analytics_events e
  left join modern m on m.session_id = e.session_id
  where e.event = 'game_time' and e.game_id is not null and e.created_at >= p_since
    and private.jnum(e.props, 'sec') > 0 and m.session_id is null
$$;

create or replace function public.admin_stats_v2(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 366));
  v_to date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_to - (v_days - 1);
  v_since timestamptz := (v_from::timestamp at time zone 'Europe/Paris');
  v_wk timestamptz := now() - interval '7 days';
  v_lo timestamptz;
  r jsonb;
begin
  perform private.need_admin();
  v_lo := least(v_since, v_wk);
  with p as materialized (
    select x.who, x.game_id, x.visit, x.at, x.sec, (x.at at time zone 'Europe/Paris')::date as day
    from private.play_rows(v_lo) x
  ), ev as materialized (
    select a.game_id, a.event, a.created_at, coalesce(a.visitor_id, a.user_id::text, a.session_id) as who
    from public.analytics_events a
    where a.created_at >= v_lo and a.game_id is not null and a.event in ('game_launch', 'game_play')
  ), pg as (
    select p.game_id,
      coalesce(sum(p.sec) filter (where p.at >= v_since), 0) as sec,
      coalesce(sum(p.sec) filter (where p.at >= v_wk), 0) as sec_7d,
      count(distinct p.visit) filter (where p.at >= v_since) as visits
    from p
    group by p.game_id
  ), eg as (
    select e.game_id,
      count(*) filter (where e.event = 'game_launch' and e.created_at >= v_since) as launches,
      count(*) filter (where e.event = 'game_launch' and e.created_at >= v_wk) as launches_7d,
      count(*) filter (where e.event = 'game_play' and e.created_at >= v_since) as plays
    from ev e
    group by e.game_id
  ), pl as (
    select z.game_id, count(distinct z.who) as players
    from (
      select e.game_id, e.who from ev e where e.created_at >= v_since
      union
      select p.game_id, p.who from p where p.at >= v_since
    ) z
    group by z.game_id
  ), ag as (
    select a.game_id,
      count(*) filter (where a.event = 'game_launch') as launches_all,
      max(a.created_at) filter (where a.event = 'game_launch') as last_launch,
      count(*) filter (where a.event = 'error') as errors,
      count(*) filter (where a.event = 'error' and a.created_at > v_wk) as errors_7d,
      (array_agg(a.props ->> 'msg' order by a.created_at desc) filter (where a.event = 'error'))[1] as last_error,
      max(a.created_at) filter (where a.event = 'error') as last_error_at
    from public.analytics_events a
    where a.game_id is not null and a.event in ('game_launch', 'error')
    group by a.game_id
  ), sg as (
    select s.game_id, count(*) as accounts, round((sum(s.seconds_played) / 3600)::numeric, 1) as acct_hours
    from public.game_stats s
    group by s.game_id
  ), k as (
    select pg.game_id from pg where pg.sec > 0
    union select eg.game_id from eg
    union select ag.game_id from ag
    union select sg.game_id from sg
  ), g as (
    select k.game_id,
      coalesce(eg.launches, 0) as launches, coalesce(eg.launches_7d, 0) as launches_7d, coalesce(ag.launches_all, 0) as launches_all,
      coalesce(eg.plays, 0) as plays, coalesce(pl.players, 0) as players,
      coalesce(pg.sec, 0) as sec, coalesce(pg.sec_7d, 0) as sec_7d,
      greatest(coalesce(eg.launches, 0), coalesce(pg.visits, 0)) as visits,
      coalesce(ag.errors, 0) as errors, coalesce(ag.errors_7d, 0) as errors_7d, ag.last_error, ag.last_error_at,
      coalesce(sg.accounts, 0) as accounts, coalesce(sg.acct_hours, 0) as acct_hours, ag.last_launch
    from k
    left join pg on pg.game_id = k.game_id
    left join eg on eg.game_id = k.game_id
    left join pl on pl.game_id = k.game_id
    left join ag on ag.game_id = k.game_id
    left join sg on sg.game_id = k.game_id
  )
  select jsonb_build_object(
    'days', v_days,
    'measure', 2,
    'series', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day', d.day,
        'active', coalesce(e.active, 0),
        'signed_in', coalesce(e.signed_in, 0),
        'sessions', coalesce(e.sessions, 0),
        'launches', coalesce(e.launches, 0),
        'hours', round(coalesce(h.sec, 0) / 3600, 2),
        'signups', coalesce(s.signups, 0),
        'peak', case when pk.peak is null and tk.peak is null then null else greatest(coalesce(pk.peak, 0), coalesce(tk.peak, 0)) end
      ) order by d.day)
      from (select generate_series(v_from, v_to, interval '1 day')::date as day) d
      left join (
        select w.day,
          count(distinct w.who) as active,
          count(distinct w.user_id) as signed_in,
          count(distinct w.session_id) as sessions,
          count(*) filter (where w.event = 'game_launch') as launches
        from admin.events_who w
        where w.created_at >= v_since
        group by w.day
      ) e on e.day = d.day
      left join (select p.day, sum(p.sec) as sec from p where p.at >= v_since group by p.day) h on h.day = d.day
      left join (
        select (u.created_at at time zone 'Europe/Paris')::date as day, count(*) as signups
        from auth.users u
        where u.created_at >= v_since
        group by 1
      ) s on s.day = d.day
      left join (
        select (x.at at time zone 'Europe/Paris')::date as day, max(x.online) as peak
        from public.presence_samples x
        where x.at >= v_since
        group by 1
      ) pk on pk.day = d.day
      left join (
        select (t.at at time zone 'Europe/Paris')::date as day, max(t.n) as peak
        from (select pt.at, count(*) as n from private.presence_ticks pt where pt.at >= v_since group by pt.at) t
        group by 1
      ) tk on tk.day = d.day
    ), '[]'::jsonb),
    'game_days', coalesce((
      select jsonb_object_agg(gd.game_id, gd.days)
      from (
        select kk.game_id, jsonb_agg(coalesce(c.n, 0) order by d.day) as days
        from (select distinct e.game_id from ev e where e.event = 'game_launch' and e.created_at >= v_since) kk
        cross join (select generate_series(v_from, v_to, interval '1 day')::date as day) d
        left join (
          select e.game_id, (e.created_at at time zone 'Europe/Paris')::date as day, count(*) as n
          from ev e
          where e.event = 'game_launch' and e.created_at >= v_since
          group by 1, 2
        ) c on c.game_id = kk.game_id and c.day = d.day
        group by kk.game_id
      ) gd
    ), '{}'::jsonb),
    'game_hours', coalesce((select jsonb_object_agg(g.game_id, round(g.sec / 3600, 2)) from g where g.sec > 0), '{}'::jsonb),
    'games', coalesce((
      select jsonb_agg(jsonb_build_object(
        'game_id', g.game_id,
        'launches', g.launches, 'launches_7d', g.launches_7d, 'launches_all', g.launches_all,
        'plays', g.plays, 'players', g.players,
        'hours', round(g.sec / 3600, 2), 'hours_7d', round(g.sec_7d / 3600, 2),
        'visits', g.visits,
        'avg_min', case when g.visits > 0 then round(g.sec / 60 / g.visits, 1) else 0 end,
        'errors', g.errors, 'errors_7d', g.errors_7d, 'last_error', g.last_error, 'last_error_at', g.last_error_at,
        'accounts', g.accounts, 'acct_hours', g.acct_hours, 'last_launch', g.last_launch
      ) order by g.launches desc, g.sec desc, g.game_id)
      from g
    ), '[]'::jsonb),
    'play', (
      select jsonb_build_object(
        'hours', round(coalesce(sum(p.sec), 0) / 3600, 2),
        'legacy_hours', round(coalesce(sum(p.sec) filter (where p.visit is null), 0) / 3600, 2),
        'players', count(distinct p.who),
        'visits', (select count(*) from ev e where e.event = 'game_launch' and e.created_at >= v_since),
        'since', v_since
      )
      from p
      where p.at >= v_since
    ),
    'device_split', coalesce((
      select jsonb_agg(jsonb_build_object('device', z.device, 'sessions', z.n) order by z.n desc)
      from (
        select coalesce(a.device, 'unknown') as device, count(*) as n
        from public.analytics_events a
        where a.event = 'session' and a.created_at >= v_since
        group by 1
      ) z
    ), '[]'::jsonb),
    'peak_samples', (select count(*) from public.presence_samples x where x.at >= v_since) + (select count(distinct pt.at) from private.presence_ticks pt where pt.at >= v_since)
  ) into r;
  return public.admin_stats() || r;
end;
$$;

create or replace function public.admin_play_insights(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 366));
  v_since timestamptz := now() - make_interval(days => v_days);
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_today - (v_days - 1);
  r jsonb;
begin
  perform private.need_admin();
  with p as materialized (
    select x.session_id, x.who, x.user_id, x.game_id, x.visit, x.at, x.sec from private.play_rows(least(v_since, now() - interval '60 days')) x
  ), geo as (
    select distinct on (e.session_id) e.session_id, private.jnum(e.props, 'off') as off
    from public.analytics_events e
    where e.event = 'env_geo' and e.created_at >= v_since - interval '1 day'
    order by e.session_id, e.created_at
  ), lg as (
    select a.game_id, count(*) as n
    from public.analytics_events a
    where a.event = 'game_launch' and a.game_id is not null and a.created_at >= v_since
    group by a.game_id
  ), pg as (
    select p.game_id, sum(p.sec) as sec, count(distinct p.visit) as visits
    from p
    where p.at >= v_since
    group by p.game_id
  ), firsts as (
    select w.who from admin.events_who w where w.created_at >= now() - interval '400 days' group by w.who having min(w.day) >= v_from
  )
  select jsonb_build_object(
    'days', v_days,
    'hours', coalesce((
      select jsonb_agg(jsonb_build_object('d', t.d, 'h', t.h, 'v', t.v))
      from (
        select extract(isodow from x.t)::int - 1 as d, extract(hour from x.t)::int as h, round(sum(x.sec) / 3600, 2) as v
        from (
          select case when g.off between -900 and 900
              then (p.at at time zone 'UTC') + make_interval(mins => g.off::int)
              else p.at at time zone 'Europe/Paris' end as t,
            p.sec
          from p
          left join geo g on g.session_id = p.session_id
          where p.at >= v_since
        ) x
        group by 1, 2
      ) t
    ), '[]'::jsonb),
    'games', coalesce((
      select jsonb_agg(jsonb_build_object('id', pg.game_id, 'sec', round(pg.sec / greatest(coalesce(lg.n, 0), pg.visits, 1)), 'visits', greatest(coalesce(lg.n, 0), pg.visits), 'hours', round(pg.sec / 3600, 2)))
      from pg
      left join lg on lg.game_id = pg.game_id
    ), '[]'::jsonb),
    'played', (
      select count(*) from (
        select f.who from firsts f join p on p.who = f.who and p.at >= v_since group by f.who having sum(p.sec) >= 60
      ) q
    ),
    'user_hours', coalesce((
      select jsonb_object_agg(u.user_id, u.hours)
      from (
        select p.user_id, round(sum(p.sec) / 3600, 1) as hours
        from p
        where p.user_id is not null and p.at >= now() - interval '60 days'
        group by p.user_id
      ) u
    ), '{}'::jsonb),
    'at', now()
  ) into r;
  return r;
end;
$$;

alter table public.site_gate add column if not exists open_key text;
alter table public.site_gate add column if not exists open_at timestamptz;
alter table public.site_gate add column if not exists open_by uuid;
alter table public.site_gate drop constraint if exists site_gate_open_key_check;
alter table public.site_gate add constraint site_gate_open_key_check check (open_key is null or open_key ~ '^[A-Za-z0-9+/]{43}=$');

create or replace function public.get_gate_slot()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case when g.open_key is null then g.slot else g.slot || jsonb_build_object('o', g.open_key) end
  from public.site_gate g
  where g.id = 1;
$$;

create or replace function public.owner_gate_state()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.need_owner();
  return coalesce((
    select jsonb_build_object(
      'ready', true,
      'open', g.open_key is not null,
      'at', g.open_at,
      'by', g.open_by,
      'by_name', coalesce('@' || p.username, p.display_name),
      'kh', case when g.open_key is not null then left(encode(sha256(convert_to(g.open_key, 'UTF8')), 'hex'), 16) end,
      'pw_at', g.updated_at
    )
    from public.site_gate g
    left join public.profiles p on p.id = g.open_by
    where g.id = 1
  ), jsonb_build_object('ready', false, 'open', false));
end;
$$;

create or replace function public.owner_set_gate_open(p_open boolean, p_key text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_owner();
  v_key text := btrim(coalesce(p_key, ''));
begin
  if p_open is null then
    raise exception 'p_open is required' using errcode = '22023';
  end if;
  if p_open and v_key !~ '^[A-Za-z0-9+/]{43}=$' then
    raise exception 'Bad site key' using errcode = '22023';
  end if;
  update public.site_gate g
    set open_key = case when p_open then v_key end, open_at = now(), open_by = v_me
    where g.id = 1;
  if not found then
    raise exception 'No site password is set up yet' using errcode = 'P0002';
  end if;
  perform private.admin_log(case when p_open then 'gate_open' else 'gate_closed' end, null, '{}'::jsonb);
  return public.owner_gate_state();
end;
$$;

revoke all on function public.touch_presence(text, text) from public, anon, authenticated;
revoke all on function private.play_rows(timestamptz) from public, anon, authenticated;
revoke all on function public.admin_stats_v2(integer) from public, anon, authenticated;
revoke all on function public.admin_play_insights(integer) from public, anon, authenticated;
revoke all on function public.get_gate_slot() from public, anon, authenticated;
revoke all on function public.owner_gate_state() from public, anon, authenticated;
revoke all on function public.owner_set_gate_open(boolean, text) from public, anon, authenticated;
grant execute on function public.touch_presence(text, text) to authenticated;
grant execute on function public.admin_stats_v2(integer) to authenticated;
grant execute on function public.admin_play_insights(integer) to authenticated;
grant execute on function public.get_gate_slot() to anon, authenticated;
grant execute on function public.owner_gate_state() to authenticated;
grant execute on function public.owner_set_gate_open(boolean, text) to authenticated;
notify pgrst, 'reload schema';

create or replace function private.gate_slot_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.slot is distinct from old.slot then
    new.open_key := null;
  end if;
  return new;
end;
$$;

drop trigger if exists site_gate_slot_guard on public.site_gate;
create trigger site_gate_slot_guard before update on public.site_gate
  for each row execute function private.gate_slot_guard();

create table if not exists public.chat_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('party', 'game')),
  game text check (game is null or char_length(game) <= 40),
  room text check (room is null or char_length(room) <= 16),
  body text not null check (char_length(body) <= 500),
  created_at timestamptz not null default now()
);
create index if not exists chat_log_user_idx on public.chat_log (user_id, kind, id desc);
create index if not exists chat_log_room_idx on public.chat_log (room, created_at) where room is not null;
create index if not exists chat_log_time_idx on public.chat_log (created_at);
alter table public.chat_log enable row level security;
revoke all on public.chat_log from anon, authenticated;
grant all on public.chat_log to service_role;

create index if not exists dms_from_idx on public.dms (from_id, id desc);
create index if not exists dms_to_idx on public.dms (to_id, id desc);

create or replace function public.log_chat(p_kind text, p_game text, p_room text, p_body text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_body text;
begin
  if v_uid is null or p_kind is null or p_kind not in ('party', 'game') then
    return;
  end if;
  v_body := nullif(btrim(regexp_replace(left(coalesce(p_body, ''), 500), E'[\\x01-\\x1f\\x7f]', ' ', 'g')), '');
  if v_body is null then
    return;
  end if;
  if not private.rate_ok('log_chat', 90, interval '1 minute') then
    return;
  end if;
  insert into public.chat_log (user_id, kind, game, room, body)
  values (v_uid, p_kind, left(nullif(btrim(coalesce(p_game, '')), ''), 40), upper(left(nullif(regexp_replace(coalesce(p_room, ''), '[^A-Za-z0-9]', '', 'g'), ''), 16)), v_body);
  if random() < 0.01 then
    delete from public.chat_log where created_at < now() - interval '365 days';
  end if;
end;
$$;

create or replace function public.admin_user_chat(p_uid uuid, p_kind text default 'dm', p_before bigint default null, p_limit integer default 60)
returns table (id bigint, created_at timestamptz, kind text, game text, room text, body text, outgoing boolean, other uuid, other_username text, other_display text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_lim integer := greatest(1, least(coalesce(p_limit, 60), 200));
begin
  if p_kind is null or p_kind not in ('dm', 'party', 'game') then
    raise exception 'Unknown kind' using errcode = '22023';
  end if;
  if p_before is null and not exists (select 1 from public.admin_log l where l.admin_id = v_me and l.action = 'view_chat' and l.target_user = p_uid and l.detail ->> 'kind' = p_kind and l.at > now() - interval '30 minutes') then
    perform private.admin_log('view_chat', p_uid, jsonb_build_object('kind', p_kind));
  end if;
  if p_kind = 'dm' then
    return query
      select d.id, d.created_at, d.kind, d.meta ->> 'game', d.meta ->> 'code', d.body, d.from_id = p_uid,
        case when d.from_id = p_uid then d.to_id else d.from_id end, op.username, op.display_name
      from public.dms d
      left join public.profiles op on op.id = case when d.from_id = p_uid then d.to_id else d.from_id end
      where (d.from_id = p_uid or d.to_id = p_uid) and (p_before is null or d.id < p_before)
      order by d.id desc
      limit v_lim;
  else
    return query
      select c.id, c.created_at, c.kind, c.game, c.room, c.body, true, null::uuid, null::text, null::text
      from public.chat_log c
      where c.user_id = p_uid and c.kind = p_kind and (p_before is null or c.id < p_before)
      order by c.id desc
      limit v_lim;
  end if;
end;
$$;

create or replace function public.admin_room_chat(p_room text, p_at timestamptz)
returns table (id bigint, created_at timestamptz, kind text, game text, user_id uuid, username text, display_name text, body text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  return query
    select c.id, c.created_at, c.kind, c.game, c.user_id, p.username, p.display_name, c.body
    from public.chat_log c
    left join public.profiles p on p.id = c.user_id
    where c.room = upper(p_room) and c.created_at between p_at - interval '3 hours' and p_at + interval '3 hours'
    order by c.created_at, c.id
    limit 400;
end;
$$;

create or replace function public.admin_chat_search(p_q text, p_limit integer default 100)
returns table (id bigint, created_at timestamptz, kind text, game text, room text, user_id uuid, username text, display_name text, other_username text, body text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_q text := btrim(coalesce(p_q, ''));
  v_lim integer := greatest(1, least(coalesce(p_limit, 100), 300));
begin
  if char_length(v_q) < 2 then
    return;
  end if;
  perform private.admin_log('search_chat', null, jsonb_build_object('q', left(v_q, 80)));
  return query
    select * from (
      select c.id, c.created_at, c.kind, c.game, c.room, c.user_id, p.username, p.display_name, null::text, c.body
      from public.chat_log c left join public.profiles p on p.id = c.user_id
      where c.body ilike '%' || replace(replace(v_q, '%', '\%'), '_', '\_') || '%'
      union all
      select d.id, d.created_at, 'dm'::text, d.meta ->> 'game', null::text, d.from_id, p.username, p.display_name, t.username, d.body
      from public.dms d left join public.profiles p on p.id = d.from_id left join public.profiles t on t.id = d.to_id
      where d.kind = 'text' and d.body ilike '%' || replace(replace(v_q, '%', '\%'), '_', '\_') || '%'
    ) x
    order by x.created_at desc
    limit v_lim;
end;
$$;

revoke all on function public.log_chat(text, text, text, text) from public, anon, authenticated;
revoke all on function public.admin_user_chat(uuid, text, bigint, integer) from public, anon, authenticated;
revoke all on function public.admin_room_chat(text, timestamptz) from public, anon, authenticated;
revoke all on function public.admin_chat_search(text, integer) from public, anon, authenticated;
grant execute on function public.log_chat(text, text, text, text) to authenticated;
grant execute on function public.admin_user_chat(uuid, text, bigint, integer) to authenticated;
grant execute on function public.admin_room_chat(text, timestamptz) to authenticated;
grant execute on function public.admin_chat_search(text, integer) to authenticated;

create or replace function private.is_test(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_uid is not null and exists (select 1 from public.test_accounts t where t.user_id = p_uid);
$$;
revoke all on function private.is_test(uuid) from public, anon, authenticated;

create table if not exists public.diag_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  sid text not null,
  seq integer not null,
  at timestamptz not null,
  kind text not null,
  data jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists diag_events_sid_seq_idx on public.diag_events (user_id, sid, seq);
create index if not exists diag_events_created_idx on public.diag_events (created_at);
create index if not exists diag_events_kind_idx on public.diag_events (user_id, kind, at desc);
alter table public.diag_events enable row level security;
revoke all on table public.diag_events from public, anon, authenticated;

create or replace function public.diag_enabled()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_test(auth.uid());
$$;

create or replace function public.diag_push(p_sid text, p_events jsonb)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_n integer := 0;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if not private.is_test(v_uid) then
    raise exception 'Not a test account' using errcode = '42501';
  end if;
  if p_sid is null or p_sid !~ '^[a-z0-9]{6,24}$' then
    raise exception 'Bad session id' using errcode = '22023';
  end if;
  if p_events is null or jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) > 500 or octet_length(p_events::text) > 2000000 then
    raise exception 'Bad batch' using errcode = '22023';
  end if;
  insert into public.diag_events (user_id, sid, seq, at, kind, data)
  select v_uid, p_sid, (e->>'q')::integer, to_timestamp(least(greatest((e->>'t')::double precision, 0), 4102444800000) / 1000.0), left(coalesce(e->>'k', '?'), 24), e->'d'
  from jsonb_array_elements(p_events) e
  where jsonb_typeof(e) = 'object' and (e->>'q') ~ '^[0-9]{1,9}$' and (e->>'t') ~ '^[0-9]{1,15}(\.[0-9]+)?$'
  on conflict (user_id, sid, seq) do nothing;
  get diagnostics v_n = row_count;
  if random() < 0.02 then
    delete from public.diag_events where created_at < now() - interval '30 days';
  end if;
  return v_n;
end;
$$;

create or replace function public.admin_diag_sessions(p_uid uuid default null, p_limit integer default 100)
returns table (user_id uuid, username text, sid text, first_at timestamptz, last_at timestamptz, events bigint, errors bigint, failed_requests bigint, games text[], page text, agent text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return query
  select d.user_id, p.username, d.sid, min(d.at), max(d.at), count(*),
    count(*) filter (where d.kind = 'err' or (d.kind = 'log' and d.data->>'l' = 'error')),
    count(*) filter (where d.kind = 'res' and (d.data ? 'e' or coalesce((d.data->>'s')::integer, 0) >= 400)),
    array_remove(array_agg(distinct case when d.kind = 'game' then d.data->>'id' end), null),
    max(case when d.kind = 'boot' then d.data->>'u' end),
    max(case when d.kind = 'boot' then d.data->>'ua' end)
  from public.diag_events d
  left join public.profiles p on p.id = d.user_id
  where p_uid is null or d.user_id = p_uid
  group by d.user_id, p.username, d.sid
  order by max(d.at) desc
  limit least(greatest(coalesce(p_limit, 100), 1), 500);
end;
$$;

create or replace function public.admin_diag_events(p_sid text, p_after integer default 0, p_limit integer default 500, p_kinds text[] default null)
returns table (seq integer, at timestamptz, kind text, data jsonb)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return query
  select d.seq, d.at, d.kind, d.data
  from public.diag_events d
  where d.sid = p_sid and d.seq > coalesce(p_after, 0) and (p_kinds is null or d.kind = any (p_kinds))
  order by d.seq
  limit least(greatest(coalesce(p_limit, 500), 1), 2000);
end;
$$;

create or replace function public.admin_diag_clear(p_sid text default null)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_n integer;
begin
  delete from public.diag_events d where p_sid is null or d.sid = p_sid;
  get diagnostics v_n = row_count;
  perform private.admin_log('diag_clear', null, jsonb_build_object('sid', p_sid, 'rows', v_n));
  return v_n;
end;
$$;

revoke all on function public.diag_enabled() from public, anon, authenticated;
revoke all on function public.diag_push(text, jsonb) from public, anon, authenticated;
revoke all on function public.admin_diag_sessions(uuid, integer) from public, anon, authenticated;
revoke all on function public.admin_diag_events(text, integer, integer, text[]) from public, anon, authenticated;
revoke all on function public.admin_diag_clear(text) from public, anon, authenticated;
grant execute on function public.diag_enabled() to authenticated;
grant execute on function public.diag_push(text, jsonb) to authenticated;
grant execute on function public.admin_diag_sessions(uuid, integer) to authenticated;
grant execute on function public.admin_diag_events(text, integer, integer, text[]) to authenticated;
grant execute on function public.admin_diag_clear(text) to authenticated;
notify pgrst, 'reload schema';

create or replace function private.rate_sensitive(p_action text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_action in ('delete_account', 'export', 'username_change', 'username_check', 'username_check_h', 'friend_pair', 'report', 'report_d', 'login', 'login_ip', 'idea_create', 'idea_create_d');
$$;

create or replace function private.rate_scale(p_action text, p_max integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case when private.rate_sensitive(p_action) then p_max else p_max * 3 end;
$$;

create or replace function private.rate_ok(p_action text, p_max integer, p_window interval, p_key text default null)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_k text := coalesce(p_key, private.rate_key(p_action));
  v_max integer := private.rate_scale(p_action, p_max);
  v_n integer;
  v_ip text := nullif(private.client_ip(), '');
begin
  if auth.uid() is not null and not private.rate_sensitive(p_action) and private.is_staff(auth.uid()) then
    return true;
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_k, 0));
  select count(*) into v_n from private.rate_hits h where h.k = v_k and h.at > now() - p_window;
  if v_n >= v_max then
    return false;
  end if;
  insert into private.rate_hits (k, action, uid, ip, full_hit) values (v_k, p_action, auth.uid(), case when v_ip is null then null else md5(v_ip) end, v_max > 1 and v_n + 1 >= v_max);
  if random() < 0.005 then
    delete from private.rate_hits where at < now() - interval '8 days';
  end if;
  return true;
end;
$$;

create or replace function private.rate_check(p_action text, p_max integer, p_window interval, p_key text default null)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_k text := coalesce(p_key, private.rate_key(p_action));
begin
  if not private.rate_ok(p_action, p_max, p_window, v_k) then
    raise exception 'rate_limited' using errcode = 'PT429', detail = p_action, hint = 'retry_after=' || coalesce(private.rate_wait(v_k, private.rate_scale(p_action, p_max), p_window), 60);
  end if;
end;
$$;
revoke all on function private.rate_sensitive(text) from public, anon, authenticated;
revoke all on function private.rate_scale(text, integer) from public, anon, authenticated;
revoke all on function private.rate_ok(text, integer, interval, text) from public, anon, authenticated;
revoke all on function private.rate_check(text, integer, interval, text) from public, anon, authenticated;

create or replace function public.my_limits()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('staff', private.is_staff(auth.uid()), 'scale', 3);
$$;
revoke all on function public.my_limits() from public, anon, authenticated;
grant execute on function public.my_limits() to authenticated;

create table if not exists private.presence_now (
  user_id uuid primary key references auth.users (id) on delete cascade,
  at timestamptz not null default now(),
  game text,
  hidden boolean not null default false,
  away boolean not null default false,
  party boolean not null default false
);
create index if not exists presence_now_at_idx on private.presence_now (at);
alter table private.presence_now enable row level security;
revoke all on table private.presence_now from public, anon, authenticated;

drop function if exists public.presence_beat(text, boolean, boolean, boolean);
create or replace function public.presence_beat(p_game text default null, p_hidden boolean default false, p_away boolean default false, p_party boolean default false, p_quiet boolean default false)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_game text := lower(btrim(coalesce(p_game, '')));
  v_staff boolean;
  v_on jsonb;
  v_n integer;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if v_game !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
    v_game := null;
  end if;
  if not private.over('pb:' || v_uid::text, date_trunc('minute', now()), 20) then
    insert into private.presence_now as n (user_id, at, game, hidden, away, party)
    values (v_uid, now(), v_game, coalesce(p_hidden, false), coalesce(p_away, false), coalesce(p_party, false))
    on conflict (user_id) do update set at = excluded.at, game = excluded.game, hidden = excluded.hidden, away = excluded.away, party = excluded.party;
    update public.profiles p set last_seen = now(), last_game = coalesce(v_game, p.last_game) where p.id = v_uid and (p.last_seen is null or p.last_seen < now() - interval '60 seconds');
    if random() < 0.02 then
      delete from private.presence_now where at < now() - interval '10 minutes';
    end if;
  end if;
  v_staff := private.is_staff(v_uid);
  select count(*) into v_n from private.presence_now n where n.at > now() - interval '100 seconds' and not n.hidden;
  select coalesce(jsonb_agg(jsonb_build_object('id', n.user_id, 'g', n.game, 'a', case when n.away then 1 else 0 end, 'p', case when n.party then 1 else 0 end, 'h', case when n.hidden then 1 else 0 end)), '[]'::jsonb) into v_on
  from private.presence_now n
  where n.at > now() - interval '100 seconds' and n.user_id <> v_uid
    and ((v_staff) or (not n.hidden and exists (select 1 from public.friends f where f.user_id = v_uid and f.friend_id = n.user_id)));
  return jsonb_build_object('n', v_n, 'on', v_on, 'staff', v_staff);
end;
$$;

create or replace function public.presence_bye()
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  delete from private.presence_now where user_id = auth.uid();
$$;
revoke all on function public.presence_beat(text, boolean, boolean, boolean, boolean) from public, anon, authenticated;
revoke all on function public.presence_bye() from public, anon, authenticated;
grant execute on function public.presence_beat(text, boolean, boolean, boolean, boolean) to authenticated;
grant execute on function public.presence_bye() to authenticated;
notify pgrst, 'reload schema';

create or replace function private.username_ok(p_name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_name is not null
    and p_name ~ '^[a-z0-9_.]{4,20}$'
    and p_name !~ '^\.|\.$|\.\.'
    and p_name not in ('admin', 'administrator', 'gameplay', 'support', 'help', 'root', 'system', 'moderator', 'mod', 'staff', 'official', 'owner', 'null', 'undefined', 'guest', 'anonymous', 'everyone', 'nobody', 'me', 'you');
$$;

alter table public.test_accounts add column if not exists diag boolean not null default false;

create or replace function private.is_test(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_uid is not null and exists (
    select 1 from public.test_accounts t join public.profiles p on p.id = t.user_id
    where t.user_id = p_uid and t.diag and p.role = 'user'
  );
$$;

create or replace function public.admin_set_diag(p_uid uuid, p_on boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  if not exists (select 1 from public.test_accounts t join public.profiles p on p.id = t.user_id where t.user_id = p_uid and p.role = 'user') then
    raise exception 'Diagnostics can only be switched on for an ordinary account created in the dashboard' using errcode = '22023';
  end if;
  update public.test_accounts t set diag = coalesce(p_on, false) where t.user_id = p_uid;
  perform private.admin_log('diag', p_uid, jsonb_build_object('on', coalesce(p_on, false)));
  return coalesce(p_on, false);
end;
$$;

create or replace function public.admin_diag_accounts()
returns table (user_id uuid, username text, email text, diag boolean, note text, created_at timestamptz, last_event timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return query
  select t.user_id, p.username, t.email, t.diag, t.note, t.created_at, (select max(d.at) from public.diag_events d where d.user_id = t.user_id)
  from public.test_accounts t
  join public.profiles p on p.id = t.user_id
  where p.role = 'user'
  order by t.diag desc, t.created_at desc;
end;
$$;
revoke all on function public.admin_set_diag(uuid, boolean) from public, anon, authenticated;
revoke all on function public.admin_diag_accounts() from public, anon, authenticated;
grant execute on function public.admin_set_diag(uuid, boolean) to authenticated;
grant execute on function public.admin_diag_accounts() to authenticated;

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
  if v_role <> 'user' then
    delete from public.test_accounts t where t.user_id = v_id;
  end if;
  perform private.admin_log('create_user', v_id, jsonb_build_object('email', v_out ->> 'email', 'role', v_role));
  return v_out || jsonb_build_object('display_name', coalesce(v_name, v_out ->> 'username'), 'role', v_role);
end;
$$;

create or replace function private.rate_sensitive(p_action text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_action in ('delete_account', 'export', 'username_change', 'username_check', 'username_check_h', 'friend_pair', 'report', 'report_d', 'login', 'login_ip', 'idea_create', 'idea_create_d', 'log_chat', 'log_chat_h');
$$;

create or replace function public.log_chat(p_kind text, p_game text, p_room text, p_body text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_body text;
begin
  if v_uid is null or p_kind is null or p_kind not in ('party', 'game') then
    return;
  end if;
  v_body := nullif(btrim(regexp_replace(left(coalesce(p_body, ''), 500), E'[\\x01-\\x1f\\x7f]', ' ', 'g')), '');
  if v_body is null then
    return;
  end if;
  if not private.rate_ok('log_chat', 60, interval '1 minute') or not private.rate_ok('log_chat_h', 900, interval '1 hour') then
    return;
  end if;
  insert into public.chat_log (user_id, kind, game, room, body)
  values (v_uid, p_kind, left(nullif(btrim(coalesce(p_game, '')), ''), 40), upper(left(nullif(regexp_replace(coalesce(p_room, ''), '[^A-Za-z0-9]', '', 'g'), ''), 16)), v_body);
  if random() < 0.01 then
    delete from public.chat_log where created_at < now() - interval '365 days';
  end if;
end;
$$;

create or replace function public.presence_beat(p_game text default null, p_hidden boolean default false, p_away boolean default false, p_party boolean default false, p_quiet boolean default false)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_game text := lower(btrim(coalesce(p_game, '')));
  v_staff boolean;
  v_on jsonb;
  v_games jsonb;
  v_n integer;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if private.over('pb:' || v_uid::text, date_trunc('minute', now()), 20) then
    return '{}'::jsonb;
  end if;
  if v_game !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
    v_game := null;
  end if;
  if coalesce(p_quiet, false) and exists (select 1 from private.presence_now n where n.user_id = v_uid and n.at > now() - interval '70 seconds') then
    null;
  else
    insert into private.presence_now as n (user_id, at, game, hidden, away, party)
    values (v_uid, now(), v_game, coalesce(p_hidden, false), coalesce(p_away, false), coalesce(p_party, false))
    on conflict (user_id) do update set at = excluded.at, game = excluded.game, hidden = excluded.hidden, away = excluded.away, party = excluded.party;
    update public.profiles p set last_seen = now(), last_game = coalesce(v_game, p.last_game) where p.id = v_uid and (p.last_seen is null or p.last_seen < now() - interval '60 seconds');
  end if;
  if random() < 0.02 then
    delete from private.presence_now where at < now() - interval '10 minutes';
  end if;
  v_staff := private.is_staff(v_uid);
  select count(*) into v_n from private.presence_now n where n.at > now() - interval '100 seconds' and not n.hidden;
  select coalesce(jsonb_object_agg(x.game, x.c), '{}'::jsonb) into v_games
  from (select n.game, count(*) as c from private.presence_now n where n.at > now() - interval '100 seconds' and not n.hidden and n.game is not null group by n.game) x;
  select coalesce(jsonb_agg(jsonb_build_object('id', n.user_id, 'g', n.game, 'a', case when n.away then 1 else 0 end, 'p', case when n.party then 1 else 0 end, 'h', case when n.hidden then 1 else 0 end)), '[]'::jsonb) into v_on
  from private.presence_now n
  where n.at > now() - interval '100 seconds' and n.user_id <> v_uid
    and ((v_staff) or (not n.hidden and exists (select 1 from public.friends f where f.user_id = v_uid and f.friend_id = n.user_id)));
  return jsonb_build_object('n', v_n, 'on', v_on, 'games', v_games, 'staff', v_staff);
end;
$$;
notify pgrst, 'reload schema';

create or replace function private.file_class(p_ext text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_ext in ('png', 'jpg', 'webp', 'gif') then 'image'
    when p_ext in ('pdf', 'txt', 'md', 'csv', 'json', 'log', 'zip') then 'file'
  end;
$$;

create or replace function private.file_mime(p_ext text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case p_ext
    when 'png' then 'image/png'
    when 'jpg' then 'image/jpeg'
    when 'webp' then 'image/webp'
    when 'gif' then 'image/gif'
    when 'pdf' then 'application/pdf'
    when 'txt' then 'text/plain'
    when 'log' then 'text/plain'
    when 'md' then 'text/markdown'
    when 'csv' then 'text/csv'
    when 'json' then 'application/json'
    when 'zip' then 'application/zip'
  end;
$$;

create or replace function private.files_clean(p_bucket text, p_prefix text, p_files jsonb, p_max integer default 4)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_out jsonb := '[]'::jsonb;
  v_it jsonb;
  v_one jsonb;
  v_path text;
  v_ext text;
  v_class text;
  v_name text;
  v_owner text;
  v_meta jsonb;
  v_size bigint;
  v_max bigint;
  v_tail text;
  v_w integer;
  v_h integer;
begin
  if p_files is null or jsonb_typeof(p_files) = 'null' then
    return v_out;
  end if;
  if v_me is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if jsonb_typeof(p_files) <> 'array' then
    raise exception 'Bad attachment' using errcode = '22023';
  end if;
  if jsonb_array_length(p_files) > greatest(coalesce(p_max, 4), 0) then
    raise exception 'Too many attachments' using errcode = '22023';
  end if;
  for v_it in select e from jsonb_array_elements(p_files) e loop
    v_path := case when jsonb_typeof(v_it) = 'object' then v_it ->> 'path' end;
    if v_path is null or v_path !~ ('^' || p_prefix || '/[a-z0-9-]{8,64}\.(png|jpg|webp|gif|pdf|txt|md|csv|json|log|zip)$') then
      raise exception 'Bad attachment' using errcode = '22023';
    end if;
    if v_out @> jsonb_build_array(jsonb_build_object('path', v_path)) then
      raise exception 'Bad attachment' using errcode = '22023';
    end if;
    v_ext := substring(v_path from '\.([a-z0-9]+)$');
    v_class := private.file_class(v_ext);
    v_owner := null;
    v_meta := null;
    select o.owner_id, o.metadata into v_owner, v_meta
      from storage.objects o
      where o.bucket_id = p_bucket and o.name = v_path
      order by o.created_at desc
      limit 1;
    if v_owner is null or v_owner <> v_me::text or v_meta is null then
      raise exception 'Attachment not found' using errcode = '22023';
    end if;
    v_size := case when (v_meta ->> 'size') ~ '^[0-9]{1,12}$' then (v_meta ->> 'size')::bigint else 0 end;
    v_max := case when v_class = 'image' then 5242880 else 8388608 end;
    if v_size <= 0 or v_size > v_max then
      raise exception 'Attachment too large' using errcode = '22023';
    end if;
    if lower(btrim(split_part(coalesce(v_meta ->> 'mimetype', ''), ';', 1))) <> private.file_mime(v_ext) then
      raise exception 'Bad attachment type' using errcode = '22023';
    end if;
    v_name := coalesce(private.clean_text(regexp_replace(coalesce(v_it ->> 'name', ''), '[\u202A-\u202E\u2066-\u2069\u200B-\u200F/\\]', '', 'g'), 120), 'file');
    v_tail := '\.' || replace(v_ext, 'jpg', '(jpg|jpeg)') || '$';
    if lower(v_name) !~ v_tail then
      v_name := left(v_name, 110) || '.' || v_ext;
    end if;
    v_one := jsonb_build_object('path', v_path, 'name', v_name, 'size', v_size, 'type', private.file_mime(v_ext), 'kind', v_class);
    if v_class = 'image' then
      v_w := case when (v_it ->> 'w') ~ '^[0-9]{1,5}$' then (v_it ->> 'w')::integer else 0 end;
      v_h := case when (v_it ->> 'h') ~ '^[0-9]{1,5}$' then (v_it ->> 'h')::integer else 0 end;
      if v_w between 1 and 20000 and v_h between 1 and 20000 then
        v_one := v_one || jsonb_build_object('w', v_w, 'h', v_h);
      end if;
    end if;
    v_out := v_out || jsonb_build_array(v_one);
  end loop;
  return v_out;
end;
$$;

create or replace function private.long_text(p_text text, p_max integer)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(left(btrim(regexp_replace(regexp_replace(replace(left(coalesce(p_text, ''), p_max * 2), E'\r', ''), E'[\\x01-\\x09\\x0b-\\x1f\\x7f]', '', 'g'), E'\n{3,}', E'\n\n', 'g')), p_max), '');
$$;

create or replace function private.need_user()
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
  if exists (select 1 from public.profiles p where p.id = v_uid and p.locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  return v_uid;
end;
$$;

create or replace function private.file_used(p_bucket text, p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_bucket = 'ideas' then
    return exists (select 1 from public.ideas i where i.attachments @> jsonb_build_array(jsonb_build_object('path', p_name)));
  elsif p_bucket = 'tickets' then
    return exists (select 1 from public.ticket_messages m where m.attachments @> jsonb_build_array(jsonb_build_object('path', p_name)));
  elsif p_bucket = 'dm' then
    return exists (select 1 from public.dms d where d.kind in ('image', 'file') and d.meta ->> 'path' = p_name);
  end if;
  return true;
end;
$$;

create or replace function private.files_rm(p_bucket text, p_paths text[])
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_n integer := 0;
begin
  if p_bucket is null or p_bucket not in ('ideas', 'tickets', 'dm') or p_paths is null or cardinality(p_paths) = 0 then
    return 0;
  end if;
  perform set_config('storage.allow_delete_query', 'true', true);
  delete from storage.objects o where o.bucket_id = p_bucket and o.name = any (p_paths);
  get diagnostics v_n = row_count;
  perform set_config('storage.allow_delete_query', 'false', true);
  return v_n;
end;
$$;

create or replace function private.files_sweep(p_uid uuid default null)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_n integer := 0;
begin
  perform set_config('storage.allow_delete_query', 'true', true);
  delete from storage.objects o
    where o.bucket_id in ('ideas', 'tickets', 'dm')
      and (p_uid is null or o.name like p_uid::text || '/%')
      and not private.file_used(o.bucket_id, o.name)
      and (o.created_at < now() - interval '1 hour' or not exists (select 1 from public.profiles p where p.id::text = split_part(o.name, '/', 1)));
  get diagnostics v_n = row_count;
  perform set_config('storage.allow_delete_query', 'false', true);
  return v_n;
end;
$$;

create or replace function private.files_drop_user(p_uid uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_n integer := 0;
  v_paths text[];
begin
  if p_uid is null then
    return 0;
  end if;
  select array_agg(a ->> 'path') into v_paths
    from public.tickets t
    join public.ticket_messages m on m.ticket_id = t.id
    cross join lateral jsonb_array_elements(m.attachments) a
    where t.user_id = p_uid;
  perform set_config('storage.allow_delete_query', 'true', true);
  delete from storage.objects o
    where (o.bucket_id in ('ideas', 'tickets', 'dm') and o.name like p_uid::text || '/%')
      or (o.bucket_id = 'dm' and o.name like '%/' || p_uid::text || '/%')
      or (o.bucket_id = 'tickets' and v_paths is not null and o.name = any (v_paths));
  get diagnostics v_n = row_count;
  perform set_config('storage.allow_delete_query', 'false', true);
  return v_n;
end;
$$;

revoke all on function private.file_class(text) from public, anon, authenticated;
revoke all on function private.file_mime(text) from public, anon, authenticated;
revoke all on function private.files_clean(text, text, jsonb, integer) from public, anon, authenticated;
revoke all on function private.long_text(text, integer) from public, anon, authenticated;
revoke all on function private.need_user() from public, anon, authenticated;
revoke all on function private.file_used(text, text) from public, anon, authenticated;
revoke all on function private.files_rm(text, text[]) from public, anon, authenticated;
revoke all on function private.files_sweep(uuid) from public, anon, authenticated;
revoke all on function private.files_drop_user(uuid) from public, anon, authenticated;

create table if not exists public.ideas (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  game text,
  ctx jsonb not null default '{}'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  status text not null default 'new',
  reply text,
  reply_at timestamptz,
  reply_by uuid references auth.users (id) on delete set null,
  fresh boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ideas drop constraint if exists ideas_kind_check;
alter table public.ideas add constraint ideas_kind_check check (kind in ('game', 'improvement', 'bug', 'patch', 'other'));
alter table public.ideas drop constraint if exists ideas_status_check;
alter table public.ideas add constraint ideas_status_check check (status in ('new', 'seen', 'planned', 'done', 'declined'));
alter table public.ideas drop constraint if exists ideas_title_check;
alter table public.ideas add constraint ideas_title_check check (char_length(title) between 3 and 100 and title !~ '[[:cntrl:]]');
alter table public.ideas drop constraint if exists ideas_body_check;
alter table public.ideas add constraint ideas_body_check check (char_length(body) between 10 and 4000);
alter table public.ideas drop constraint if exists ideas_game_check;
alter table public.ideas add constraint ideas_game_check check (game is null or game ~ '^[a-z0-9][a-z0-9-]{0,39}$');
alter table public.ideas drop constraint if exists ideas_reply_check;
alter table public.ideas add constraint ideas_reply_check check (reply is null or char_length(reply) between 1 and 2000);
alter table public.ideas drop constraint if exists ideas_attachments_check;
alter table public.ideas add constraint ideas_attachments_check check (jsonb_typeof(attachments) = 'array' and pg_column_size(attachments) <= 8192);
alter table public.ideas drop constraint if exists ideas_ctx_check;
alter table public.ideas add constraint ideas_ctx_check check (jsonb_typeof(ctx) = 'object' and pg_column_size(ctx) <= 2048);
create index if not exists ideas_user_idx on public.ideas (user_id, id desc);
create index if not exists ideas_status_idx on public.ideas (status, id desc);
create index if not exists ideas_attachments_idx on public.ideas using gin (attachments jsonb_path_ops);
alter table public.ideas enable row level security;
revoke all on public.ideas from public, anon, authenticated;
grant all on public.ideas to service_role;

create or replace function public.idea_create(p_kind text, p_title text, p_body text, p_files jsonb default '[]'::jsonb, p_game text default null, p_ctx jsonb default null)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.need_user();
  v_kind text := lower(btrim(coalesce(p_kind, '')));
  v_title text := private.clean_text(p_title, 100);
  v_body text := private.long_text(p_body, 4000);
  v_game text := lower(btrim(coalesce(p_game, '')));
  v_ctx jsonb := '{}'::jsonb;
  v_files jsonb;
  v_id bigint;
begin
  if v_kind not in ('game', 'improvement', 'bug', 'patch', 'other') then
    raise exception 'Bad type' using errcode = '22023';
  end if;
  if v_title is null or char_length(v_title) < 3 then
    raise exception 'Write a title' using errcode = '22023';
  end if;
  if v_body is null or char_length(v_body) < 10 then
    raise exception 'Write a description' using errcode = '22023';
  end if;
  if v_game !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
    v_game := null;
  end if;
  if v_kind = 'bug' and p_ctx is not null and jsonb_typeof(p_ctx) = 'object' then
    v_ctx := jsonb_strip_nulls(jsonb_build_object(
      'ua', private.clean_text(p_ctx ->> 'ua', 240),
      'w', case when (p_ctx ->> 'w') ~ '^[0-9]{1,5}$' then (p_ctx ->> 'w')::integer end,
      'h', case when (p_ctx ->> 'h') ~ '^[0-9]{1,5}$' then (p_ctx ->> 'h')::integer end,
      'lang', case when (p_ctx ->> 'lang') ~ '^[a-z]{2}$' then p_ctx ->> 'lang' end
    ));
  end if;
  select i.id into v_id from public.ideas i
    where i.user_id = v_uid and i.kind = v_kind and i.title = v_title and i.body = v_body and i.created_at > now() - interval '2 minutes'
    order by i.id desc limit 1;
  if v_id is not null then
    return v_id;
  end if;
  v_files := private.files_clean('ideas', v_uid::text, p_files, 4);
  perform private.rate_check('idea_create', 5, interval '1 hour');
  perform private.rate_check('idea_create_d', 20, interval '1 day');
  insert into public.ideas (user_id, kind, title, body, game, ctx, attachments)
    values (v_uid, v_kind, v_title, v_body, v_game, v_ctx, v_files)
    returning id into v_id;
  perform private.files_sweep(v_uid);
  return v_id;
end;
$$;

create or replace function public.my_ideas()
returns table (id bigint, kind text, title text, body text, game text, attachments jsonb, status text, reply text, reply_at timestamptz, created_at timestamptz, fresh boolean)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.need_user();
begin
  return query
    select i.id, i.kind, i.title, i.body, i.game, i.attachments, i.status, i.reply, i.reply_at, i.created_at, i.fresh
    from public.ideas i
    where i.user_id = v_uid
    order by i.id desc
    limit 100;
  update public.ideas i set fresh = false where i.user_id = v_uid and i.fresh;
end;
$$;

create or replace function public.my_idea_news()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from public.ideas i where i.user_id = auth.uid() and i.fresh
    and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.locked);
$$;

create or replace function public.idea_delete(p_id bigint)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.need_user();
  v_att jsonb;
begin
  delete from public.ideas i where i.id = p_id and i.user_id = v_uid returning i.attachments into v_att;
  if not found then
    raise exception 'Idea not found' using errcode = 'P0002';
  end if;
  perform private.files_rm('ideas', array(select a ->> 'path' from jsonb_array_elements(v_att) a));
  return true;
end;
$$;

create or replace function public.my_file_delete(p_bucket text, p_path text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.need_user();
  v_one jsonb := jsonb_build_array(jsonb_build_object('path', p_path));
begin
  if p_bucket is null or p_bucket not in ('ideas', 'tickets', 'dm') or p_path is null or left(p_path, 37) <> v_uid::text || '/' then
    raise exception 'File not found' using errcode = 'P0002';
  end if;
  if not exists (select 1 from storage.objects o where o.bucket_id = p_bucket and o.name = p_path and o.owner_id = v_uid::text) then
    raise exception 'File not found' using errcode = 'P0002';
  end if;
  if p_bucket = 'ideas' then
    update public.ideas i set attachments = coalesce((select jsonb_agg(a) from jsonb_array_elements(i.attachments) a where a ->> 'path' <> p_path), '[]'::jsonb)
      where i.user_id = v_uid and i.attachments @> v_one;
  elsif p_bucket = 'tickets' then
    update public.ticket_messages m set attachments = coalesce((select jsonb_agg(a) from jsonb_array_elements(m.attachments) a where a ->> 'path' <> p_path), '[]'::jsonb)
      where m.author_id = v_uid and m.attachments @> v_one;
  else
    delete from public.dms d where d.from_id = v_uid and d.kind in ('image', 'file') and d.meta ->> 'path' = p_path;
  end if;
  perform private.files_rm(p_bucket, array[p_path]);
  return true;
end;
$$;

create or replace function public.my_file_usage()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.need_user();
begin
  return (
    select jsonb_build_object('bytes', coalesce(sum(case when (o.metadata ->> 'size') ~ '^[0-9]{1,12}$' then (o.metadata ->> 'size')::bigint else 0 end), 0), 'files', count(*), 'cap', 209715200)
    from storage.objects o
    where o.bucket_id in ('ideas', 'tickets', 'dm') and o.name like v_uid::text || '/%'
  );
end;
$$;

create or replace function public.admin_ideas(p_kind text default null, p_status text default null, p_q text default null, p_before bigint default null, p_limit integer default 100)
returns table (id bigint, user_id uuid, username text, display_name text, kind text, title text, body text, game text, ctx jsonb, attachments jsonb, status text, reply text, reply_at timestamptz, reply_by text, created_at timestamptz, updated_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_q text := btrim(coalesce(p_q, ''));
  v_pat text := '%' || replace(replace(replace(v_q, '\', '\\'), '%', '\%'), '_', '\_') || '%';
begin
  return query
    select i.id, i.user_id, p.username, p.display_name, i.kind, i.title, i.body, i.game, i.ctx, i.attachments, i.status, i.reply, i.reply_at,
      coalesce(r.username, r.display_name), i.created_at, i.updated_at
    from public.ideas i
    left join public.profiles p on p.id = i.user_id
    left join public.profiles r on r.id = i.reply_by
    where (p_kind is null or p_kind = '' or i.kind = p_kind)
      and (p_status is null or p_status = '' or i.status = p_status)
      and (p_before is null or i.id < p_before)
      and (char_length(v_q) < 2 or i.title ilike v_pat or i.body ilike v_pat or p.username ilike v_pat or p.display_name ilike v_pat)
    order by i.id desc
    limit least(greatest(coalesce(p_limit, 100), 1), 200);
end;
$$;

create or replace function public.admin_idea_count()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return (select jsonb_build_object('new', count(*) filter (where i.status = 'new'), 'total', count(*)) from public.ideas i);
end;
$$;

create or replace function public.admin_idea_update(p_id bigint, p_status text default null, p_reply text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_reply text := private.long_text(p_reply, 2000);
  v_old public.ideas%rowtype;
  v_new public.ideas%rowtype;
begin
  if p_status is not null and p_status not in ('new', 'seen', 'planned', 'done', 'declined') then
    raise exception 'Bad status' using errcode = '22023';
  end if;
  select * into v_old from public.ideas i where i.id = p_id for update;
  if not found then
    raise exception 'Idea not found' using errcode = 'P0002';
  end if;
  update public.ideas i set
      status = coalesce(p_status, i.status),
      reply = case when p_reply is null then i.reply else v_reply end,
      reply_at = case when p_reply is null or v_reply is not distinct from i.reply then i.reply_at when v_reply is null then null else now() end,
      reply_by = case when p_reply is null or v_reply is not distinct from i.reply then i.reply_by when v_reply is null then null else v_me end,
      fresh = i.fresh
        or (p_reply is not null and v_reply is not null and v_reply is distinct from i.reply)
        or (p_status is not null and p_status <> i.status and p_status in ('planned', 'done', 'declined')),
      updated_at = now()
    where i.id = p_id
    returning * into v_new;
  if not (p_reply is null and p_status = 'seen' and v_old.status = 'new') then
    perform private.admin_log('idea_update', v_new.user_id, jsonb_build_object('idea', v_new.id, 'title', left(v_new.title, 80), 'status', case when v_new.status <> v_old.status then v_new.status end, 'reply', case when v_new.reply is distinct from v_old.reply then true end));
  end if;
  return jsonb_build_object('id', v_new.id, 'status', v_new.status, 'reply', v_new.reply, 'reply_at', v_new.reply_at, 'updated_at', v_new.updated_at,
    'reply_by', (select coalesce(p.username, p.display_name) from public.profiles p where p.id = v_new.reply_by));
end;
$$;

create or replace function public.admin_idea_delete(p_id bigint)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_old public.ideas%rowtype;
begin
  delete from public.ideas i where i.id = p_id returning * into v_old;
  if not found then
    raise exception 'Idea not found' using errcode = 'P0002';
  end if;
  perform private.files_rm('ideas', array(select a ->> 'path' from jsonb_array_elements(v_old.attachments) a));
  perform private.admin_log('idea_delete', v_old.user_id, jsonb_build_object('idea', v_old.id, 'title', left(v_old.title, 80)));
  return true;
end;
$$;

revoke all on function public.idea_create(text, text, text, jsonb, text, jsonb) from public, anon, authenticated;
revoke all on function public.my_ideas() from public, anon, authenticated;
revoke all on function public.my_idea_news() from public, anon, authenticated;
revoke all on function public.admin_ideas(text, text, text, bigint, integer) from public, anon, authenticated;
revoke all on function public.admin_idea_count() from public, anon, authenticated;
revoke all on function public.admin_idea_update(bigint, text, text) from public, anon, authenticated;
revoke all on function public.admin_idea_delete(bigint) from public, anon, authenticated;
revoke all on function public.idea_delete(bigint) from public, anon, authenticated;
revoke all on function public.my_file_delete(text, text) from public, anon, authenticated;
revoke all on function public.my_file_usage() from public, anon, authenticated;
grant execute on function public.idea_create(text, text, text, jsonb, text, jsonb) to authenticated;
grant execute on function public.my_ideas() to authenticated;
grant execute on function public.my_idea_news() to authenticated;
grant execute on function public.admin_ideas(text, text, text, bigint, integer) to authenticated;
grant execute on function public.admin_idea_count() to authenticated;
grant execute on function public.admin_idea_update(bigint, text, text) to authenticated;
grant execute on function public.admin_idea_delete(bigint) to authenticated;
grant execute on function public.idea_delete(bigint) to authenticated;
grant execute on function public.my_file_delete(text, text) to authenticated;
grant execute on function public.my_file_usage() to authenticated;

alter table public.dms drop constraint if exists dms_kind_check;
alter table public.dms add constraint dms_kind_check check (kind in ('text', 'image', 'invite', 'join', 'file'));
create index if not exists dms_path_idx on public.dms ((meta ->> 'path')) where kind in ('image', 'file');

create or replace function public.dm_send(p_to uuid, p_kind text, p_body text default null, p_meta jsonb default '{}'::jsonb)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_kind text := coalesce(p_kind, 'text');
  v_body text;
  v_meta jsonb := '{}'::jsonb;
  v_file jsonb;
  v_id bigint;
begin
  if v_me is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles p where p.id = v_me and p.locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  if private.blocked_between(v_me, p_to) or not exists (select 1 from public.friends f where f.user_id = v_me and f.friend_id = p_to) then
    raise exception 'Not friends' using errcode = '42501';
  end if;
  if private.over('dm:' || v_me::text, date_trunc('minute', now()), 40) then
    raise exception 'Too many messages' using errcode = '54000';
  end if;
  if v_kind = 'text' then
    v_body := left(btrim(regexp_replace(coalesce(p_body, ''), '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g')), 2000);
    if v_body = '' then
      raise exception 'Write a message' using errcode = '22023';
    end if;
    perform private.rate_check('dm_text', 30, interval '1 minute');
    perform private.rate_check('dm_text_h', 600, interval '1 hour');
  elsif v_kind = 'image' then
    if coalesce(p_meta ->> 'path', '') !~ ('^' || v_me::text || '/' || p_to::text || '/[a-z0-9-]{8,64}\.(webp|jpg|png|gif)$') then
      raise exception 'Bad image' using errcode = '22023';
    end if;
    v_file := private.files_clean('dm', v_me::text || '/' || p_to::text, jsonb_build_array(jsonb_build_object('path', p_meta ->> 'path')), 1) -> 0;
    perform private.rate_check('dm_image', 10, interval '1 minute');
    perform private.rate_check('dm_image_d', 150, interval '1 day');
    v_meta := jsonb_build_object('path', p_meta ->> 'path', 'w', least(greatest(coalesce((p_meta ->> 'w')::int, 0), 0), 8000), 'h', least(greatest(coalesce((p_meta ->> 'h')::int, 0), 0), 8000));
  elsif v_kind = 'file' then
    if coalesce(p_meta ->> 'path', '') !~ ('^' || v_me::text || '/' || p_to::text || '/[a-z0-9-]{8,64}\.(pdf|txt|md|csv|json|log|zip)$') then
      raise exception 'Bad file' using errcode = '22023';
    end if;
    v_file := private.files_clean('dm', v_me::text || '/' || p_to::text, jsonb_build_array(jsonb_build_object('path', p_meta ->> 'path', 'name', p_meta ->> 'name')), 1) -> 0;
    perform private.rate_check('dm_file', 5, interval '1 minute');
    perform private.rate_check('dm_file_d', 40, interval '1 day');
    v_meta := v_file - 'kind';
    v_body := v_file ->> 'name';
  elsif v_kind in ('invite', 'join') then
    if coalesce(p_meta ->> 'game', '') !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
      raise exception 'Bad game' using errcode = '22023';
    end if;
    if v_kind = 'invite' and coalesce(p_meta ->> 'code', '') !~ '^[A-Z0-9]{3,8}$' then
      raise exception 'Bad code' using errcode = '22023';
    end if;
    v_meta := jsonb_build_object('game', p_meta ->> 'game') || case when v_kind = 'invite' then jsonb_build_object('code', p_meta ->> 'code') else '{}'::jsonb end;
    if exists (select 1 from public.dms d where d.from_id = v_me and d.to_id = p_to and d.kind = v_kind and d.meta = v_meta and d.read_at is null and d.created_at > now() - interval '30 seconds') then
      select d.id into v_id from public.dms d where d.from_id = v_me and d.to_id = p_to and d.kind = v_kind and d.meta = v_meta and d.read_at is null order by d.id desc limit 1;
      return v_id;
    end if;
    perform private.rate_check('party', 1, interval '3 seconds');
    perform private.rate_check('party_h', 300, interval '1 hour');
    delete from public.dms d where d.from_id = v_me and d.to_id = p_to and d.kind = v_kind and d.read_at is null and d.meta ->> 'game' = v_meta ->> 'game';
  else
    raise exception 'Bad kind' using errcode = '22023';
  end if;
  insert into public.dms (from_id, to_id, kind, body, meta) values (v_me, p_to, v_kind, v_body, v_meta) returning id into v_id;
  if v_kind in ('image', 'file') then
    perform private.files_sweep(v_me);
  end if;
  return v_id;
end;
$$;
revoke all on function public.dm_send(uuid, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.dm_send(uuid, text, text, jsonb) to authenticated;

alter table public.ticket_messages add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table public.ticket_messages drop constraint if exists ticket_messages_attachments_check;
alter table public.ticket_messages add constraint ticket_messages_attachments_check check (jsonb_typeof(attachments) = 'array' and pg_column_size(attachments) <= 8192);
create index if not exists ticket_messages_attachments_idx on public.ticket_messages using gin (attachments jsonb_path_ops);

drop function if exists public.ticket_create(text, text);
create or replace function public.ticket_create(p_subject text, p_body text, p_files jsonb default '[]'::jsonb)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_files jsonb := '[]'::jsonb;
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if p_files is not null and jsonb_typeof(p_files) = 'array' and jsonb_array_length(p_files) > 0 then
    perform private.need_user();
    v_files := private.files_clean('tickets', v_uid::text, p_files, 4);
  end if;
  if not private.is_staff(v_uid) then
    perform private.rate_check('ticket_create', 3, interval '10 minutes');
    perform private.rate_check('ticket_create_d', 12, interval '1 day');
    if (select count(*) from public.tickets t where t.user_id = v_uid and t.status = 'open') >= 10 then
      raise exception 'Too many open tickets' using errcode = '54000';
    end if;
  end if;
  insert into public.tickets (user_id, subject) values (v_uid, p_subject) returning id into v_id;
  insert into public.ticket_messages (ticket_id, body, attachments) values (v_id, p_body, v_files);
  if v_files <> '[]'::jsonb then
    perform private.files_sweep(v_uid);
  end if;
  return v_id;
end;
$$;

drop function if exists public.ticket_send(bigint, text);
create or replace function public.ticket_send(p_ticket bigint, p_body text, p_files jsonb default '[]'::jsonb)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_files jsonb := '[]'::jsonb;
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if p_files is not null and jsonb_typeof(p_files) = 'array' and jsonb_array_length(p_files) > 0 then
    perform private.need_user();
    v_files := private.files_clean('tickets', v_uid::text, p_files, 4);
  end if;
  if not private.is_staff(v_uid) then
    perform private.rate_check('ticket_send', 10, interval '1 minute');
    perform private.rate_check('ticket_send_d', 200, interval '1 day');
  end if;
  insert into public.ticket_messages (ticket_id, body, attachments) values (p_ticket, p_body, v_files) returning id into v_id;
  if v_files <> '[]'::jsonb then
    perform private.files_sweep(v_uid);
  end if;
  return v_id;
end;
$$;

drop function if exists public.ticket_thread(bigint);
create or replace function public.ticket_thread(p_ticket bigint)
returns table (id bigint, body text, is_admin boolean, mine boolean, author text, created_at timestamptz, attachments jsonb)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_admin boolean := public.is_admin();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if not exists (select 1 from public.tickets t where t.id = p_ticket and (t.user_id = v_uid or v_admin)) then
    raise exception 'Ticket not found' using errcode = 'P0002';
  end if;
  return query
    select m.id, m.body, m.is_admin, m.author_id = v_uid,
      case when v_admin then coalesce(p.username, p.display_name) end,
      m.created_at, m.attachments
    from public.ticket_messages m
    left join public.profiles p on p.id = m.author_id
    where m.ticket_id = p_ticket
    order by m.id
    limit 500;
end;
$$;

revoke all on function public.ticket_create(text, text, jsonb) from public, anon, authenticated;
revoke all on function public.ticket_send(bigint, text, jsonb) from public, anon, authenticated;
revoke all on function public.ticket_thread(bigint) from public, anon, authenticated;
grant execute on function public.ticket_create(text, text, jsonb) to authenticated;
grant execute on function public.ticket_send(bigint, text, jsonb) to authenticated;
grant execute on function public.ticket_thread(bigint) to authenticated;

create or replace function public.file_upload_ok(p_bucket text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_recent bigint;
  v_day bigint;
  v_all bigint;
begin
  if v_me is null or p_bucket is null or p_bucket not in ('ideas', 'tickets', 'dm') then
    return false;
  end if;
  if exists (select 1 from public.profiles p where p.id = v_me and p.locked) then
    return false;
  end if;
  if private.is_staff(v_me) then
    return true;
  end if;
  select count(*) filter (where o.bucket_id = p_bucket and o.created_at > now() - interval '10 minutes'),
      count(*) filter (where o.bucket_id = p_bucket and o.created_at > now() - interval '1 day'),
      coalesce(sum(case when (o.metadata ->> 'size') ~ '^[0-9]{1,12}$' then (o.metadata ->> 'size')::bigint else 0 end), 0)
    into v_recent, v_day, v_all
    from storage.objects o
    where o.bucket_id in ('ideas', 'tickets', 'dm') and o.name like v_me::text || '/%';
  if v_all >= 209715200 then
    return false;
  end if;
  if p_bucket = 'dm' then
    return v_recent < 60 and v_day < 300;
  end if;
  return v_recent < 30 and v_day < 100;
end;
$$;

create or replace function public.file_mine(p_bucket text, p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_one jsonb := jsonb_build_array(jsonb_build_object('path', p_name));
begin
  if v_me is null or exists (select 1 from public.profiles p where p.id = v_me and p.locked) then
    return false;
  end if;
  if p_bucket = 'ideas' then
    return exists (select 1 from public.ideas i where i.user_id = v_me and i.attachments @> v_one);
  elsif p_bucket = 'tickets' then
    return exists (select 1 from public.ticket_messages m join public.tickets t on t.id = m.ticket_id where t.user_id = v_me and m.attachments @> v_one);
  elsif p_bucket = 'dm' then
    return exists (select 1 from public.dms d where d.kind in ('image', 'file') and d.meta ->> 'path' = p_name and v_me in (d.from_id, d.to_id));
  end if;
  return false;
end;
$$;

create table if not exists private.file_opens (
  admin_id uuid not null references auth.users (id) on delete cascade,
  bucket text not null,
  path text not null,
  at timestamptz not null default now(),
  primary key (admin_id, bucket, path)
);
create index if not exists file_opens_at_idx on private.file_opens (at);
alter table private.file_opens enable row level security;
revoke all on private.file_opens from public, anon, authenticated;

create or replace function public.admin_files_open(p_bucket text, p_paths text[])
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_path text;
  v_one jsonb;
  v_ref bigint;
  v_owner uuid;
  v_n integer := 0;
begin
  if p_bucket is null or p_bucket not in ('ideas', 'tickets') or p_paths is null or cardinality(p_paths) > 40 then
    raise exception 'Bad request' using errcode = '22023';
  end if;
  foreach v_path in array p_paths loop
    v_one := jsonb_build_array(jsonb_build_object('path', v_path));
    v_ref := null;
    v_owner := null;
    if p_bucket = 'ideas' then
      select i.id, i.user_id into v_ref, v_owner from public.ideas i where i.attachments @> v_one limit 1;
    else
      select t.id, t.user_id into v_ref, v_owner from public.ticket_messages m join public.tickets t on t.id = m.ticket_id where m.attachments @> v_one limit 1;
    end if;
    if v_ref is null then
      continue;
    end if;
    insert into private.file_opens as f (admin_id, bucket, path, at) values (v_me, p_bucket, v_path, now())
      on conflict (admin_id, bucket, path) do update set at = excluded.at;
    v_n := v_n + 1;
    if not exists (select 1 from public.admin_log l where l.admin_id = v_me and l.action = case when p_bucket = 'ideas' then 'idea_files' else 'ticket_files' end and (l.detail ->> 'ref')::bigint = v_ref and l.at > now() - interval '30 minutes') then
      perform private.admin_log(case when p_bucket = 'ideas' then 'idea_files' else 'ticket_files' end, v_owner, jsonb_build_object('ref', v_ref));
    end if;
  end loop;
  if random() < 0.05 then
    delete from private.file_opens where at < now() - interval '1 day';
  end if;
  return v_n;
end;
$$;

create or replace function public.file_staff_ok(p_bucket text, p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_staff(auth.uid())
    and exists (select 1 from private.file_opens f where f.admin_id = auth.uid() and f.bucket = p_bucket and f.path = p_name and f.at > now() - interval '1 hour');
$$;

create or replace function public.admin_files_cleanup()
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_n integer;
begin
  v_n := private.files_sweep(null);
  if v_n > 0 then
    perform private.admin_log('files_cleanup', null, jsonb_build_object('files', v_n));
  end if;
  return v_n;
end;
$$;

revoke all on function public.file_upload_ok(text) from public, anon, authenticated;
revoke all on function public.file_mine(text, text) from public, anon, authenticated;
revoke all on function public.file_staff_ok(text, text) from public, anon, authenticated;
revoke all on function public.admin_files_open(text, text[]) from public, anon, authenticated;
revoke all on function public.admin_files_cleanup() from public, anon, authenticated;
grant execute on function public.file_upload_ok(text) to authenticated;
grant execute on function public.file_mine(text, text) to authenticated;
grant execute on function public.file_staff_ok(text, text) to authenticated;
grant execute on function public.admin_files_open(text, text[]) to authenticated;
grant execute on function public.admin_files_cleanup() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('ideas', 'ideas', false, 8388608, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json', 'application/zip']),
  ('tickets', 'tickets', false, 8388608, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json', 'application/zip']),
  ('dm', 'dm', false, 8388608, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json', 'application/zip'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "ideas: upload own" on storage.objects;
create policy "ideas: upload own" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'ideas'
    and name ~ ('^' || (select auth.uid())::text || '/[a-z0-9-]{8,64}\.(png|jpg|webp|gif|pdf|txt|md|csv|json|log|zip)$')
    and public.file_upload_ok('ideas')
  );
drop policy if exists "ideas: read own or staff" on storage.objects;
create policy "ideas: read own or staff" on storage.objects for select to authenticated
  using (bucket_id = 'ideas' and (public.file_mine('ideas', name) or public.file_staff_ok('ideas', name)));

drop policy if exists "tickets: upload own" on storage.objects;
create policy "tickets: upload own" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'tickets'
    and name ~ ('^' || (select auth.uid())::text || '/[a-z0-9-]{8,64}\.(png|jpg|webp|gif|pdf|txt|md|csv|json|log|zip)$')
    and public.file_upload_ok('tickets')
  );
drop policy if exists "tickets: read own ticket or staff" on storage.objects;
create policy "tickets: read own ticket or staff" on storage.objects for select to authenticated
  using (bucket_id = 'tickets' and (public.file_mine('tickets', name) or public.file_staff_ok('tickets', name)));

drop policy if exists "dm: upload to friend" on storage.objects;
create policy "dm: upload to friend" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'dm'
    and name ~ ('^' || (select auth.uid())::text || '/[0-9a-f-]{36}/[a-z0-9-]{8,64}\.(png|jpg|webp|gif|pdf|txt|md|csv|json|log|zip)$')
    and exists (select 1 from public.friends f where f.user_id = (select auth.uid()) and f.friend_id::text = (storage.foldername(name))[2])
    and public.file_upload_ok('dm')
    and public.dm_upload_ok((storage.foldername(name))[2])
  );
drop policy if exists "dm: read own conversations" on storage.objects;
create policy "dm: read own conversations" on storage.objects for select to authenticated
  using (bucket_id = 'dm' and (select auth.uid())::text in ((storage.foldername(name))[1], (storage.foldername(name))[2]) and public.file_mine('dm', name));

create or replace function public.export_my_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return null;
  end if;
  perform private.rate_check('export', 5, interval '1 hour');
  return jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at, 'providers', u.raw_app_meta_data -> 'providers') from auth.users u where u.id = auth.uid()),
    'profile', (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
    'game_stats', coalesce((select jsonb_agg(to_jsonb(s) order by s.game_id) from public.game_stats s where s.user_id = auth.uid()), '[]'::jsonb),
    'game_saves', coalesce((select jsonb_agg(to_jsonb(s) order by s.game_id) from public.game_saves s where s.user_id = auth.uid()), '[]'::jsonb),
    'friends', coalesce((select jsonb_agg(to_jsonb(f)) from public.my_friends() f), '[]'::jsonb),
    'friend_requests', coalesce((select jsonb_agg(to_jsonb(r)) from public.my_friend_requests() r), '[]'::jsonb),
    'blocks', coalesce((select jsonb_agg(jsonb_build_object('blocked', b.blocked, 'created_at', b.created_at)) from public.user_blocks b where b.blocker = auth.uid()), '[]'::jsonb),
    'analytics_events', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at) from (select created_at, session_id, event, game_id, props, device from public.analytics_events where user_id = auth.uid() order by created_at desc limit 20000) e), '[]'::jsonb),
    'ideas', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'kind', i.kind, 'title', i.title, 'body', i.body, 'game', i.game, 'context', i.ctx, 'attachments', i.attachments, 'status', i.status, 'reply', i.reply, 'reply_at', i.reply_at, 'created_at', i.created_at) order by i.id) from public.ideas i where i.user_id = auth.uid()), '[]'::jsonb),
    'tickets', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'subject', t.subject, 'status', t.status, 'created_at', t.created_at,
      'messages', coalesce((select jsonb_agg(jsonb_build_object('from_staff', m.is_admin, 'body', m.body, 'attachments', m.attachments, 'created_at', m.created_at) order by m.id) from public.ticket_messages m where m.ticket_id = t.id), '[]'::jsonb)) order by t.id) from public.tickets t where t.user_id = auth.uid()), '[]'::jsonb),
    'files', coalesce((select jsonb_agg(jsonb_build_object('bucket', o.bucket_id, 'path', o.name, 'size', o.metadata -> 'size', 'type', o.metadata -> 'mimetype', 'created_at', o.created_at) order by o.created_at) from storage.objects o where o.bucket_id in ('ideas', 'tickets', 'dm') and o.name like auth.uid()::text || '/%'), '[]'::jsonb)
  );
end;
$$;

create or replace function public.delete_my_account()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  perform private.rate_check('delete_account', 3, interval '1 hour');
  perform private.files_drop_user(v_uid);
  delete from public.ideas where user_id = v_uid;
  delete from public.game_saves where user_id = v_uid;
  delete from public.game_stats where user_id = v_uid;
  delete from public.friends where user_id = v_uid or friend_id = v_uid;
  delete from public.friend_requests where from_id = v_uid or to_id = v_uid;
  delete from public.dms where from_id = v_uid or to_id = v_uid;
  delete from public.user_blocks where blocker = v_uid or blocked = v_uid;
  update public.analytics_events set user_id = null where user_id = v_uid;
  begin
    delete from auth.users where id = v_uid;
    return 'deleted';
  exception when insufficient_privilege then
    update public.profiles set username = null, display_name = null, avatar_url = null where id = v_uid;
    insert into public.account_deletion_requests (user_id) values (v_uid) on conflict (user_id) do nothing;
    return 'requested';
  end;
end;
$$;
revoke all on function public.export_my_data() from public, anon, authenticated;
revoke all on function public.delete_my_account() from public, anon, authenticated;
grant execute on function public.export_my_data() to authenticated;
grant execute on function public.delete_my_account() to authenticated;

create or replace function private.profile_files_gone()
returns trigger
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  begin
    perform private.files_drop_user(old.id);
  exception when others then
    null;
  end;
  return old;
end;
$$;
revoke all on function private.profile_files_gone() from public, anon, authenticated;
drop trigger if exists profiles_files_gone on public.profiles;
create trigger profiles_files_gone before delete on public.profiles
  for each row execute function private.profile_files_gone();

notify pgrst, 'reload schema';

alter table public.analytics_events add column if not exists skip smallint not null default 0;
alter table public.analytics_events add column if not exists pre boolean not null default false;
create index if not exists analytics_visitor_idx on public.analytics_events (visitor_id) where visitor_id is not null;

create table if not exists private.an_link (
  k text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now()
);
create index if not exists an_link_user_idx on private.an_link (user_id);
create index if not exists an_link_at_idx on private.an_link (at);
alter table private.an_link enable row level security;
revoke all on table private.an_link from public, anon, authenticated;

create table if not exists private.an_events (
  event text primary key check (event ~ '^[a-z0-9_]{1,40}$')
);
alter table private.an_events enable row level security;
revoke all on table private.an_events from public, anon, authenticated;
insert into private.an_events (event)
select unnest(array['session', 'session_end', 'sess_sum', 'view', 'page_time', 'scroll', 'impr', 'tile_click', 'search', 'search_go', 'filter', 'filter_clear', 'sort', 'ui', 'soon', 'setting', 'profile',
  'consent', 'auth', 'friend', 'dm', 'ticket', 'admin', 'favourite', 'idea', 'file', 'data_download', 'records_reset', 'update_ready', 'rage', 'dead', 'vitals', 'error', 'kb', 'pad', 'rebind',
  'env_dev', 'env_geo', 'env_scr', 'env_caps', 'game_open', 'game_launch', 'game_play', 'game_time', 'game_active', 'game_quit', 'restart', 'pause', 'fullscreen',
  'online_party', 'party_create', 'party_join', 'party_retry', 'party_play', 'rl_match', 'rl_left', 'subway_start', 'subway_over', 'ad_impression', 'ad_click', 'ad_revenue'])
on conflict (event) do nothing;

create or replace function private.an_level(p_uid uuid)
returns smallint
language sql
stable
security definer
set search_path = ''
as $$
  select (case
    when p_uid is null then 0
    when exists (select 1 from public.test_accounts t where t.user_id = p_uid) then 2
    when exists (select 1 from public.profiles p where p.id = p_uid and p.role in ('admin', 'owner')) then 1
    else 0 end)::smallint;
$$;

create or replace function private.an_lvl()
returns smallint
language sql
stable
set search_path = ''
as $$
  select (case current_setting('gp.an_lvl', true) when '0' then 0 when '2' then 2 else 1 end)::smallint;
$$;

create or replace function private.an_user_ok(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.an_level(p_uid) <= private.an_lvl();
$$;

create or replace function private.analytics_ident()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sk text := 's:' || new.session_id;
  v_vk text := case when new.visitor_id is null then null else 'v:' || new.visitor_id end;
  v_uid uuid;
  v_lvl smallint := 0;
  v_l smallint;
  v_ip text;
begin
  if not exists (select 1 from private.an_events a where a.event = new.event) then
    return null;
  end if;
  if new.user_id is not null and auth.uid() is not null and new.user_id <> auth.uid() then
    return new;
  end if;
  if new.user_id is null then
    if octet_length(new.props::text) > 1500 then
      return null;
    end if;
    v_ip := private.client_ip();
    if v_ip <> '' and private.over('ai:' || md5(v_ip), date_trunc('hour', now()), 5000) then
      return null;
    end if;
  end if;
  if exists (select 1 from public.analytics_events x where x.session_id = new.session_id and x.event = new.event and x.client_at = new.client_at and x.props = new.props) then
    return null;
  end if;
  new.pre := false;
  if new.user_id is not null then
    v_lvl := private.an_level(new.user_id);
    if not exists (select 1 from private.an_link l where l.k = v_sk) then
      insert into private.an_link (k, user_id) values (v_sk, new.user_id) on conflict (k) do nothing;
      update public.analytics_events e set pre = true, skip = greatest(e.skip, v_lvl)
        where e.session_id = new.session_id and e.user_id is null and (not e.pre or e.skip < v_lvl);
    end if;
    if v_lvl > 0 and v_vk is not null and not exists (select 1 from private.an_link l where l.k = v_vk and private.an_level(l.user_id) >= v_lvl) then
      insert into private.an_link (k, user_id) values (v_vk, new.user_id)
        on conflict (k) do update set user_id = excluded.user_id, at = now();
      update public.analytics_events e set skip = v_lvl
        where e.visitor_id = new.visitor_id and e.user_id is null and e.skip < v_lvl;
    end if;
  else
    select l.user_id into v_uid from private.an_link l where l.k = v_sk;
    if v_uid is not null then
      new.pre := true;
      v_lvl := private.an_level(v_uid);
    end if;
    if v_lvl < 2 and v_vk is not null then
      select private.an_level(l.user_id) into v_l from private.an_link l where l.k = v_vk;
      v_lvl := greatest(v_lvl, coalesce(v_l, 0));
    end if;
  end if;
  new.skip := v_lvl;
  return new;
end;
$$;

drop trigger if exists analytics_ident on public.analytics_events;
create trigger analytics_ident before insert on public.analytics_events
  for each row execute function private.analytics_ident();

create or replace function private.an_reflag(p_uid uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_lvl smallint := private.an_level(p_uid);
  v_vids text[];
  v_vid text;
  v_l smallint;
begin
  if p_uid is null then
    return;
  end if;
  update public.analytics_events e set skip = v_lvl where e.user_id = p_uid and e.skip <> v_lvl;
  update public.analytics_events e set skip = v_lvl
    from private.an_link l
    where l.user_id = p_uid and l.k like 's:%' and e.session_id = substr(l.k, 3) and e.user_id is null and e.skip <> v_lvl;
  select array_agg(distinct e.visitor_id) into v_vids from public.analytics_events e where e.user_id = p_uid and e.visitor_id is not null;
  if v_lvl > 0 then
    insert into private.an_link as l (k, user_id)
      select 'v:' || x.v, p_uid from unnest(coalesce(v_vids, array[]::text[])) x(v)
      on conflict (k) do update set user_id = excluded.user_id, at = now() where private.an_level(l.user_id) < v_lvl;
  else
    delete from private.an_link l where l.user_id = p_uid and l.k like 'v:%';
  end if;
  foreach v_vid in array coalesce(v_vids, array[]::text[]) loop
    select coalesce(max(private.an_level(l.user_id)), 0) into v_l from private.an_link l where l.k = 'v:' || v_vid;
    update public.analytics_events e set skip = v_l where e.visitor_id = v_vid and e.user_id is null and not e.pre and e.skip <> v_l;
  end loop;
end;
$$;

create or replace function private.an_role_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'profiles' then
    perform private.an_reflag(new.id);
  else
    perform private.an_reflag(new.user_id);
  end if;
  return null;
end;
$$;

drop trigger if exists profiles_an_role on public.profiles;
create trigger profiles_an_role after update of role on public.profiles
  for each row when (old.role is distinct from new.role) execute function private.an_role_sync();
drop trigger if exists test_accounts_an on public.test_accounts;
create trigger test_accounts_an after insert on public.test_accounts
  for each row execute function private.an_role_sync();

do $$
declare
  r record;
begin
  perform set_config('statement_timeout', '0', true);
  insert into private.an_link (k, user_id)
    select 's:' || x.session_id, x.user_id
    from (select distinct on (e.session_id) e.session_id, e.user_id from public.analytics_events e where e.user_id is not null order by e.session_id, e.id) x
    on conflict (k) do nothing;
  update public.analytics_events e set pre = true
    from private.an_link l
    where l.k = 's:' || e.session_id and e.user_id is null and not e.pre;
  for r in select t.user_id as id from public.test_accounts t union select p.id from public.profiles p where p.role in ('admin', 'owner') loop
    perform private.an_reflag(r.id);
  end loop;
end;
$$;

create or replace view private.an_ev as
select e.id, e.created_at, e.client_at, e.session_id, e.visitor_id, e.user_id, e.event, e.game_id, e.props, e.device, e.pre,
  case when e.user_id is not null then e.user_id::text when e.pre then null else coalesce(e.visitor_id, e.session_id) end as who
from public.analytics_events e
where e.skip <= (select private.an_lvl());
revoke all on table private.an_ev from public, anon, authenticated;

do $$
begin
  execute $v$create or replace view admin.events_who with (security_invoker = true) as
select e.id, e.created_at, e.client_at, e.session_id, e.visitor_id, e.user_id, e.event, e.game_id, e.props, e.device,
  e.who,
  (e.created_at at time zone 'Europe/Paris')::date as day
from private.an_ev e$v$;
exception when invalid_table_definition then
  null;
end;
$$;

create or replace view admin.daily_active_users with (security_invoker = true) as
select day,
  count(distinct who) as active_players,
  count(distinct user_id) as signed_in_players,
  count(distinct session_id) as sessions,
  count(*) filter (where event = 'game_launch') as game_launches,
  round(coalesce(sum(case when event = 'game_time' and jsonb_typeof(props -> 'sec') = 'number' then (props ->> 'sec')::numeric end), 0) / 3600, 2) as hours_played,
  count(*) as events
from admin.events_who
group by day
order by day desc;

create or replace view admin.retention with (security_invoker = true) as
with active as (
  select who, day
  from admin.events_who
  where who is not null and created_at >= now() - interval '120 days'
  group by 1, 2
), firsts as (
  select who, min(day) as first_day from active group by who
)
select f.first_day as cohort_day,
  count(*) as new_players,
  round(100.0 * count(*) filter (where exists (select 1 from active a where a.who = f.who and a.day = f.first_day + 1)) / count(*), 1) as day1_pct,
  round(100.0 * count(*) filter (where exists (select 1 from active a where a.who = f.who and a.day = f.first_day + 7)) / count(*), 1) as day7_pct,
  round(100.0 * count(*) filter (where exists (select 1 from active a where a.who = f.who and a.day = f.first_day + 30)) / count(*), 1) as day30_pct,
  round(100.0 * count(*) filter (where exists (select 1 from active a where a.who = f.who and a.day > f.first_day and a.day <= f.first_day + 7)) / count(*), 1) as back_within_7d_pct
from firsts f
group by f.first_day
order by cohort_day desc;

create or replace view admin.signups_daily with (security_invoker = true) as
select (u.created_at at time zone 'Europe/Paris')::date as day,
  count(*) as signups,
  count(*) filter (where u.raw_app_meta_data ->> 'provider' = 'google') as with_google,
  count(*) filter (where u.raw_app_meta_data ->> 'provider' = 'email') as with_email,
  count(*) filter (where u.email_confirmed_at is not null) as confirmed
from auth.users u
where private.an_user_ok(u.id)
group by 1
order by 1 desc;

create or replace view admin.account_game_totals with (security_invoker = true) as
select game_id,
  count(*) as accounts,
  sum(plays) as plays,
  round((sum(seconds_played) / 3600)::numeric, 2) as hours,
  max(last_played) as last_played
from public.game_stats
where private.an_user_ok(user_id)
group by game_id
order by plays desc;

create or replace view admin.top_searches with (security_invoker = true) as
select props ->> 'q' as query,
  count(*) as searches,
  count(*) filter (where jsonb_typeof(props -> 'n') = 'number' and (props ->> 'n')::numeric = 0) as with_no_results,
  max(created_at) as last_searched
from private.an_ev
where event = 'search' and props ? 'q'
group by 1
order by searches desc;

create or replace view admin.recent_errors with (security_invoker = true) as
select created_at, game_id, props ->> 'where' as place, props ->> 'msg' as message, device, session_id
from private.an_ev
where event = 'error'
order by created_at desc
limit 500;

create or replace view admin.devices with (security_invoker = true) as
select coalesce(device, 'unknown') as device,
  props ->> 'os' as os,
  props ->> 'browser' as browser,
  count(distinct session_id) as sessions
from private.an_ev
where event = 'session'
group by 1, 2, 3
order by sessions desc;

create or replace view admin.overview with (security_invoker = true) as
select
  (select count(*) from auth.users u where private.an_user_ok(u.id)) as accounts,
  (select count(*) from auth.users u where u.created_at > now() - interval '7 days' and private.an_user_ok(u.id)) as new_accounts_7d,
  (select count(*) from public.profiles p where p.username is not null and private.an_user_ok(p.id)) as accounts_with_username,
  (select count(*) from private.an_ev e where e.created_at > now() - interval '30 days') as events,
  (select count(distinct who) from admin.events_who where created_at >= ((now() at time zone 'Europe/Paris')::date::timestamp at time zone 'Europe/Paris')) as active_today,
  (select count(distinct who) from admin.events_who where created_at > now() - interval '7 days') as active_7d,
  (select count(distinct who) from admin.events_who where created_at > now() - interval '30 days') as active_30d,
  (select count(*) from private.an_ev where event = 'game_launch' and created_at > now() - interval '7 days') as launches_7d,
  (select round(coalesce(sum(x.sec), 0) / 3600, 1) from private.play_rows(now() - interval '7 days') x) as hours_played_7d;

create or replace function admin.top_games(p_days integer default 7)
returns table (game_id text, launches bigint, players bigint, hours numeric)
language sql
stable
set search_path = ''
as $$
  select e.game_id,
    count(*) filter (where e.event = 'game_launch'),
    count(distinct e.who),
    round(coalesce(sum(case when e.event = 'game_time' and jsonb_typeof(e.props -> 'sec') = 'number' then (e.props ->> 'sec')::numeric end), 0) / 3600, 2)
  from private.an_ev e
  where e.game_id is not null and e.created_at > now() - make_interval(days => greatest(1, p_days))
  group by e.game_id
  order by 2 desc, 4 desc;
$$;

revoke all on all tables in schema admin from public, anon, authenticated;
revoke all on all functions in schema admin from public, anon, authenticated;

create or replace function private.ins_top(p_event text, p_key text, p_since timestamptz, p_n integer default 15)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k), '[]'::jsonb)
  from (
    select e.props ->> p_key as k, count(distinct e.session_id) as n
    from private.an_ev e
    where e.event = p_event and e.created_at >= p_since and coalesce(e.props ->> p_key, '') <> ''
    group by 1
    order by 2 desc, 1
    limit p_n
  ) t
$$;

create or replace function private.ins_share(p_event text, p_key text, p_since timestamptz)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('n', count(*), 'yes', count(*) filter (where private.jbool(e.props, p_key)))
  from private.an_ev e
  where e.event = p_event and e.created_at >= p_since and private.jbool(e.props, p_key) is not null
$$;

create or replace function private.ins_pair(p_event text, p_a text, p_b text, p_sep text, p_since timestamptz, p_n integer default 15)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k), '[]'::jsonb)
  from (
    select (e.props ->> p_a) || p_sep || (e.props ->> p_b) as k, count(distinct e.session_id) as n
    from private.an_ev e
    where e.event = p_event and e.created_at >= p_since and coalesce(e.props ->> p_a, '') <> '' and coalesce(e.props ->> p_b, '') <> ''
    group by 1
    order by 2 desc, 1
    limit p_n
  ) t
$$;

create or replace function private.play_rows(p_since timestamptz)
returns table (session_id text, who text, user_id uuid, game_id text, visit text, at timestamptz, sec numeric)
language sql
stable
set search_path = ''
as $$
  with beats as (
    select e.session_id, e.who, e.user_id, e.game_id,
      left(e.props ->> 'v', 40) as visit, e.created_at,
      least(private.jnum(e.props, 'sec'), 43200) as cum
    from private.an_ev e
    where e.event = 'game_active' and e.game_id is not null and e.created_at >= p_since - interval '2 days'
      and private.jnum(e.props, 'sec') > 0 and coalesce(e.props ->> 'v', '') <> ''
  ), steps as (
    select b.session_id, b.who, b.user_id, b.game_id, b.visit, b.created_at,
      b.cum - coalesce(max(b.cum) over (partition by b.session_id, b.visit order by b.cum, b.created_at rows between unbounded preceding and 1 preceding), 0) as inc
    from beats b
  ), modern as (
    select distinct e.session_id
    from private.an_ev e
    where e.event = 'game_active' and e.created_at >= p_since - interval '2 days'
  )
  select s.session_id, s.who, s.user_id, s.game_id, s.visit, s.created_at, s.inc
  from steps s
  where s.created_at >= p_since and s.inc > 0
  union all
  select e.session_id, e.who, e.user_id, e.game_id, null::text, e.created_at, least(private.jnum(e.props, 'sec'), 43200)
  from private.an_ev e
  left join modern m on m.session_id = e.session_id
  where e.event = 'game_time' and e.game_id is not null and e.created_at >= p_since
    and private.jnum(e.props, 'sec') > 0 and m.session_id is null
$$;

create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  return jsonb_build_object(
    'overview', (select to_jsonb(o) from admin.overview o),
    'daily', coalesce((select jsonb_agg(to_jsonb(d) order by d.day) from (select * from admin.daily_active_users order by day desc limit 30) d), '[]'::jsonb),
    'signups', coalesce((select jsonb_agg(to_jsonb(s) order by s.day) from (select * from admin.signups_daily order by day desc limit 30) s), '[]'::jsonb),
    'games', coalesce((select jsonb_agg(to_jsonb(g)) from (
      select coalesce(m.game_id, t.game_id, e.game_id, a.game_id) as game_id,
        coalesce(m.launches, 0) as launches, coalesce(m.plays, 0) as plays, coalesce(m.players, 0) as players,
        coalesce(m.launches_7d, 0) as launches_7d, coalesce(t.hours, 0) as hours, coalesce(t.hours_7d, 0) as hours_7d,
        coalesce(t.avg_minutes_per_visit, 0) as avg_min, coalesce(e.errors, 0) as errors, coalesce(e.errors_7d, 0) as errors_7d,
        e.last_error, e.last_error_at, coalesce(a.accounts, 0) as accounts, m.last_launch
      from admin.most_played_games m
      full join admin.most_time_played t on t.game_id = m.game_id
      full join (
        select x.game_id, count(*) as errors, count(*) filter (where x.created_at > now() - interval '7 days') as errors_7d,
          (array_agg(x.props ->> 'msg' order by x.created_at desc))[1] as last_error, max(x.created_at) as last_error_at
        from private.an_ev x where x.event = 'error' and x.game_id is not null group by x.game_id
      ) e on e.game_id = coalesce(m.game_id, t.game_id)
      full join admin.account_game_totals a on a.game_id = coalesce(m.game_id, t.game_id, e.game_id)
    ) g), '[]'::jsonb),
    'players', coalesce((select jsonb_agg(to_jsonb(p)) from (
      select s.user_id, pr.username, pr.display_name, s.game_id, s.plays, s.seconds_played, s.best_score, s.last_played
      from public.game_stats s left join public.profiles pr on pr.id = s.user_id
      where private.an_user_ok(s.user_id)
      order by s.seconds_played desc limit 300
    ) p), '[]'::jsonb),
    'errors', coalesce((select jsonb_agg(to_jsonb(r)) from (select * from admin.recent_errors limit 60) r), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(to_jsonb(d)) from (select * from admin.devices limit 20) d), '[]'::jsonb),
    'searches', coalesce((select jsonb_agg(to_jsonb(q)) from (select * from admin.top_searches limit 25) q), '[]'::jsonb),
    'retention', coalesce((select jsonb_agg(to_jsonb(r)) from (select * from admin.retention limit 14) r), '[]'::jsonb),
    'at', now()
  );
end;
$$;

create or replace function public.admin_insights(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 366));
  v_since timestamptz := now() - make_interval(days => v_days);
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_today - (v_days - 1);
  r jsonb;
begin
  perform private.need_admin();

  r := jsonb_build_object('days', v_days, 'at', now());

  r := r || jsonb_build_object('coverage', jsonb_build_object(
    'sessions', (select count(distinct session_id) from private.an_ev where created_at >= v_since),
    'geo', (select count(distinct session_id) from private.an_ev where event = 'env_geo' and created_at >= v_since),
    'dev', (select count(distinct session_id) from private.an_ev where event = 'env_dev' and created_at >= v_since)
  ));

  r := r || jsonb_build_object('geo', jsonb_build_object(
    'countries', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select coalesce(nullif(e.props ->> 'cc', ''), e.props ->> 'scc') as k, count(distinct e.session_id) as n
        from private.an_ev e
        where e.event = 'env_geo' and e.created_at >= v_since and coalesce(nullif(e.props ->> 'cc', ''), e.props ->> 'scc', '') <> ''
        group by 1 order by 2 desc, 1 limit 30
      ) t), '[]'::jsonb),
    'regions', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select concat_ws(', ', e.props ->> 'region', e.props ->> 'cc') as k, count(distinct e.session_id) as n
        from private.an_ev e
        where e.event = 'env_geo' and e.created_at >= v_since and coalesce(e.props ->> 'region', '') <> ''
        group by 1 order by 2 desc, 1 limit 20
      ) t), '[]'::jsonb),
    'cities', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select concat_ws(', ', e.props ->> 'city', e.props ->> 'cc') as k, count(distinct e.session_id) as n
        from private.an_ev e
        where e.event = 'env_geo' and e.created_at >= v_since and coalesce(e.props ->> 'city', '') <> ''
        group by 1 order by 2 desc, 1 limit 20
      ) t), '[]'::jsonb),
    'isps', private.ins_top('env_geo', 'isp', v_since, 20),
    'tz', private.ins_top('env_geo', 'tz', v_since, 12),
    'net', private.ins_top('env_geo', 'net', v_since, 6),
    'ctype', private.ins_top('env_geo', 'ctype', v_since, 8),
    'vpn', private.ins_share('env_geo', 'vpn', v_since),
    'dc', private.ins_share('env_geo', 'dc', v_since),
    'save', private.ins_share('env_geo', 'save', v_since),
    'speed', (
      select jsonb_build_object(
        'dl', round(percentile_cont(0.5) within group (order by private.jnum(e.props, 'dl'))::numeric, 1),
        'rtt', round(percentile_cont(0.5) within group (order by private.jnum(e.props, 'rtt'))::numeric))
      from private.an_ev e
      where e.event = 'env_geo' and e.created_at >= v_since and private.jnum(e.props, 'dl') is not null),
    'hours', coalesce((
      select jsonb_agg(jsonb_build_object('d', t.d, 'h', t.h, 'v', t.v))
      from (
        select extract(isodow from x.t)::int - 1 as d, extract(hour from x.t)::int as h, round(sum(x.sec) / 3600, 2) as v
        from (
          select case when private.jnum(g.props, 'off') between -900 and 900
              then (e.created_at at time zone 'UTC') + make_interval(mins => private.jnum(g.props, 'off')::int)
              else e.created_at at time zone 'Europe/Paris' end as t,
            private.jnum(e.props, 'sec') as sec
          from private.an_ev e
          left join lateral (
            select g0.props from private.an_ev g0
            where g0.session_id = e.session_id and g0.event = 'env_geo' limit 1
          ) g on true
          where e.event = 'game_time' and e.created_at >= v_since and private.jnum(e.props, 'sec') > 0
        ) x
        group by 1, 2
      ) t), '[]'::jsonb)
  ));

  r := r || jsonb_build_object('dev', jsonb_build_object(
    'os', private.ins_top('env_dev', 'osv', v_since, 15),
    'browsers', private.ins_top('env_dev', 'brv', v_since, 15),
    'models', private.ins_top('env_dev', 'model', v_since, 15),
    'gpus', private.ins_top('env_dev', 'gpu', v_since, 15),
    'cores', private.ins_top('env_dev', 'cores', v_since, 10),
    'mem', private.ins_top('env_dev', 'mem', v_since, 8),
    'hz', private.ins_top('env_dev', 'hz', v_since, 10),
    'kb', private.ins_top('env_dev', 'kb', v_since, 6),
    'arch', private.ins_top('env_dev', 'arch', v_since, 6),
    'gl2', private.ins_share('env_dev', 'gl2', v_since),
    'wgpu', private.ins_share('env_dev', 'wgpu', v_since),
    'langs', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select e.props -> 'langs' ->> 0 as k, count(distinct e.session_id) as n
        from private.an_ev e
        where e.event = 'env_dev' and e.created_at >= v_since and jsonb_typeof(e.props -> 'langs') = 'array' and coalesce(e.props -> 'langs' ->> 0, '') <> ''
        group by 1 order by 2 desc, 1 limit 10
      ) t), '[]'::jsonb),
    'pads', private.ins_top('pad', 'kind', v_since, 8),
    'pad_ids', private.ins_top('pad', 'id', v_since, 10)
  ));

  r := r || jsonb_build_object('vitals', coalesce((
    select jsonb_agg(jsonb_build_object('device', t.device, 'n', t.n, 'lcp', t.lcp, 'inp', t.inp, 'cls', t.cls, 'fcp', t.fcp, 'ttfb', t.ttfb) order by t.n desc)
    from (
      select coalesce(e.device, 'unknown') as device, count(*) as n,
        round(percentile_cont(0.75) within group (order by private.jnum(e.props, 'lcp'))::numeric) as lcp,
        round(percentile_cont(0.75) within group (order by private.jnum(e.props, 'inp'))::numeric) as inp,
        round(percentile_cont(0.75) within group (order by private.jnum(e.props, 'cls'))::numeric, 3) as cls,
        round(percentile_cont(0.75) within group (order by private.jnum(e.props, 'fcp'))::numeric) as fcp,
        round(percentile_cont(0.75) within group (order by private.jnum(e.props, 'ttfb'))::numeric) as ttfb
      from private.an_ev e
      where e.event = 'vitals' and e.created_at >= v_since
      group by 1
    ) t), '[]'::jsonb));

  r := r || jsonb_build_object('games', coalesce((
    select jsonb_agg(to_jsonb(t) order by t.n desc, t.id)
    from (
      select q.game_id as id,
        count(*) as n,
        count(*) filter (where private.jnum(q.props, 'sec') < 30) as early,
        round(avg(private.jnum(q.props, 'sec'))) as sec,
        round(avg(private.jnum(q.props, 'rounds')), 1) as rounds,
        round(avg(private.jnum(q.props, 'fps')), 1) as fps,
        round(percentile_cont(0.1) within group (order by private.jnum(q.props, 'fpsmin'))::numeric, 1) as fps_low,
        round(avg(private.jnum(q.props, 'fps5')), 1) as fps5,
        coalesce(sum(private.jnum(q.props, 'ik')), 0) as ik,
        coalesce(sum(private.jnum(q.props, 'im')), 0) as im,
        coalesce(sum(private.jnum(q.props, 'it')), 0) as it,
        coalesce(sum(private.jnum(q.props, 'ip')), 0) as ip,
        round(avg(private.jnum(q.props, 'lv')), 1) as lv_avg,
        max(private.jnum(q.props, 'lv')) as lv_max,
        count(*) filter (where private.jnum(q.props, 'lv') is not null) as lv_n,
        (select jsonb_agg(jsonb_build_object('lv', z.lv, 'n', z.n) order by z.n desc, z.lv)
          from (select private.jnum(q2.props, 'lv') as lv, count(*) as n from private.an_ev q2
            where q2.event = 'game_quit' and q2.game_id = q.game_id and q2.created_at >= v_since and private.jnum(q2.props, 'lv') is not null
            group by 1 order by 2 desc, 1 limit 5) z) as quit_lv,
        (select jsonb_build_object('n', count(*),
            'p10', percentile_cont(0.1) within group (order by s.v), 'p25', percentile_cont(0.25) within group (order by s.v),
            'p50', percentile_cont(0.5) within group (order by s.v), 'p75', percentile_cont(0.75) within group (order by s.v),
            'p90', percentile_cont(0.9) within group (order by s.v), 'max', max(s.v))
          from (select x.value::numeric as v from private.an_ev q3, jsonb_array_elements_text(q3.props -> 'sc') x
            where q3.event = 'game_quit' and q3.game_id = q.game_id and q3.created_at >= v_since and jsonb_typeof(q3.props -> 'sc') = 'array'
              and x.value ~ '^-?[0-9]+(\.[0-9]+)?$') s) as scores,
        (select jsonb_build_object('n', count(*),
            'p50', round(percentile_cont(0.5) within group (order by private.jnum(l.props, 'ms'))::numeric),
            'p90', round(percentile_cont(0.9) within group (order by private.jnum(l.props, 'ms'))::numeric))
          from private.an_ev l
          where l.event = 'game_launch' and l.game_id = q.game_id and l.created_at >= v_since and private.jbool(l.props, 'lazy') and private.jnum(l.props, 'ms') > 0) as load,
        (select jsonb_build_object('up', count(*) filter (where v.vote = 1), 'down', count(*) filter (where v.vote = -1))
          from public.game_votes v where v.game_id = q.game_id and (v.user_id is null or private.an_user_ok(v.user_id))) as votes
      from private.an_ev q
      where q.event = 'game_quit' and q.game_id is not null and q.created_at >= v_since
      group by q.game_id
    ) t), '[]'::jsonb));

  r := r || jsonb_build_object('votes', coalesce((
    select jsonb_agg(jsonb_build_object('id', t.game_id, 'up', t.up, 'down', t.down) order by t.up + t.down desc, t.game_id)
    from (select game_id, count(*) filter (where vote = 1) as up, count(*) filter (where vote = -1) as down from public.game_votes gv where gv.user_id is null or private.an_user_ok(gv.user_id) group by game_id) t), '[]'::jsonb));

  r := r || jsonb_build_object('behaviour', jsonb_build_object(
    'slots', coalesce((
      select jsonb_agg(jsonb_build_object('src', s.src, 'pos', s.pos, 'imp', s.imp, 'clk', coalesce(c.clk, 0)) order by s.src, s.pos)
      from (
        select split_part(x.value, '|', 2) as src, split_part(x.value, '|', 3)::int as pos, count(*) as imp
        from private.an_ev e, jsonb_array_elements_text(e.props -> 'l') x
        where e.event = 'impr' and e.created_at >= v_since and jsonb_typeof(e.props -> 'l') = 'array' and x.value ~ '^[a-z0-9-]+\|[a-z]+\|[0-9]{1,4}$'
          and split_part(x.value, '|', 3)::int < 24
        group by 1, 2
      ) s
      left join (
        select e.props ->> 'src' as src, private.jnum(e.props, 'pos')::int as pos, count(*) as clk
        from private.an_ev e
        where e.event = 'tile_click' and e.created_at >= v_since and private.jnum(e.props, 'pos') between 0 and 23
        group by 1, 2
      ) c on c.src = s.src and c.pos = s.pos), '[]'::jsonb),
    'ctr', coalesce((
      select jsonb_agg(jsonb_build_object('id', s.id, 'imp', s.imp, 'clk', coalesce(c.clk, 0)) order by s.imp desc, s.id)
      from (
        select split_part(x.value, '|', 1) as id, count(*) as imp
        from private.an_ev e, jsonb_array_elements_text(e.props -> 'l') x
        where e.event = 'impr' and e.created_at >= v_since and jsonb_typeof(e.props -> 'l') = 'array' and x.value ~ '^[a-z0-9-]+\|[a-z]+\|[0-9]{1,4}$' and split_part(x.value, '|', 2) <> 'side'
        group by 1 order by 2 desc limit 40
      ) s
      left join (
        select e.game_id as id, count(*) as clk from private.an_ev e
        where e.event = 'tile_click' and e.created_at >= v_since and coalesce(e.props ->> 'src', '') <> 'side' and e.game_id is not null
        group by 1
      ) c on c.id = s.id), '[]'::jsonb),
    'scroll', (
      select jsonb_build_object('n', count(*), 'avg', round(avg(p)),
        'b25', count(*) filter (where p < 25), 'b50', count(*) filter (where p >= 25 and p < 50), 'b75', count(*) filter (where p >= 50 and p < 75),
        'b90', count(*) filter (where p >= 75 and p < 90), 'b100', count(*) filter (where p >= 90))
      from (select private.jnum(e.props, 'pct') as p from private.an_ev e where e.event = 'scroll' and e.created_at >= v_since and private.jnum(e.props, 'pct') is not null) s),
    'rage', private.ins_top('rage', 't', v_since, 15),
    'dead', private.ins_top('dead', 't', v_since, 15),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('v', t.v, 'n', t.n, 'sec', t.sec, 'exits', t.exits) order by t.n desc)
      from (
        select e.props ->> 'v' as v, count(*) as n, round(avg(least(private.jnum(e.props, 'sec'), 7200))) as sec, count(*) filter (where private.jbool(e.props, 'exit')) as exits
        from private.an_ev e
        where e.event = 'page_time' and e.created_at >= v_since and coalesce(e.props ->> 'v', '') <> ''
        group by 1
      ) t), '[]'::jsonb)
  ));

  r := r || jsonb_build_object('rebinds', coalesce((
    select jsonb_agg(jsonb_build_object('game', t.g, 'dev', t.dev, 'act', t.act, 'to', t.to_, 'n', t.n) order by t.n desc)
    from (
      select e.game_id as g, e.props ->> 'dev' as dev, e.props ->> 'act' as act, coalesce(e.props ->> 'to', '') as to_, count(*) as n
      from private.an_ev e
      where e.event = 'rebind' and e.created_at >= v_since
      group by 1, 2, 3, 4 order by 5 desc limit 25
    ) t), '[]'::jsonb));

  r := r || jsonb_build_object('rl', jsonb_build_object(
    'all', (
      select jsonb_build_object('n', count(*), 'wins', count(*) filter (where private.jbool(e.props, 'win')),
        'goals', round(avg(private.jnum(e.props, 'goals')), 2), 'assists', round(avg(private.jnum(e.props, 'assists')), 2),
        'saves', round(avg(private.jnum(e.props, 'saves')), 2), 'shots', round(avg(private.jnum(e.props, 'shots')), 2),
        'demos', round(avg(private.jnum(e.props, 'demos')), 2), 'boost', round(avg(private.jnum(e.props, 'boost'))),
        'score', round(avg(private.jnum(e.props, 'score'))), 'ot', count(*) filter (where private.jbool(e.props, 'ot')),
        'mvp', count(*) filter (where private.jbool(e.props, 'mvp')))
      from private.an_ev e where e.event = 'rl_match' and e.created_at >= v_since),
    'by_diff', coalesce((
      select jsonb_agg(to_jsonb(t) order by t.n desc)
      from (
        select coalesce(nullif(e.props ->> 'diff', ''), case when private.jbool(e.props, 'online') then 'online' else 'none' end) as diff,
          count(*) as n, count(*) filter (where private.jbool(e.props, 'win')) as wins,
          round(avg(private.jnum(e.props, 'us') - private.jnum(e.props, 'them')), 2) as margin,
          round(avg(private.jnum(e.props, 'goals')), 2) as goals
        from private.an_ev e where e.event = 'rl_match' and e.created_at >= v_since
        group by 1
      ) t), '[]'::jsonb),
    'by_size', private.ins_top('rl_match', 'size', v_since, 5)
  ));

  r := r || jsonb_build_object('ads', jsonb_build_object(
    'adblock', private.ins_share('env_dev', 'adb', v_since),
    'slots', coalesce((
      select jsonb_agg(to_jsonb(t) order by t.imp desc)
      from (
        select coalesce(nullif(e.props ->> 'slot', ''), '?') as slot,
          count(*) filter (where e.event = 'ad_impression') as imp,
          count(*) filter (where e.event = 'ad_click') as clk,
          round(coalesce(sum(private.jnum(e.props, 'usd')) filter (where e.event = 'ad_revenue'), 0), 4) as usd
        from private.an_ev e
        where e.event in ('ad_impression', 'ad_click', 'ad_revenue') and e.created_at >= v_since
        group by 1
      ) t), '[]'::jsonb)
  ));

  r := r || jsonb_build_object('retention', (
    with w as (
      select who, day, max(user_id::text) as uid from admin.events_who where created_at >= now() - interval '400 days' and who is not null group by who, day
    ), f as (
      select who, min(day) as first, max(uid) as uid from w group by who
    ), st as (
      select who, day, day - (row_number() over (partition by who order by day))::int as grp from w where day >= v_today - 120
    ), runs as (
      select who, count(*) as len, max(day) as last from st group by who, grp
    ), best as (
      select who, max(len) as longest, max(len) filter (where last >= v_today - 1) as cur from runs group by who
    )
    select jsonb_build_object(
      'mau', (select count(distinct who) from w where day >= v_today - 29),
      'dau', (select round(avg(n), 1) from (select day, count(distinct who) as n from w where day between v_from and v_today group by day) d),
      'cohort', (
        select jsonb_agg(jsonb_build_object('d', k.d, 'eligible', k.eligible, 'back', k.back) order by k.d)
        from (
          select n.d,
            count(*) filter (where f.first <= v_today - n.d) as eligible,
            count(*) filter (where f.first <= v_today - n.d and exists (select 1 from w w2 where w2.who = f.who and w2.day = f.first + n.d)) as back
          from (values (1), (7), (30)) n(d)
          cross join f
          where f.first >= v_from - 30
          group by n.d
        ) k),
      'funnel', (
        select jsonb_build_object(
          'visited', count(*),
          'launched', count(*) filter (where exists (select 1 from admin.events_who e where e.who = f.who and e.event = 'game_launch' and e.created_at >= v_since)),
          'played', count(*) filter (where (select coalesce(sum(private.jnum(e.props, 'sec')), 0) from admin.events_who e where e.who = f.who and e.event = 'game_time' and e.created_at >= v_since) >= 60),
          'account', count(*) filter (where f.uid is not null and exists (select 1 from auth.users u where u.id::text = f.uid and u.created_at >= (f.first::timestamp at time zone 'Europe/Paris') - interval '1 day')),
          'returned', count(*) filter (where exists (select 1 from w w2 where w2.who = f.who and w2.day > f.first)))
        from f where f.first >= v_from),
      'streaks', (
        select jsonb_build_object(
          'b1', count(*) filter (where longest = 1), 'b3', count(*) filter (where longest between 2 and 3),
          'b7', count(*) filter (where longest between 4 and 7), 'b14', count(*) filter (where longest between 8 and 14),
          'b15', count(*) filter (where longest >= 15), 'active', count(*) filter (where cur >= 2), 'avg_cur', round(avg(cur) filter (where cur >= 2), 1))
        from best),
      'top_streaks', coalesce((
        select jsonb_agg(jsonb_build_object('id', p.id, 'username', p.username, 'name', p.display_name, 'cur', b.cur, 'longest', b.longest) order by b.cur desc, b.longest desc)
        from (select b0.who, b0.cur, b0.longest, (select max(f0.uid) from f f0 where f0.who = b0.who) as uid from best b0 where b0.cur >= 2 order by b0.cur desc limit 200) b
        join public.profiles p on p.id::text = b.uid
        limit 10), '[]'::jsonb),
      'churn', coalesce((
        select jsonb_agg(jsonb_build_object('id', p.id, 'username', p.username, 'name', p.display_name, 'days', c.days, 'last', c.last, 'hours', c.hours) order by c.days desc, c.last desc)
        from (
          select e.user_id, count(distinct (e.created_at at time zone 'Europe/Paris')::date) as days, max(e.created_at) as last,
            round(coalesce(sum(private.jnum(e.props, 'sec')) filter (where e.event = 'game_time'), 0) / 3600, 1) as hours
          from private.an_ev e
          where e.user_id is not null and e.created_at >= now() - interval '60 days'
          group by e.user_id
          having count(distinct (e.created_at at time zone 'Europe/Paris')::date) >= 3 and max(e.created_at) < now() - interval '14 days'
          order by 2 desc limit 50
        ) c join public.profiles p on p.id = c.user_id), '[]'::jsonb),
      'churn_all', (
        select count(*) from (
          select who from w where day >= v_today - 59 group by who
          having count(*) >= 3 and max(day) < v_today - 13
        ) z)
    )
  ));

  return r;
end;
$$;

create or replace function public.admin_insights_more(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_since timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 365)));
  v_sess jsonb;
begin
  perform private.need_admin();
  with s as (
    select e.session_id,
      extract(epoch from max(e.created_at) - min(e.created_at)) as span,
      count(*) filter (where e.event = 'game_launch') as launches,
      count(distinct e.game_id) filter (where e.event = 'game_launch') as gs
    from private.an_ev e
    where e.created_at >= v_since
    group by e.session_id
  ), m as (
    select e.session_id,
      max(private.jnum(e.props, 'dur')) as dur, max(private.jnum(e.props, 'vis')) as vis,
      max(private.jnum(e.props, 'keys')) as keys, max(private.jnum(e.props, 'clicks')) as clicks, max(private.jnum(e.props, 'taps')) as taps,
      max(private.jnum(e.props, 'mdist')) as mdist, max(private.jnum(e.props, 'games')) as games, max(private.jnum(e.props, 'gset')) as gset,
      max(private.jnum(e.props, 'errs')) as errs, max(private.jnum(e.props, 'idle')) as idle, max(private.jnum(e.props, 'fs')) as fs,
      max(private.jnum(e.props, 'foc')) as foc, max(private.jnum(e.props, 'blur')) as blur, max(private.jnum(e.props, 'wheel')) as wheel,
      max(private.jnum(e.props, 'scr')) as scr, max(private.jnum(e.props, 'copy')) as copy, max(private.jnum(e.props, 'rsz')) as rsz,
      max(private.jnum(e.props, 'off')) as off
    from private.an_ev e
    where e.event = 'sess_sum' and e.created_at >= v_since
    group by e.session_id
  ), j as (
    select s.session_id, greatest(s.span, coalesce(m.dur, 0)) as dur, greatest(s.launches, coalesce(m.games, 0)) as games,
      greatest(s.gs, coalesce(m.gset, 0)) as gset, m.session_id as ms, m.vis, m.keys, m.clicks, m.taps, m.mdist, m.errs, m.idle, m.fs,
      m.foc, m.blur, m.wheel, m.scr, m.copy, m.rsz, m.off
    from s left join m on m.session_id = s.session_id
  )
  select jsonb_build_object(
    'n', count(*),
    'nm', count(j.ms),
    'dur', percentile_cont(0.5) within group (order by j.dur),
    'dur90', percentile_cont(0.9) within group (order by j.dur),
    'vis', percentile_cont(0.5) within group (order by nullif(j.vis, 0)),
    'keys', round(avg(j.keys)),
    'clicks', round(avg(j.clicks)),
    'taps', round(avg(j.taps)),
    'mdist', round(avg(j.mdist)),
    'wheel', round(avg(j.wheel)),
    'scr', round(avg(j.scr)),
    'foc', round(avg(j.foc), 1),
    'blur', round(avg(j.blur), 1),
    'copy', round(avg(j.copy), 2),
    'rsz', round(avg(j.rsz), 1),
    'off', round(100.0 * count(*) filter (where j.off > 0) / greatest(count(j.ms), 1)),
    'games', round(avg(j.games), 1),
    'gset', round(avg(j.gset), 1),
    'played', round(100.0 * count(*) filter (where j.games > 0) / greatest(count(*), 1)),
    'errs', round(avg(j.errs), 2),
    'idle', percentile_cont(0.5) within group (order by j.idle),
    'fs', round(100.0 * count(*) filter (where j.fs > 0) / greatest(count(j.ms), 1)),
    'b', jsonb_build_array(
      jsonb_build_object('k', 'Under 1 min', 'n', count(*) filter (where j.dur < 60)),
      jsonb_build_object('k', '1–5 min', 'n', count(*) filter (where j.dur >= 60 and j.dur < 300)),
      jsonb_build_object('k', '5–15 min', 'n', count(*) filter (where j.dur >= 300 and j.dur < 900)),
      jsonb_build_object('k', '15–30 min', 'n', count(*) filter (where j.dur >= 900 and j.dur < 1800)),
      jsonb_build_object('k', '30–60 min', 'n', count(*) filter (where j.dur >= 1800 and j.dur < 3600)),
      jsonb_build_object('k', 'Over 1 hour', 'n', count(*) filter (where j.dur >= 3600))
    )
  ) into v_sess
  from j;
  return jsonb_build_object(
    'sessions', v_sess,
    'screens', private.ins_top('env_scr', 'res', v_since, 15),
    'viewports', private.ins_pair('env_scr', 'vw', 'vh', '×', v_since, 15),
    'dpr', private.ins_top('env_scr', 'dpr', v_since, 10),
    'pointer', private.ins_top('env_scr', 'ptr', v_since, 4),
    'touch', private.ins_top('env_scr', 'tp', v_since, 8),
    'orient', private.ins_top('env_scr', 'ori', v_since, 6),
    'gamut', private.ins_top('env_scr', 'gam', v_since, 4),
    'mode', private.ins_top('env_scr', 'dm', v_since, 5),
    'zoom', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select z.s::text as k, count(distinct z.session_id) as n
        from (
          select e.session_id, private.jnum(e.props, 'zoom') as v,
            (select a.x from unnest(array[0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5]::numeric[]) a(x) order by abs(a.x - private.jnum(e.props, 'zoom')) limit 1) as s
          from private.an_ev e
          where e.event = 'env_scr' and e.created_at >= v_since and e.props ->> 'ptr' = 'fine' and private.jnum(e.props, 'zoom') between 0.25 and 5
        ) z
        where abs(z.s - z.v) / z.s < 0.03
        group by 1 order by 2 desc, 1 limit 10
      ) t), '[]'::jsonb),
    'depth', private.ins_top('env_scr', 'cd', v_since, 5),
    'dark', private.ins_share('env_scr', 'dark', v_since),
    'rmo', private.ins_share('env_scr', 'rmo', v_since),
    'hdr', private.ins_share('env_scr', 'hdr', v_since),
    'hov', private.ins_share('env_scr', 'hov', v_since),
    'ext', private.ins_share('env_scr', 'ext', v_since),
    'bench', private.ins_top('env_caps', 'benchb', v_since, 6),
    'quota', private.ins_top('env_caps', 'qb', v_since, 6),
    'heap', private.ins_top('env_caps', 'heap', v_since, 8),
    'battery', private.ins_top('env_caps', 'batb', v_since, 5),
    'charging', private.ins_share('env_caps', 'chg', v_since),
    'gpuv', private.ins_top('env_caps', 'gpuv', v_since, 12),
    'mtex', private.ins_top('env_caps', 'mtex', v_since, 6),
    'locale', private.ins_top('env_caps', 'loc', v_since, 15),
    'hour', private.ins_top('env_caps', 'hc', v_since, 4)
  ) || jsonb_build_object(
    'refs', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select coalesce(nullif(e.props ->> 'ref', ''), 'direct') as k, count(distinct e.session_id) as n
        from private.an_ev e
        where e.event = 'env_caps' and e.created_at >= v_since
        group by 1 order by 2 desc, 1 limit 15
      ) t), '[]'::jsonb),
    'land', private.ins_top('env_caps', 'land', v_since, 15),
    'navt', private.ins_top('env_caps', 'navt', v_since, 5),
    'plat', private.ins_top('env_caps', 'plat', v_since, 10),
    'notif', private.ins_top('env_caps', 'notif', v_since, 4),
    'mic', private.ins_top('env_caps', 'mic', v_since, 5),
    'cam', private.ins_top('env_caps', 'cam', v_since, 5),
    'voices', private.ins_top('env_caps', 'voices', v_since, 8),
    'srate', private.ins_top('env_caps', 'sr', v_since, 5),
    'route', private.ins_top('sess_sum', 'route', v_since, 4),
    'acct', private.ins_top('sess_sum', 'acct', v_since, 4),
    'theme', private.ins_top('sess_sum', 'theme', v_since, 4),
    'slang', private.ins_top('sess_sum', 'lang', v_since, 8),
    'retries', private.ins_top('party_retry', 'why', v_since, 8),
    'ctype', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select coalesce(nullif(e.props ->> 'ctype', ''), 'unknown') as k, count(distinct e.session_id) as n
        from private.an_ev e
        where e.event = 'env_geo' and e.created_at >= v_since
        group by 1 order by 2 desc, 1 limit 8
      ) t), '[]'::jsonb),
    'models', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc, t.k)
      from (
        select coalesce(nullif(e.props ->> 'model', ''),
            case when e.props ->> 'osv' like 'iOS%' then 'iPhone' when e.props ->> 'osv' like 'iPadOS%' then 'iPad' else 'Unknown model' end) as k,
          count(distinct e.session_id) as n
        from private.an_ev e
        where e.event = 'env_dev' and e.created_at >= v_since and (e.device in ('phone', 'tablet') or coalesce(e.props ->> 'model', '') <> '')
        group by 1 order by 2 desc, 1 limit 15
      ) t), '[]'::jsonb),
    'scores', coalesce((
      select jsonb_object_agg(t.g, t.o)
      from (
        select x.g, jsonb_build_object('n', count(*), 'min', min(x.v), 'p25', percentile_cont(0.25) within group (order by x.v),
          'p50', percentile_cont(0.5) within group (order by x.v), 'p75', percentile_cont(0.75) within group (order by x.v), 'max', max(x.v)) as o
        from (
          select q.game_id as g, a.value::numeric as v
          from private.an_ev q
          cross join lateral jsonb_array_elements_text(case
            when jsonb_typeof(q.props -> 'sc') = 'array' and jsonb_array_length(q.props -> 'sc') > 0 then q.props -> 'sc'
            when jsonb_typeof(q.props -> 'last') = 'number' then jsonb_build_array(q.props -> 'last')
            else '[]'::jsonb end) a
          where q.event = 'game_quit' and q.game_id is not null and q.created_at >= v_since and a.value ~ '^-?[0-9]{1,15}(\.[0-9]+)?$'
        ) x
        group by x.g
      ) t), '{}'::jsonb),
    'rl_left', (
      select jsonb_build_object('n', count(*), 'played', round(avg(private.jnum(e.props, 'played'))),
        'goals', round(avg(private.jnum(e.props, 'goals')), 2), 'saves', round(avg(private.jnum(e.props, 'saves')), 2),
        'ahead', count(*) filter (where private.jnum(e.props, 'us') > private.jnum(e.props, 'them')),
        'behind', count(*) filter (where private.jnum(e.props, 'us') < private.jnum(e.props, 'them')))
      from private.an_ev e where e.event = 'rl_left' and e.created_at >= v_since),
    'flags', (
      select jsonb_object_agg(f.k, private.ins_share(f.ev, f.k, v_since))
      from (values ('env_caps', 'wasm'), ('env_caps', 'sab'), ('env_caps', 'swk'), ('env_caps', 'vib'), ('env_caps', 'bt'), ('env_caps', 'usb'),
        ('env_caps', 'ser'), ('env_caps', 'hid'), ('env_caps', 'midi'), ('env_caps', 'share'), ('env_caps', 'wl'), ('env_caps', 'pdf'),
        ('env_caps', 'h264'), ('env_caps', 'vp9'), ('env_caps', 'pers'), ('env_caps', 'ck'), ('env_caps', 'down'), ('env_scr', 'con'),
        ('env_scr', 'fcol'), ('env_scr', 'rtr'), ('env_geo', 'tzm')) f(ev, k)),
    'extra', (
      select jsonb_object_agg(f.k, private.ins_top(f.ev, f.k, v_since, 6))
      from (values ('env_caps', 'spk'), ('env_caps', 'ach'), ('env_caps', 'glx'), ('env_caps', 'cal'), ('env_caps', 'num'), ('env_caps', 'fdw'),
        ('env_caps', 'vend'), ('env_caps', 'hist')) f(ev, k)),
    'bot', private.ins_share('env_caps', 'bot', v_since),
    'dnt', private.ins_share('env_caps', 'dnt', v_since),
    'gpc', private.ins_share('env_caps', 'gpc', v_since),
    'av1', private.ins_share('env_caps', 'av1', v_since),
    'hevc', private.ins_share('env_caps', 'hevc', v_since),
    'coi', private.ins_share('env_caps', 'coi', v_since),
    'xr', private.ins_share('env_caps', 'xr', v_since),
    'at', now()
  );
end;
$$;

create or replace function public.admin_play_insights(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 366));
  v_since timestamptz := now() - make_interval(days => v_days);
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_today - (v_days - 1);
  r jsonb;
begin
  perform private.need_admin();
  with p as materialized (
    select x.session_id, x.who, x.user_id, x.game_id, x.visit, x.at, x.sec from private.play_rows(least(v_since, now() - interval '60 days')) x
  ), geo as (
    select distinct on (e.session_id) e.session_id, private.jnum(e.props, 'off') as off
    from private.an_ev e
    where e.event = 'env_geo' and e.created_at >= v_since - interval '1 day'
    order by e.session_id, e.created_at
  ), lg as (
    select a.game_id, count(*) as n
    from private.an_ev a
    where a.event = 'game_launch' and a.game_id is not null and a.created_at >= v_since
    group by a.game_id
  ), pg as (
    select p.game_id, sum(p.sec) as sec, count(distinct p.visit) as visits
    from p
    where p.at >= v_since
    group by p.game_id
  ), firsts as (
    select w.who from admin.events_who w where w.created_at >= now() - interval '400 days' and w.who is not null group by w.who having min(w.day) >= v_from
  )
  select jsonb_build_object(
    'days', v_days,
    'hours', coalesce((
      select jsonb_agg(jsonb_build_object('d', t.d, 'h', t.h, 'v', t.v))
      from (
        select extract(isodow from x.t)::int - 1 as d, extract(hour from x.t)::int as h, round(sum(x.sec) / 3600, 2) as v
        from (
          select case when g.off between -900 and 900
              then (p.at at time zone 'UTC') + make_interval(mins => g.off::int)
              else p.at at time zone 'Europe/Paris' end as t,
            p.sec
          from p
          left join geo g on g.session_id = p.session_id
          where p.at >= v_since
        ) x
        group by 1, 2
      ) t
    ), '[]'::jsonb),
    'games', coalesce((
      select jsonb_agg(jsonb_build_object('id', pg.game_id, 'sec', round(pg.sec / greatest(coalesce(lg.n, 0), pg.visits, 1)), 'visits', greatest(coalesce(lg.n, 0), pg.visits), 'hours', round(pg.sec / 3600, 2)))
      from pg
      left join lg on lg.game_id = pg.game_id
    ), '[]'::jsonb),
    'played', (
      select count(*) from (
        select f.who from firsts f join p on p.who = f.who and p.at >= v_since group by f.who having sum(p.sec) >= 60
      ) q
    ),
    'user_hours', coalesce((
      select jsonb_object_agg(u.user_id, u.hours)
      from (
        select p.user_id, round(sum(p.sec) / 3600, 1) as hours
        from p
        where p.user_id is not null and p.at >= now() - interval '60 days'
        group by p.user_id
      ) u
    ), '{}'::jsonb),
    'at', now()
  ) into r;
  return r;
end;
$$;

create or replace function public.admin_stats_v2(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 366));
  v_to date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_to - (v_days - 1);
  v_since timestamptz := (v_from::timestamp at time zone 'Europe/Paris');
  v_today timestamptz := (v_to::timestamp at time zone 'Europe/Paris');
  v_wk timestamptz := now() - interval '7 days';
  v_lo timestamptz;
  r jsonb;
begin
  perform private.need_admin();
  v_lo := least(v_since, v_wk);
  with p as materialized (
    select x.who, x.game_id, x.visit, x.at, x.sec, (x.at at time zone 'Europe/Paris')::date as day
    from private.play_rows(v_lo) x
  ), ev as materialized (
    select a.game_id, a.event, a.created_at, a.who
    from private.an_ev a
    where a.created_at >= v_lo and a.game_id is not null and a.event in ('game_launch', 'game_play')
  ), pg as (
    select p.game_id,
      coalesce(sum(p.sec) filter (where p.at >= v_since), 0) as sec,
      coalesce(sum(p.sec) filter (where p.at >= v_wk), 0) as sec_7d,
      count(distinct p.visit) filter (where p.at >= v_since) as visits
    from p
    group by p.game_id
  ), eg as (
    select e.game_id,
      count(*) filter (where e.event = 'game_launch' and e.created_at >= v_since) as launches,
      count(*) filter (where e.event = 'game_launch' and e.created_at >= v_wk) as launches_7d,
      count(*) filter (where e.event = 'game_play' and e.created_at >= v_since) as plays
    from ev e
    group by e.game_id
  ), pl as (
    select z.game_id, count(distinct z.who) as players
    from (
      select e.game_id, e.who from ev e where e.created_at >= v_since
      union
      select p.game_id, p.who from p where p.at >= v_since
    ) z
    group by z.game_id
  ), ag as (
    select a.game_id,
      count(*) filter (where a.event = 'game_launch') as launches_all,
      max(a.created_at) filter (where a.event = 'game_launch') as last_launch,
      count(*) filter (where a.event = 'error' and a.created_at >= v_since) as errors,
      count(*) filter (where a.event = 'error' and a.created_at > v_wk) as errors_7d,
      (array_agg(a.props ->> 'msg' order by a.created_at desc) filter (where a.event = 'error'))[1] as last_error,
      max(a.created_at) filter (where a.event = 'error') as last_error_at
    from private.an_ev a
    where a.game_id is not null and a.event in ('game_launch', 'error')
    group by a.game_id
  ), sg as (
    select s.game_id, count(*) as accounts, round((sum(s.seconds_played) / 3600)::numeric, 1) as acct_hours
    from public.game_stats s
    where private.an_user_ok(s.user_id)
    group by s.game_id
  ), k as (
    select pg.game_id from pg where pg.sec > 0
    union select eg.game_id from eg
    union select ag.game_id from ag
    union select sg.game_id from sg
  ), g as (
    select k.game_id,
      coalesce(eg.launches, 0) as launches, coalesce(eg.launches_7d, 0) as launches_7d, coalesce(ag.launches_all, 0) as launches_all,
      coalesce(eg.plays, 0) as plays, coalesce(pl.players, 0) as players,
      coalesce(pg.sec, 0) as sec, coalesce(pg.sec_7d, 0) as sec_7d,
      greatest(coalesce(eg.launches, 0), coalesce(pg.visits, 0)) as visits,
      coalesce(ag.errors, 0) as errors, coalesce(ag.errors_7d, 0) as errors_7d, ag.last_error, ag.last_error_at,
      coalesce(sg.accounts, 0) as accounts, coalesce(sg.acct_hours, 0) as acct_hours, ag.last_launch
    from k
    left join pg on pg.game_id = k.game_id
    left join eg on eg.game_id = k.game_id
    left join pl on pl.game_id = k.game_id
    left join ag on ag.game_id = k.game_id
    left join sg on sg.game_id = k.game_id
  )
  select jsonb_build_object(
    'days', v_days,
    'measure', 3,
    'today', v_to,
    'staff', private.an_lvl() >= 1,
    'series', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day', d.day,
        'active', coalesce(e.active, 0),
        'signed_in', coalesce(e.signed_in, 0),
        'sessions', coalesce(e.sessions, 0),
        'launches', coalesce(e.launches, 0),
        'hours', round(coalesce(h.sec, 0) / 3600, 2),
        'signups', coalesce(s.signups, 0),
        'peak', case when tk.peak is null and pk.peak is null then null else coalesce(tk.peak, pk.peak) end
      ) order by d.day)
      from (select generate_series(v_from, v_to, interval '1 day')::date as day) d
      left join (
        select w.day,
          count(distinct w.who) as active,
          count(distinct w.user_id) as signed_in,
          count(distinct w.session_id) as sessions,
          count(*) filter (where w.event = 'game_launch') as launches
        from admin.events_who w
        where w.created_at >= v_since
        group by w.day
      ) e on e.day = d.day
      left join (select p.day, sum(p.sec) as sec from p where p.at >= v_since group by p.day) h on h.day = d.day
      left join (
        select (u.created_at at time zone 'Europe/Paris')::date as day, count(*) as signups
        from auth.users u
        where u.created_at >= v_since and private.an_user_ok(u.id)
        group by 1
      ) s on s.day = d.day
      left join (
        select (x.at at time zone 'Europe/Paris')::date as day, max(x.online) as peak
        from public.presence_samples x
        where x.at >= v_since
        group by 1
      ) pk on pk.day = d.day
      left join (
        select (t.at at time zone 'Europe/Paris')::date as day, max(t.n) as peak
        from (select pt.at, count(*) as n from private.presence_ticks pt where pt.at >= v_since and private.an_user_ok(pt.user_id) group by pt.at) t
        group by 1
      ) tk on tk.day = d.day
    ), '[]'::jsonb),
    'game_days', coalesce((
      select jsonb_object_agg(gd.game_id, gd.days)
      from (
        select kk.game_id, jsonb_agg(coalesce(c.n, 0) order by d.day) as days
        from (select distinct e.game_id from ev e where e.event = 'game_launch' and e.created_at >= v_since) kk
        cross join (select generate_series(v_from, v_to, interval '1 day')::date as day) d
        left join (
          select e.game_id, (e.created_at at time zone 'Europe/Paris')::date as day, count(*) as n
          from ev e
          where e.event = 'game_launch' and e.created_at >= v_since
          group by 1, 2
        ) c on c.game_id = kk.game_id and c.day = d.day
        group by kk.game_id
      ) gd
    ), '{}'::jsonb),
    'game_hours', coalesce((select jsonb_object_agg(g.game_id, round(g.sec / 3600, 2)) from g where g.sec > 0), '{}'::jsonb),
    'games', coalesce((
      select jsonb_agg(jsonb_build_object(
        'game_id', g.game_id,
        'launches', g.launches, 'launches_7d', g.launches_7d, 'launches_all', g.launches_all,
        'plays', g.plays, 'players', g.players,
        'hours', round(g.sec / 3600, 2), 'hours_7d', round(g.sec_7d / 3600, 2),
        'visits', g.visits,
        'avg_min', case when g.visits > 0 then round(g.sec / 60 / g.visits, 1) else 0 end,
        'errors', g.errors, 'errors_7d', g.errors_7d, 'last_error', g.last_error, 'last_error_at', g.last_error_at,
        'accounts', g.accounts, 'acct_hours', g.acct_hours, 'last_launch', g.last_launch
      ) order by g.launches desc, g.sec desc, g.game_id)
      from g
    ), '[]'::jsonb),
    'play', (
      select jsonb_build_object(
        'hours', round(coalesce(sum(p.sec), 0) / 3600, 2),
        'legacy_hours', round(coalesce(sum(p.sec) filter (where p.visit is null), 0) / 3600, 2),
        'players', count(distinct p.who),
        'visits', (select count(*) from ev e where e.event = 'game_launch' and e.created_at >= v_since),
        'since', v_since
      )
      from p
      where p.at >= v_since
    ),
    'device_split', coalesce((
      select jsonb_agg(jsonb_build_object('device', z.device, 'sessions', z.n) order by z.n desc)
      from (
        select coalesce(a.device, 'unknown') as device, count(distinct a.session_id) as n
        from private.an_ev a
        where a.event = 'session' and a.created_at >= v_since
        group by 1
      ) z
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(to_jsonb(z) order by z.sessions desc)
      from (
        select coalesce(a.device, 'unknown') as device, a.props ->> 'os' as os, a.props ->> 'browser' as browser, count(distinct a.session_id) as sessions
        from private.an_ev a
        where a.event = 'session' and a.created_at >= v_since
        group by 1, 2, 3
        order by 4 desc
        limit 20
      ) z
    ), '[]'::jsonb),
    'overview', (
      select jsonb_build_object(
        'accounts', (select count(*) from auth.users u where u.deleted_at is null and private.an_user_ok(u.id)),
        'active_today', count(distinct w.who) filter (where w.created_at >= v_today),
        'signed_in_today', count(distinct w.user_id) filter (where w.created_at >= v_today),
        'sessions_today', count(distinct w.session_id) filter (where w.created_at >= v_today),
        'active_7d', count(distinct w.who) filter (where w.created_at > v_wk),
        'signed_in_7d', count(distinct w.user_id) filter (where w.created_at > v_wk),
        'active_30d', count(distinct w.who),
        'signed_in_30d', count(distinct w.user_id)
      )
      from admin.events_who w
      where w.created_at > now() - interval '30 days'
    ),
    'players', coalesce((
      select jsonb_agg(to_jsonb(t))
      from (
        select s.user_id, pr.username, pr.display_name, s.game_id, s.plays, s.seconds_played, s.best_score, s.last_played
        from public.game_stats s
        left join public.profiles pr on pr.id = s.user_id
        where private.an_user_ok(s.user_id)
        order by s.seconds_played desc
        limit 300
      ) t
    ), '[]'::jsonb),
    'errors', coalesce((
      select jsonb_agg(to_jsonb(t))
      from (
        select a.created_at, a.game_id, a.props ->> 'where' as place, a.props ->> 'msg' as message, a.device, a.session_id
        from private.an_ev a
        where a.event = 'error' and a.created_at >= v_since
        order by a.created_at desc
        limit 60
      ) t
    ), '[]'::jsonb),
    'searches', coalesce((
      select jsonb_agg(to_jsonb(t))
      from (
        select a.props ->> 'q' as query, count(distinct a.session_id) as searches,
          count(distinct a.session_id) filter (where private.jnum(a.props, 'n') = 0) as with_no_results,
          max(a.created_at) as last_searched
        from private.an_ev a
        where a.event = 'search' and a.created_at >= v_since and coalesce(a.props ->> 'q', '') <> ''
        group by 1
        order by 2 desc, 1
        limit 25
      ) t
    ), '[]'::jsonb),
    'retention', coalesce((select jsonb_agg(to_jsonb(t)) from (select * from admin.retention limit 14) t), '[]'::jsonb),
    'peak_samples', (select count(*) from public.presence_samples x where x.at >= v_since) + (select count(distinct pt.at) from private.presence_ticks pt where pt.at >= v_since),
    'at', now()
  ) into r;
  return r;
end;
$$;

create table if not exists private.live_marks (
  k text primary key,
  n bigint not null default 0,
  at timestamptz not null default now()
);
alter table private.live_marks enable row level security;
revoke all on table private.live_marks from public, anon, authenticated;
insert into private.live_marks (k) values ('users'), ('tickets'), ('log') on conflict (k) do nothing;

create or replace function private.live_mark()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update private.live_marks set n = n + 1, at = now() where k = tg_argv[0];
  return null;
end;
$$;

drop trigger if exists profiles_live_mark on public.profiles;
create trigger profiles_live_mark after insert or delete or update of role, locked, locked_until, locked_reason, username, display_name on public.profiles
  for each statement execute function private.live_mark('users');
drop trigger if exists tickets_live_mark on public.tickets;
create trigger tickets_live_mark after insert or update or delete on public.tickets
  for each statement execute function private.live_mark('tickets');
drop trigger if exists ticket_messages_live_mark on public.ticket_messages;
create trigger ticket_messages_live_mark after insert on public.ticket_messages
  for each statement execute function private.live_mark('tickets');
drop trigger if exists admin_log_live_mark on public.admin_log;
create trigger admin_log_live_mark after insert on public.admin_log
  for each statement execute function private.live_mark('log');
drop trigger if exists user_reports_live_mark on public.user_reports;
create trigger user_reports_live_mark after insert or update on public.user_reports
  for each statement execute function private.live_mark('log');

create table if not exists private.housekeep (
  id integer primary key check (id = 1),
  at timestamptz not null default 'epoch',
  took_ms integer,
  detail jsonb
);
alter table private.housekeep enable row level security;
revoke all on table private.housekeep from public, anon, authenticated;
insert into private.housekeep (id) values (1) on conflict (id) do nothing;
alter table private.housekeep add column if not exists retention boolean not null default false;

create or replace function private.retention_sweep()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_t0 timestamptz := clock_timestamp();
  v_n bigint;
  r jsonb := '{}'::jsonb;
begin
  if not pg_try_advisory_xact_lock(hashtextextended('gameplay:retention', 0)) then
    return null;
  end if;
  update private.housekeep set at = now() where id = 1;
  r := r || jsonb_build_object('retention', coalesce((select h.retention from private.housekeep h where h.id = 1), false));
  if (r ->> 'retention')::boolean then
    delete from public.analytics_events where created_at < now() - interval '400 days';
    get diagnostics v_n = row_count; r := r || jsonb_build_object('analytics_events', v_n);
    delete from private.an_link where k like 's:%' and at < now() - interval '400 days';
    get diagnostics v_n = row_count; r := r || jsonb_build_object('an_link', v_n);
    delete from public.chat_log where created_at < now() - interval '365 days';
    get diagnostics v_n = row_count; r := r || jsonb_build_object('chat_log', v_n);
    delete from private.presence_ticks where at < now() - interval '400 days';
    get diagnostics v_n = row_count; r := r || jsonb_build_object('presence_ticks', v_n);
    delete from public.presence_samples where at < now() - interval '2 years';
    get diagnostics v_n = row_count; r := r || jsonb_build_object('presence_samples', v_n);
  end if;
  delete from private.presence_now where at < now() - interval '10 minutes';
  get diagnostics v_n = row_count; r := r || jsonb_build_object('presence_now', v_n);
  delete from private.rate_hits where at < now() - interval '8 days';
  get diagnostics v_n = row_count; r := r || jsonb_build_object('rate_hits', v_n);
  delete from private.analytics_rate where w < now() - interval '3 hours';
  get diagnostics v_n = row_count; r := r || jsonb_build_object('analytics_rate', v_n);
  if (r ->> 'retention')::boolean then
    delete from public.diag_events where created_at < now() - interval '30 days';
    get diagnostics v_n = row_count; r := r || jsonb_build_object('diag_events', v_n);
  end if;
  delete from private.sync_batches where created_at < now() - interval '60 days';
  get diagnostics v_n = row_count; r := r || jsonb_build_object('sync_batches', v_n);
  delete from private.friend_declines where at < now() - interval '7 days';
  get diagnostics v_n = row_count; r := r || jsonb_build_object('friend_declines', v_n);
  update private.housekeep set took_ms = (extract(epoch from clock_timestamp() - v_t0) * 1000)::integer, detail = r where id = 1;
  return r;
end;
$$;
revoke all on function private.retention_sweep() from public, anon, authenticated;

create or replace function private.retention_tick()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select h.at from private.housekeep h where h.id = 1) < now() - interval '1 day' then
    perform private.retention_sweep();
  end if;
  return null;
end;
$$;

create or replace function private.analytics_ceiling()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_all integer;
  v_anon integer;
  v_n integer;
begin
  select count(*), count(*) filter (where n.user_id is null) into v_all, v_anon from new_rows n;
  if v_all = 0 then
    return null;
  end if;
  insert into private.analytics_rate as r (k, w, n) values ('all', date_trunc('hour', now()), v_all)
    on conflict (k, w) do update set n = r.n + excluded.n
    returning r.n into v_n;
  if v_n > 500000 then
    delete from public.analytics_events e using new_rows n where e.id = n.id;
    return null;
  end if;
  if v_anon > 0 then
    insert into private.analytics_rate as r (k, w, n) values ('all:anon', date_trunc('hour', now()), v_anon)
      on conflict (k, w) do update set n = r.n + excluded.n
      returning r.n into v_n;
    if v_n > 50000 then
      delete from public.analytics_events e using new_rows n where e.id = n.id and n.user_id is null;
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists analytics_ceiling on public.analytics_events;
create trigger analytics_ceiling after insert on public.analytics_events
  referencing new table as new_rows
  for each statement execute function private.analytics_ceiling();

drop trigger if exists analytics_retention on public.analytics_events;
create trigger analytics_retention after insert on public.analytics_events
  for each statement execute function private.retention_tick();
drop trigger if exists presence_ticks_retention on private.presence_ticks;
create trigger presence_ticks_retention after insert on private.presence_ticks
  for each statement execute function private.retention_tick();

create or replace function public.admin_housekeep(p_force boolean default false)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_at timestamptz;
  r jsonb;
begin
  select h.at into v_at from private.housekeep h where h.id = 1;
  if coalesce(p_force, false) or v_at is null or v_at < now() - interval '1 day' then
    r := private.retention_sweep();
  end if;
  return (select jsonb_build_object('ran', r is not null, 'at', h.at, 'took_ms', h.took_ms, 'deleted', coalesce(r, h.detail),
    'cron', exists (select 1 from pg_catalog.pg_extension x where x.extname = 'pg_cron')) from private.housekeep h where h.id = 1);
end;
$$;
revoke all on function public.admin_housekeep(boolean) from public, anon, authenticated;
grant execute on function public.admin_housekeep(boolean) to authenticated;

do $$
begin
  if exists (select 1 from pg_catalog.pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(j.jobid) from cron.job j where j.jobname = 'gameplay-retention';
    perform cron.schedule('gameplay-retention', '17 3 * * *', 'select private.retention_sweep()');
  end if;
exception when others then
  raise notice 'pg_cron job not created: %', sqlerrm;
end;
$$;

create or replace function public.admin_live(p_uid uuid default null, p_staff boolean default false)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_now timestamptz := now();
  v_lvl smallint := case when coalesce(p_staff, false) then 1 else 0 end;
  v_m5 timestamptz := v_now - interval '5 minutes';
  r jsonb;
begin
  select jsonb_build_object(
    't', round(extract(epoch from v_now) * 1000),
    'today', (v_now at time zone 'Europe/Paris')::date,
    'n', (
      select jsonb_build_object('all', count(*), 'shown', count(*) filter (where not n.hidden), 'play', count(*) filter (where n.game is not null), 'party', count(*) filter (where n.party), 'away', count(*) filter (where n.away))
      from private.presence_now n
      where n.at > v_now - interval '100 seconds'
    ),
    'on', coalesce((
      select jsonb_agg(jsonb_build_object('id', x.user_id, 'g', x.game, 'a', x.away::int, 'p', x.party::int, 'h', x.hidden::int, 's', greatest(0, extract(epoch from v_now - x.at))::int, 'l', private.an_level(x.user_id)))
      from (
        select n.user_id, n.game, n.away, n.party, n.hidden, n.at
        from private.presence_now n
        where n.at > v_now - interval '100 seconds'
        order by (n.game is null), n.at desc
        limit 400
      ) x
    ), '[]'::jsonb),
    'ev', jsonb_build_object(
      'm1', (select count(*) from public.analytics_events e where e.created_at > v_now - interval '1 minute' and e.skip <= v_lvl),
      'ses', (select count(distinct e.session_id) from public.analytics_events e where e.created_at > v_now - interval '1 minute' and e.skip <= v_lvl),
      'lau', (select count(*) from public.analytics_events e where e.event = 'game_launch' and e.created_at > v_m5 and e.skip <= v_lvl),
      'err', (select count(*) from public.analytics_events e where e.event = 'error' and e.created_at > v_m5 and e.skip <= v_lvl),
      'rl', (select count(*) from private.rate_hits h where h.at > v_m5 and h.full_hit)
    ),
    'errs', coalesce((
      select jsonb_agg(to_jsonb(x))
      from (
        select e.id, e.created_at as at, e.game_id as g, e.props ->> 'where' as w, left(e.props ->> 'msg', 200) as m, e.device as d, e.user_id as u
        from public.analytics_events e
        where e.event = 'error' and e.created_at > v_now - interval '1 hour' and e.skip <= v_lvl
        order by e.created_at desc
        limit 8
      ) x
    ), '[]'::jsonb),
    'party', coalesce((
      select jsonb_agg(to_jsonb(x))
      from (
        select e.id, e.created_at as at, substr(e.event, 7) as k, e.game_id as g, e.props ->> 'via' as via, e.props ->> 'why' as why, e.user_id as u,
          private.jnum(e.props, 'ms') as ms, private.jnum(e.props, 'players') as pl
        from public.analytics_events e
        where e.event in ('party_create', 'party_join', 'party_retry', 'party_play') and e.created_at > v_now - interval '30 minutes' and e.skip <= v_lvl
        order by e.created_at desc
        limit 10
      ) x
    ), '[]'::jsonb),
    'marks', (select jsonb_object_agg(m.k, m.n) from private.live_marks m),
    'hk', (select h.at < v_now - interval '1 day' from private.housekeep h where h.id = 1),
    'sel', case when p_uid is null then null else (
      select jsonb_build_object('id', p.id, 'seen', p.last_seen, 'game', p.last_game, 'lang', p.last_lang, 'role', p.role,
        'locked', coalesce(p.locked, false) and (p.locked_until is null or p.locked_until > v_now))
      from public.profiles p
      where p.id = p_uid
    ) end
  ) into r;
  return r;
end;
$$;
revoke all on function public.admin_live(uuid, boolean) from public, anon, authenticated;
grant execute on function public.admin_live(uuid, boolean) to authenticated;

create or replace function private.m_activity(p_days integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_to date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_to - (p_days - 1);
  v_since timestamptz := (v_from::timestamp at time zone 'Europe/Paris');
  r jsonb;
begin
  with w as materialized (
    select e.who, e.day, bool_or(e.user_id is not null) as acct
    from admin.events_who e
    where e.created_at >= now() - interval '400 days' and e.who is not null
    group by e.who, e.day
  ), f as materialized (
    select w.who, min(w.day) as first from w group by w.who
  ), ss as materialized (
    select e.session_id, min(e.who) as who,
      greatest(extract(epoch from max(coalesce(e.client_at, e.created_at)) - min(coalesce(e.client_at, e.created_at))), coalesce(max(private.jnum(e.props, 'dur')) filter (where e.event = 'sess_sum'), 0)) as dur,
      count(*) filter (where e.event = 'game_launch') as launches,
      count(*) filter (where e.event = 'view') as views
    from private.an_ev e
    where e.created_at >= v_since
    group by e.session_id
  ), hh as materialized (
    select e.who, (e.created_at at time zone 'Europe/Paris')::date as day, extract(hour from e.created_at at time zone 'Europe/Paris')::int as h
    from private.an_ev e
    where e.created_at >= v_since and e.who is not null
    group by 1, 2, 3
  ), wk as (
    select w.who, date_trunc('week', w.day)::date as wk from w group by 1, 2
  ), fw as (
    select wk.who, min(wk.wk) as first from wk group by wk.who
  )
  select jsonb_build_object(
    'days', p_days, 'today', v_to, 'at', now(),
    'now', jsonb_build_object(
      'today', (select jsonb_build_object('players', count(*), 'accounts', count(*) filter (where w.acct)) from w where w.day = v_to),
      'yesterday', (select jsonb_build_object('players', count(*), 'accounts', count(*) filter (where w.acct)) from w where w.day = v_to - 1),
      'd7', (select jsonb_build_object('players', count(distinct w.who), 'accounts', count(distinct w.who) filter (where w.acct)) from w where w.day > v_to - 7),
      'p7', (select jsonb_build_object('players', count(distinct w.who)) from w where w.day > v_to - 14 and w.day <= v_to - 7),
      'd30', (select jsonb_build_object('players', count(distinct w.who), 'accounts', count(distinct w.who) filter (where w.acct)) from w where w.day > v_to - 30),
      'p30', (select jsonb_build_object('players', count(distinct w.who)) from w where w.day > v_to - 60 and w.day <= v_to - 30)
    ),
    'series', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'active', coalesce(a.n, 0), 'new', coalesce(n.n, 0), 'back', greatest(coalesce(a.n, 0) - coalesce(n.n, 0), 0)) order by d.day)
      from (select generate_series(v_from, v_to, interval '1 day')::date as day) d
      left join (select w.day, count(*) as n from w where w.day >= v_from group by w.day) a on a.day = d.day
      left join (select f.first as day, count(*) as n from f where f.first >= v_from group by f.first) n on n.day = d.day
    ), '[]'::jsonb),
    'split', (
      select jsonb_build_object('players', count(*), 'new', count(*) filter (where f.first >= v_from), 'back', count(*) filter (where f.first < v_from))
      from f
      where exists (select 1 from w where w.who = f.who and w.day >= v_from)
    ),
    'sess', (
      select jsonb_build_object(
        'n', count(*),
        'players', count(distinct ss.who),
        'med', round(percentile_cont(0.5) within group (order by ss.dur)::numeric),
        'p90', round(percentile_cont(0.9) within group (order by ss.dur)::numeric),
        'avg', round(avg(ss.dur)::numeric),
        'played', count(*) filter (where ss.launches > 0),
        'short', count(*) filter (where ss.dur < 10 and ss.launches = 0),
        'b', jsonb_build_array(
          jsonb_build_object('k', 'Under 1 min', 'n', count(*) filter (where ss.dur < 60)),
          jsonb_build_object('k', '1–5 min', 'n', count(*) filter (where ss.dur >= 60 and ss.dur < 300)),
          jsonb_build_object('k', '5–15 min', 'n', count(*) filter (where ss.dur >= 300 and ss.dur < 900)),
          jsonb_build_object('k', '15–30 min', 'n', count(*) filter (where ss.dur >= 900 and ss.dur < 1800)),
          jsonb_build_object('k', '30–60 min', 'n', count(*) filter (where ss.dur >= 1800 and ss.dur < 3600)),
          jsonb_build_object('k', 'Over 1 hour', 'n', count(*) filter (where ss.dur >= 3600))
        )
      )
      from ss
    ),
    'hod', coalesce((
      select jsonb_agg(round(coalesce(t.n, 0)::numeric / p_days, 2) order by g.h)
      from generate_series(0, 23) g(h)
      left join (select hh.h, count(*) as n from hh group by hh.h) t on t.h = g.h
    ), '[]'::jsonb),
    'hours', coalesce((
      select jsonb_agg(jsonb_build_object('d', t.d, 'h', t.h, 'v', t.v))
      from (
        select extract(isodow from hh.day)::int - 1 as d, hh.h, round(count(*)::numeric / greatest(count(distinct hh.day), 1), 2) as v
        from hh
        group by 1, 2
      ) t
    ), '[]'::jsonb),
    'cohorts', coalesce((
      select jsonb_agg(jsonb_build_object('wk', c.wk, 'n', c.n, 'r', c.r) order by c.wk desc)
      from (
        select fw.first as wk, count(*) as n,
          jsonb_build_array(
            case when fw.first + 7 <= v_to then count(*) filter (where exists (select 1 from wk x where x.who = fw.who and x.wk = fw.first + 7)) end,
            case when fw.first + 14 <= v_to then count(*) filter (where exists (select 1 from wk x where x.who = fw.who and x.wk = fw.first + 14)) end,
            case when fw.first + 21 <= v_to then count(*) filter (where exists (select 1 from wk x where x.who = fw.who and x.wk = fw.first + 21)) end,
            case when fw.first + 28 <= v_to then count(*) filter (where exists (select 1 from wk x where x.who = fw.who and x.wk = fw.first + 28)) end
          ) as r
        from fw
        where fw.first >= date_trunc('week', v_to)::date - 56
        group by fw.first
      ) c
    ), '[]'::jsonb)
  ) into r;
  return r;
end;
$$;

create or replace function private.m_usage(p_days integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_to date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_to - (p_days - 1);
  v_since timestamptz := (v_from::timestamp at time zone 'Europe/Paris');
  v_prev timestamptz := v_since - make_interval(days => p_days);
  r jsonb;
begin
  with ev as materialized (
    select e.game_id, e.event, e.who, e.session_id, e.props, e.created_at
    from private.an_ev e
    where e.created_at >= v_prev and e.game_id is not null
      and e.event in ('game_open', 'game_launch', 'game_play', 'game_quit', 'game_time', 'game_active', 'favourite', 'tile_click')
  ), c as (
    select ev.game_id,
      count(*) filter (where ev.event = 'tile_click' and ev.created_at >= v_since) as clicks,
      count(*) filter (where ev.event = 'game_open' and ev.created_at >= v_since) as opens,
      count(*) filter (where ev.event = 'game_launch' and ev.created_at >= v_since) as launches,
      count(*) filter (where ev.event = 'game_launch' and ev.created_at < v_since) as launches_prev,
      count(*) filter (where ev.event = 'game_play' and ev.created_at >= v_since) as plays,
      count(distinct ev.who) filter (where ev.event in ('game_launch', 'game_play') and ev.created_at >= v_since) as players,
      count(distinct ev.who) filter (where ev.event = 'game_play' and ev.created_at >= v_since) as real_players,
      coalesce(sum(private.jnum(ev.props, 'rn')) filter (where ev.event = 'game_time' and ev.created_at >= v_since), 0)
        + coalesce(sum(private.jnum(ev.props, 'rounds')) filter (where ev.event = 'game_quit' and ev.created_at >= v_since and not ev.props ? 'v'), 0) as rounds,
      coalesce(sum(private.jnum(ev.props, 'rec')) filter (where ev.event = 'game_time' and ev.created_at >= v_since), 0) as recs,
      count(*) filter (where ev.event = 'favourite' and ev.created_at >= v_since and private.jbool(ev.props, 'on')) as fav_add,
      count(*) filter (where ev.event = 'favourite' and ev.created_at >= v_since and private.jbool(ev.props, 'on') is false) as fav_del
    from ev
    group by ev.game_id
  ), t as (
    select x.game_id, sum(x.sec) as sec
    from private.play_rows(v_since) x
    group by x.game_id
  ), tp as (
    select x.game_id, sum(x.sec) as sec
    from private.play_rows(v_prev) x
    where x.at < v_since
    group by x.game_id
  ), la as (
    select ev.game_id, ev.session_id, ev.props ->> 'v' as v
    from ev
    where ev.event = 'game_launch' and ev.created_at >= v_since and ev.created_at < now() - interval '3 minutes' and coalesce(ev.props ->> 'v', '') <> ''
  ), av as (
    select ev.session_id, ev.props ->> 'v' as v, max(private.jnum(ev.props, 'sec')) as sec
    from ev
    where ev.event = 'game_active' and ev.created_at >= v_since
    group by 1, 2
  ), pv as (
    select distinct ev.session_id, ev.props ->> 'v' as v
    from ev
    where ev.event = 'game_play' and ev.created_at >= v_since and coalesce(ev.props ->> 'v', '') <> ''
  ), b as (
    select la.game_id, count(*) as n,
      count(*) filter (where coalesce(av.sec, 0) < 10 and pv.v is null) as bounced
    from la
    left join av on av.session_id = la.session_id and av.v = la.v
    left join pv on pv.session_id = la.session_id and pv.v = la.v
    group by la.game_id
  ), fv as (
    select f.game_id, count(*) as n
    from public.favourites f
    where private.an_user_ok(f.user_id)
    group by f.game_id
  ), dd as (
    select kk.game_id, jsonb_agg(coalesce(q.n, 0) order by d.day) as days
    from (select c.game_id from c where c.launches > 0) kk
    cross join (select generate_series(v_from, v_to, interval '1 day')::date as day) d
    left join (
      select ev.game_id, (ev.created_at at time zone 'Europe/Paris')::date as day, count(*) as n
      from ev
      where ev.event = 'game_launch' and ev.created_at >= v_since
      group by 1, 2
    ) q on q.game_id = kk.game_id and q.day = d.day
    group by kk.game_id
  ), k as (
    select c.game_id from c
    union select t.game_id from t
    union select fv.game_id from fv
  )
  select jsonb_build_object(
    'days', p_days, 'today', v_to, 'at', now(),
    'games', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', k.game_id,
        'clicks', coalesce(c.clicks, 0), 'opens', coalesce(c.opens, 0),
        'launches', coalesce(c.launches, 0), 'prev', coalesce(c.launches_prev, 0),
        'plays', coalesce(c.plays, 0), 'players', coalesce(c.players, 0), 'real_players', coalesce(c.real_players, 0),
        'sec', round(coalesce(t.sec, 0)), 'sec_prev', round(coalesce(tp.sec, 0)),
        'bn', coalesce(b.n, 0), 'bounced', coalesce(b.bounced, 0),
        'rounds', coalesce(c.rounds, 0), 'recs', coalesce(c.recs, 0),
        'favs', coalesce(fv.n, 0), 'fav_add', coalesce(c.fav_add, 0), 'fav_del', coalesce(c.fav_del, 0),
        'days', dd.days
      ) order by coalesce(c.launches, 0) desc, coalesce(t.sec, 0) desc, k.game_id)
      from k
      left join c on c.game_id = k.game_id
      left join t on t.game_id = k.game_id
      left join tp on tp.game_id = k.game_id
      left join b on b.game_id = k.game_id
      left join fv on fv.game_id = k.game_id
      left join dd on dd.game_id = k.game_id
    ), '[]'::jsonb),
    'total', (
      select jsonb_build_object(
        'opens', coalesce(sum(c.opens), 0), 'launches', coalesce(sum(c.launches), 0), 'prev', coalesce(sum(c.launches_prev), 0),
        'plays', coalesce(sum(c.plays), 0), 'rounds', coalesce(sum(c.rounds), 0), 'recs', coalesce(sum(c.recs), 0),
        'games', count(*) filter (where c.launches > 0),
        'sec', (select round(coalesce(sum(t.sec), 0)) from t), 'sec_prev', (select round(coalesce(sum(tp.sec), 0)) from tp),
        'bn', (select coalesce(sum(b.n), 0) from b), 'bounced', (select coalesce(sum(b.bounced), 0) from b),
        'favs', (select coalesce(sum(fv.n), 0) from fv)
      )
      from c
    )
  ) into r;
  return r;
end;
$$;

create or replace function private.m_perf(p_days integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_to date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_to - (p_days - 1);
  v_since timestamptz := (v_from::timestamp at time zone 'Europe/Paris');
  r jsonb;
begin
  with vt as materialized (
    select coalesce(e.device, 'unknown') as device, (e.created_at at time zone 'Europe/Paris')::date as day,
      private.jnum(e.props, 'ttfb') as ttfb, private.jnum(e.props, 'fcp') as fcp, private.jnum(e.props, 'lcp') as lcp,
      private.jnum(e.props, 'load') as load, private.jnum(e.props, 'rdy') as rdy, private.jnum(e.props, 'inp') as inp, private.jnum(e.props, 'cls') as cls
    from private.an_ev e
    where e.event = 'vitals' and e.created_at >= v_since
  ), gs as materialized (
    select e.game_id, e.session_id, e.event,
      private.jnum(e.props, 'fps') as fps, private.jnum(e.props, 'fr') as fr, private.jnum(e.props, 'sl') as sl, private.jnum(e.props, 'lf') as lf,
      private.jnum(e.props, 'sec') as sec, e.props ? 'v' as modern
    from private.an_ev e
    where e.created_at >= v_since and e.game_id is not null and e.event in ('game_time', 'game_quit') and private.jnum(e.props, 'fps') > 0
  ), sm as materialized (
    select gs.game_id, gs.session_id,
      sum(gs.fr) as fr, sum(gs.sl) as sl, sum(gs.lf) as lf, sum(gs.fr / gs.fps) as secs
    from gs
    where gs.event = 'game_time' and gs.fr >= 120
    group by gs.game_id, gs.session_id
  ), sq as materialized (
    select gs.game_id, gs.session_id, avg(gs.fps) as fps
    from gs
    where gs.event = 'game_quit' and not gs.modern and gs.sec >= 3
    group by gs.game_id, gs.session_id
  ), su as materialized (
    select sm.game_id, sm.session_id, sm.fr / nullif(sm.secs, 0) as fps, sm.sl / nullif(sm.fr, 0) as slow, sm.fr, sm.sl, sm.lf, sm.secs, true as modern from sm
    union all
    select sq.game_id, sq.session_id, sq.fps, null::numeric, null::numeric, null::numeric, null::numeric, null::numeric, false from sq
  ), sx as materialized (
    select su.*, (su.fps < 30 or coalesce(su.slow, 0) >= 0.2) as bad,
      i.device, i.os, i.browser, dv.gpu
    from su
    left join lateral (
      select s.device, s.props ->> 'os' as os, s.props ->> 'browser' as browser
      from private.an_ev s
      where s.session_id = su.session_id and s.event = 'session'
      limit 1
    ) i on true
    left join lateral (
      select s.props ->> 'gpu' as gpu
      from private.an_ev s
      where s.session_id = su.session_id and s.event = 'env_dev'
      limit 1
    ) dv on true
  ), ld as (
    select e.game_id, count(*) as n,
      round(percentile_cont(0.5) within group (order by private.jnum(e.props, 'ms'))::numeric) as p50,
      round(percentile_cont(0.9) within group (order by private.jnum(e.props, 'ms'))::numeric) as p90
    from private.an_ev e
    where e.event = 'game_launch' and e.created_at >= v_since and e.game_id is not null and private.jbool(e.props, 'lazy') and private.jnum(e.props, 'ms') > 0
    group by e.game_id
  ), gp as (
    select sx.game_id, count(*) as n, count(*) filter (where sx.modern) as nm,
      round((sum(sx.fr) / nullif(sum(sx.secs), 0))::numeric, 1) as fps_m,
      round(avg(sx.fps)::numeric, 1) as fps_a,
      round((100 * sum(sx.sl) / nullif(sum(sx.fr), 0))::numeric, 1) as slow,
      round((60 * sum(sx.lf) / nullif(sum(sx.secs), 0))::numeric, 2) as freezes,
      count(*) filter (where sx.bad) as bad,
      round(percentile_cont(0.1) within group (order by sx.fps)::numeric, 1) as fps_p10
    from sx
    group by sx.game_id
  )
  select jsonb_build_object(
    'days', p_days, 'today', v_to, 'at', now(),
    'page', coalesce((
      select jsonb_agg(to_jsonb(t) order by t.ord, t.n desc)
      from (
        select case when grouping(vt.device) = 1 then 'all' else vt.device end as device, grouping(vt.device) as ord, count(*) as n,
          round(percentile_cont(0.5) within group (order by vt.ttfb)::numeric) as ttfb50, round(percentile_cont(0.75) within group (order by vt.ttfb)::numeric) as ttfb75,
          round(percentile_cont(0.5) within group (order by vt.fcp)::numeric) as fcp50, round(percentile_cont(0.75) within group (order by vt.fcp)::numeric) as fcp75,
          round(percentile_cont(0.5) within group (order by vt.lcp)::numeric) as lcp50, round(percentile_cont(0.75) within group (order by vt.lcp)::numeric) as lcp75,
          round(percentile_cont(0.5) within group (order by vt.load)::numeric) as load50, round(percentile_cont(0.75) within group (order by vt.load)::numeric) as load75,
          round(percentile_cont(0.95) within group (order by vt.load)::numeric) as load95,
          round(percentile_cont(0.5) within group (order by vt.rdy)::numeric) as rdy50, round(percentile_cont(0.75) within group (order by vt.rdy)::numeric) as rdy75,
          round(percentile_cont(0.95) within group (order by vt.rdy)::numeric) as rdy95,
          round(percentile_cont(0.75) within group (order by vt.inp)::numeric) as inp75,
          round(percentile_cont(0.75) within group (order by vt.cls)::numeric, 3) as cls75
        from vt
        group by grouping sets ((vt.device), ())
      ) t
      where t.n > 0
    ), '[]'::jsonb),
    'page_days', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'n', coalesce(t.n, 0), 'load', t.load, 'lcp', t.lcp, 'rdy', t.rdy) order by d.day)
      from (select generate_series(v_from, v_to, interval '1 day')::date as day) d
      left join (
        select vt.day, count(*) as n,
          round(percentile_cont(0.75) within group (order by vt.load)::numeric) as load,
          round(percentile_cont(0.75) within group (order by vt.lcp)::numeric) as lcp,
          round(percentile_cont(0.75) within group (order by vt.rdy)::numeric) as rdy
        from vt
        group by vt.day
      ) t on t.day = d.day
    ), '[]'::jsonb),
    'games', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', coalesce(gp.game_id, ld.game_id),
        'n', coalesce(gp.n, 0), 'nm', coalesce(gp.nm, 0),
        'fps', coalesce(gp.fps_m, gp.fps_a), 'fps_p10', gp.fps_p10, 'slow', gp.slow, 'freezes', gp.freezes, 'bad', coalesce(gp.bad, 0),
        'ln', coalesce(ld.n, 0), 'l50', ld.p50, 'l90', ld.p90
      ) order by coalesce(gp.n, 0) desc, coalesce(ld.n, 0) desc)
      from gp
      full join ld on ld.game_id = gp.game_id
    ), '[]'::jsonb),
    'total', (
      select jsonb_build_object('n', count(*), 'nm', count(*) filter (where sx.modern), 'bad', count(*) filter (where sx.bad),
        'fps', round((sum(sx.fr) / nullif(sum(sx.secs), 0))::numeric, 1),
        'fps_all', round(avg(sx.fps)::numeric, 1),
        'slow', round((100 * sum(sx.sl) / nullif(sum(sx.fr), 0))::numeric, 1))
      from sx
    ),
    'by_device', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n, 'bad', t.bad, 'fps', t.fps) order by t.n desc) from (select coalesce(sx.device, 'unknown') as k, count(*) as n, count(*) filter (where sx.bad) as bad, round(avg(sx.fps)::numeric, 1) as fps from sx group by 1) t), '[]'::jsonb),
    'by_os', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n, 'bad', t.bad, 'fps', t.fps) order by t.n desc) from (select coalesce(sx.os, 'unknown') as k, count(*) as n, count(*) filter (where sx.bad) as bad, round(avg(sx.fps)::numeric, 1) as fps from sx group by 1 order by 2 desc limit 10) t), '[]'::jsonb),
    'by_browser', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n, 'bad', t.bad, 'fps', t.fps) order by t.n desc) from (select coalesce(sx.browser, 'unknown') as k, count(*) as n, count(*) filter (where sx.bad) as bad, round(avg(sx.fps)::numeric, 1) as fps from sx group by 1 order by 2 desc limit 10) t), '[]'::jsonb),
    'by_gpu', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n, 'bad', t.bad, 'fps', t.fps) order by t.bad desc, t.n desc) from (select sx.gpu as k, count(*) as n, count(*) filter (where sx.bad) as bad, round(avg(sx.fps)::numeric, 1) as fps from sx where coalesce(sx.gpu, '') <> '' group by 1 order by 3 desc, 2 desc limit 10) t), '[]'::jsonb)
  ) into r;
  return r;
end;
$$;

create or replace function private.err_sig(p_game text, p_props jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select md5(coalesce(p_game, '') || '|' || coalesce(p_props ->> 'where', '') || '|' || regexp_replace(left(coalesce(p_props ->> 'msg', ''), 160), '[0-9]+', '#', 'g'));
$$;

create or replace function private.m_errors(p_days integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_to date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_to - (p_days - 1);
  v_since timestamptz := (v_from::timestamp at time zone 'Europe/Paris');
  r jsonb;
begin
  with e as materialized (
    select a.id, a.created_at, a.game_id, a.who, a.session_id, a.device, a.props, private.err_sig(a.game_id, a.props) as sig
    from private.an_ev a
    where a.event = 'error' and a.created_at >= v_since
  ), g as (
    select e.sig, max(e.game_id) as game, max(e.props ->> 'where') as place,
      (array_agg(e.props ->> 'msg' order by e.created_at desc))[1] as msg,
      (array_agg(e.props ->> 'src' order by e.created_at desc) filter (where coalesce(e.props ->> 'src', '') <> ''))[1] as src,
      (array_agg(private.jnum(e.props, 'line') order by e.created_at desc) filter (where private.jnum(e.props, 'line') > 0))[1] as line,
      count(*) as n, count(distinct e.who) as users, count(distinct e.session_id) as sessions,
      min(e.created_at) as first, max(e.created_at) as last,
      count(*) filter (where e.created_at > now() - interval '24 hours') as n24,
      count(*) filter (where e.device = 'desktop') as desktop, count(*) filter (where e.device = 'phone') as phone, count(*) filter (where e.device = 'tablet') as tablet
    from e
    group by e.sig
  )
  select jsonb_build_object(
    'days', p_days, 'today', v_to, 'at', now(),
    'n', (select count(*) from e),
    'kinds', (select count(*) from g),
    'users', (select count(distinct e.who) from e),
    'sessions', (select count(distinct e.session_id) from e),
    'sess_all', (select count(distinct a.session_id) from private.an_ev a where a.created_at >= v_since),
    'by_day', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'n', coalesce(t.n, 0), 's', coalesce(t.s, 0)) order by d.day)
      from (select generate_series(v_from, v_to, interval '1 day')::date as day) d
      left join (select (e.created_at at time zone 'Europe/Paris')::date as day, count(*) as n, count(distinct e.session_id) as s from e group by 1) t on t.day = d.day
    ), '[]'::jsonb),
    'by_where', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc) from (select coalesce(nullif(e.props ->> 'where', ''), 'other') as k, count(*) as n from e group by 1) t), '[]'::jsonb),
    'by_game', coalesce((select jsonb_agg(jsonb_build_object('id', t.k, 'n', t.n, 'users', t.u) order by t.n desc) from (select e.game_id as k, count(*) as n, count(distinct e.who) as u from e where e.game_id is not null group by 1 order by 2 desc limit 30) t), '[]'::jsonb),
    'groups', coalesce((
      select jsonb_agg(to_jsonb(t))
      from (select g.* from g order by g.last desc limit 200) t
    ), '[]'::jsonb)
  ) into r;
  return r;
end;
$$;

create or replace function private.m_error(p_days integer, p_sig text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_since timestamptz := now() - make_interval(days => p_days + 1);
  r jsonb;
begin
  with e as materialized (
    select a.id, a.created_at, a.client_at, a.game_id, a.who, a.user_id, a.session_id, a.device, a.props
    from private.an_ev a
    where a.event = 'error' and a.created_at >= v_since and private.err_sig(a.game_id, a.props) = p_sig
  ), x as materialized (
    select e.*, s.props ->> 'os' as os, s.props ->> 'browser' as browser, d.props ->> 'osv' as osv, d.props ->> 'brv' as brv, d.props ->> 'gpu' as gpu
    from (select * from e order by e.created_at desc limit 300) e
    left join lateral (select s.props from private.an_ev s where s.session_id = e.session_id and s.event = 'session' limit 1) s on true
    left join lateral (select d.props from private.an_ev d where d.session_id = e.session_id and d.event = 'env_dev' limit 1) d on true
  )
  select jsonb_build_object(
    'sig', p_sig,
    'n', (select count(*) from e),
    'rows', coalesce((
      select jsonb_agg(jsonb_build_object('id', x.id, 'at', x.created_at, 'game', x.game_id, 'where', x.props ->> 'where', 'msg', x.props ->> 'msg',
        'src', x.props ->> 'src', 'line', private.jnum(x.props, 'line'), 'device', x.device, 'os', coalesce(x.osv, x.os), 'browser', coalesce(x.brv, x.browser), 'gpu', x.gpu,
        'session', x.session_id, 'user', x.user_id, 'username', p.username, 'name', p.display_name) order by x.created_at desc)
      from (select * from x order by x.created_at desc limit 40) x
      left join public.profiles p on p.id = x.user_id
    ), '[]'::jsonb),
    'browsers', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc) from (select coalesce(x.brv, x.browser, 'unknown') as k, count(*) as n from x group by 1 order by 2 desc limit 8) t), '[]'::jsonb),
    'os', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc) from (select coalesce(x.osv, x.os, 'unknown') as k, count(*) as n from x group by 1 order by 2 desc limit 8) t), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc) from (select coalesce(x.device, 'unknown') as k, count(*) as n from x group by 1) t), '[]'::jsonb)
  ) into r;
  return r;
end;
$$;

create or replace function private.m_parties(p_days integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_to date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_to - (p_days - 1);
  v_since timestamptz := (v_from::timestamp at time zone 'Europe/Paris');
  r jsonb;
begin
  with e as materialized (
    select a.id, a.session_id, a.game_id, a.event, coalesce(a.client_at, a.created_at) as t, a.created_at, a.props, a.who,
      (a.created_at at time zone 'Europe/Paris')::date as day
    from private.an_ev a
    where a.created_at >= v_since and a.event in ('party_create', 'party_join', 'party_retry', 'party_play')
  ), x as (
    select e.*, lag(e.event) over w as pe, lag(e.t) over w as pt
    from e
    where e.event in ('party_join', 'party_retry')
    window w as (partition by e.session_id, e.game_id order by e.t, e.id)
  ), y as (
    select x.*, sum(case when x.pe is null or x.pe = 'party_join' or x.t - x.pt > interval '90 seconds' then 1 else 0 end) over (partition by x.session_id, x.game_id order by x.t, x.id) as grp
    from x
  ), a as materialized (
    select y.session_id, y.game_id, y.grp, min(y.day) as day, max(y.created_at) as last_at, min(y.who) as who,
      count(*) filter (where y.event = 'party_retry') as retries,
      bool_or(y.event = 'party_join') as ok,
      max(y.props ->> 'via') filter (where y.event = 'party_join') as via,
      max(private.jnum(y.props, 'ms')) filter (where y.event = 'party_join') as ms,
      extract(epoch from max(y.t) - min(y.t)) as waited,
      (array_agg(y.props ->> 'why' order by y.t desc) filter (where y.event = 'party_retry'))[1] as why
    from y
    group by y.session_id, y.game_id, y.grp
  ), d as materialized (
    select a.*, (not a.ok and a.last_at < now() - interval '2 minutes') as failed
    from a
    where a.ok or a.last_at < now() - interval '2 minutes'
  )
  select jsonb_build_object(
    'days', p_days, 'today', v_to, 'at', now(),
    'creates', (select count(*) from e where e.event = 'party_create'),
    'hosts', (select count(distinct e.who) from e where e.event = 'party_create'),
    'plays', (select count(*) from e where e.event = 'party_play'),
    'play_players', (select round(avg(private.jnum(e.props, 'players')), 1) from e where e.event = 'party_play'),
    'retries', (select count(*) from e where e.event = 'party_retry'),
    'attempts', (select count(*) from d),
    'joined', (select count(*) from d where d.ok),
    'failed', (select count(*) from d where d.failed),
    'first_try', (select count(*) from d where d.ok and d.retries = 0),
    'guests', (select count(distinct d.who) from d where d.ok),
    'routes', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc) from (select coalesce(nullif(d.via, ''), 'unknown') as k, count(*) as n from d where d.ok group by 1) t), '[]'::jsonb),
    'why', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc) from (select coalesce(nullif(e.props ->> 'why', ''), 'unknown') as k, count(*) as n from e where e.event = 'party_retry' group by 1) t), '[]'::jsonb),
    'fail_why', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc) from (select coalesce(nullif(d.why, ''), 'unknown') as k, count(*) as n from d where d.failed group by 1) t), '[]'::jsonb),
    'ms', (select jsonb_build_object('n', count(*), 'p50', round(percentile_cont(0.5) within group (order by d.ms)::numeric), 'p90', round(percentile_cont(0.9) within group (order by d.ms)::numeric)) from d where d.ok and d.ms > 0),
    'ms_route', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n, 'p50', t.p50) order by t.n desc) from (select coalesce(nullif(d.via, ''), 'unknown') as k, count(*) as n, round(percentile_cont(0.5) within group (order by d.ms)::numeric) as p50 from d where d.ok and d.ms > 0 group by 1) t), '[]'::jsonb),
    'waited', (select jsonb_build_object('n', count(*), 'p50', round(percentile_cont(0.5) within group (order by d.waited)::numeric, 1)) from d where d.ok and d.retries > 0),
    'by_day', coalesce((
      select jsonb_agg(jsonb_build_object('day', g.day, 'creates', coalesce(c.creates, 0), 'plays', coalesce(c.plays, 0), 'attempts', coalesce(j.attempts, 0), 'joined', coalesce(j.joined, 0), 'failed', coalesce(j.failed, 0), 'relay', coalesce(j.relay, 0),
        'rate', case when coalesce(j.attempts, 0) > 0 then round(100.0 * j.joined / j.attempts, 1) end) order by g.day)
      from (select generate_series(v_from, v_to, interval '1 day')::date as day) g
      left join (select e.day, count(*) filter (where e.event = 'party_create') as creates, count(*) filter (where e.event = 'party_play') as plays from e group by e.day) c on c.day = g.day
      left join (select d.day, count(*) as attempts, count(*) filter (where d.ok) as joined, count(*) filter (where d.failed) as failed, count(*) filter (where d.ok and d.via = 'rt-relay') as relay from d group by d.day) j on j.day = g.day
    ), '[]'::jsonb),
    'by_game', coalesce((
      select jsonb_agg(to_jsonb(t) order by t.creates + t.attempts desc, t.id)
      from (
        select k.game_id as id, coalesce(c.creates, 0) as creates, coalesce(c.plays, 0) as plays, coalesce(j.attempts, 0) as attempts, coalesce(j.joined, 0) as joined,
          coalesce(j.failed, 0) as failed, coalesce(j.retried, 0) as retried, coalesce(j.relay, 0) as relay, coalesce(j.p2p, 0) as p2p, coalesce(j.peerjs, 0) as peerjs, j.ms50
        from (select distinct e.game_id from e where e.game_id is not null) k
        left join (select e.game_id, count(*) filter (where e.event = 'party_create') as creates, count(*) filter (where e.event = 'party_play') as plays from e group by e.game_id) c on c.game_id = k.game_id
        left join (
          select d.game_id, count(*) as attempts, count(*) filter (where d.ok) as joined, count(*) filter (where d.failed) as failed, count(*) filter (where d.ok and d.retries > 0) as retried,
            count(*) filter (where d.ok and d.via = 'rt-relay') as relay, count(*) filter (where d.ok and d.via = 'rt-p2p') as p2p, count(*) filter (where d.ok and d.via = 'peerjs') as peerjs,
            round((percentile_cont(0.5) within group (order by d.ms) filter (where d.ok and d.ms > 0))::numeric) as ms50
          from d
          group by d.game_id
        ) j on j.game_id = k.game_id
      ) t
    ), '[]'::jsonb)
  ) into r;
  return r;
end;
$$;

create or replace function private.m_health(p_days integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_to date := (now() at time zone 'Europe/Paris')::date;
  v_from date := v_to - (p_days - 1);
  v_since timestamptz := (v_from::timestamp at time zone 'Europe/Paris');
  r jsonb;
begin
  with s as materialized (
    select e.session_id, (min(e.created_at) at time zone 'Europe/Paris')::date as day,
      (array_agg(e.props ->> 'route' order by e.created_at desc) filter (where coalesce(e.props ->> 'route', '') <> ''))[1] as route,
      bool_or(e.props ->> 'route' = 'relay') as relayed,
      coalesce(sum(private.jnum(e.props, 'rq')), 0) as rq, coalesce(sum(private.jnum(e.props, 'rqf')), 0) as rqf,
      coalesce(sum(private.jnum(e.props, 'rq5')), 0) as rq5, coalesce(sum(private.jnum(e.props, 'rq4')), 0) as rq4,
      coalesce(sum(private.jnum(e.props, 'rql')), 0) as rql, coalesce(sum(private.jnum(e.props, 'rqt')), 0) as rqt,
      coalesce(max(private.jnum(e.props, 'off')), 0) as off,
      bool_or(e.props ? 'rq') as measured
    from private.an_ev e
    where e.event = 'sess_sum' and e.created_at >= v_since
    group by e.session_id
  ), h as materialized (
    select x.action, x.uid, x.ip, x.full_hit, (x.at at time zone 'Europe/Paris')::date as day
    from private.rate_hits x
    where x.at >= greatest(v_since, now() - interval '8 days')
  )
  select jsonb_build_object(
    'days', p_days, 'today', v_to, 'at', now(),
    'routes', coalesce((select jsonb_agg(jsonb_build_object('k', t.k, 'n', t.n) order by t.n desc) from (select coalesce(s.route, 'unknown') as k, count(*) as n from s where s.route is not null group by 1) t), '[]'::jsonb),
    'req', (
      select jsonb_build_object('sessions', count(*) filter (where s.measured), 'n', sum(s.rq), 'failed', sum(s.rqf), 's5', sum(s.rq5), 's4', sum(s.rq4), 'limited', sum(s.rql),
        'ms', case when sum(s.rq) > 0 then round(sum(s.rqt) / sum(s.rq)) end,
        'hit', count(*) filter (where s.rqf + s.rq5 > 0),
        'offline', count(*) filter (where s.off > 0), 'all', count(*))
      from s
    ),
    'by_day', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'direct', coalesce(t.direct, 0), 'relay', coalesce(t.relay, 0), 'none', coalesce(t.none, 0),
        'rq', coalesce(t.rq, 0), 'bad', coalesce(t.bad, 0), 'rate', case when coalesce(t.rq, 0) > 0 then round(100.0 * t.bad / t.rq, 2) end,
        'hits', coalesce(l.hits, 0), 'limited', coalesce(l.full_hits, 0), 'game_fail', coalesce(g.n, 0)) order by d.day)
      from (select generate_series(v_from, v_to, interval '1 day')::date as day) d
      left join (
        select s.day, count(*) filter (where s.route = 'direct') as direct, count(*) filter (where s.route = 'relay') as relay, count(*) filter (where s.route = 'none') as none,
          sum(s.rq) as rq, sum(s.rqf + s.rq5) as bad
        from s
        group by s.day
      ) t on t.day = d.day
      left join (select h.day, count(*) as hits, count(*) filter (where h.full_hit) as full_hits from h group by h.day) l on l.day = d.day
      left join (
        select (e.created_at at time zone 'Europe/Paris')::date as day, count(*) as n
        from private.an_ev e
        where e.event = 'error' and e.created_at >= v_since and e.props ->> 'where' = 'load'
        group by 1
      ) g on g.day = d.day
    ), '[]'::jsonb),
    'limits', coalesce((
      select jsonb_agg(jsonb_build_object('k', t.action, 'n', t.n, 'full', t.full_hits, 'who', t.who) order by t.full_hits desc, t.n desc)
      from (
        select h.action, count(*) as n, count(*) filter (where h.full_hit) as full_hits, count(distinct coalesce(h.uid::text, h.ip)) filter (where h.full_hit) as who
        from h
        group by h.action
        order by 3 desc, 2 desc
        limit 15
      ) t
    ), '[]'::jsonb),
    'limit_total', (select jsonb_build_object('n', count(*), 'full', count(*) filter (where h.full_hit), 'who', count(distinct coalesce(h.uid::text, h.ip)) filter (where h.full_hit), 'days', least(p_days, 8)) from h),
    'down', private.ins_share('env_caps', 'down', v_since),
    'game_fail', (select count(*) from private.an_ev e where e.event = 'error' and e.created_at >= v_since and e.props ->> 'where' = 'load'),
    'events', (select jsonb_build_object('n', count(*), 'sessions', count(distinct e.session_id)) from private.an_ev e where e.created_at >= v_since),
    'sweep', (select jsonb_build_object('at', k.at, 'took_ms', k.took_ms, 'deleted', k.detail, 'cron', exists (select 1 from pg_catalog.pg_extension x where x.extname = 'pg_cron')) from private.housekeep k where k.id = 1),
    'excluded', (select jsonb_build_object('test', count(*) filter (where a.skip = 2), 'staff', count(*) filter (where a.skip = 1), 'all', count(*)) from public.analytics_events a where a.created_at >= v_since)
  ) into r;
  return r;
end;
$$;

create or replace function public.admin_data(p_what text, p_days integer default 30, p_staff boolean default false, p_arg text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_days integer := greatest(1, least(coalesce(p_days, 30), 366));
begin
  perform set_config('gp.an_lvl', case when coalesce(p_staff, false) then '1' else '0' end, true);
  return case p_what
    when 'stats' then public.admin_stats_v2(v_days)
    when 'insights' then jsonb_build_object('d', public.admin_insights(v_days), 'm', public.admin_insights_more(v_days), 'p', public.admin_play_insights(v_days))
    when 'activity' then private.m_activity(v_days)
    when 'usage' then private.m_usage(v_days)
    when 'perf' then private.m_perf(v_days)
    when 'errors' then private.m_errors(v_days)
    when 'error' then private.m_error(v_days, p_arg)
    when 'parties' then private.m_parties(v_days)
    when 'health' then private.m_health(v_days)
    else null
  end;
end;
$$;

revoke all on function private.m_activity(integer) from public, anon, authenticated;
revoke all on function private.m_usage(integer) from public, anon, authenticated;
revoke all on function private.m_perf(integer) from public, anon, authenticated;
revoke all on function private.m_errors(integer) from public, anon, authenticated;
revoke all on function private.m_error(integer, text) from public, anon, authenticated;
revoke all on function private.m_parties(integer) from public, anon, authenticated;
revoke all on function private.m_health(integer) from public, anon, authenticated;
revoke all on function private.err_sig(text, jsonb) from public, anon, authenticated;
revoke all on function public.admin_data(text, integer, boolean, text) from public, anon, authenticated;
grant execute on function public.admin_data(text, integer, boolean, text) to authenticated;

create or replace function public.admin_diag_info(p_uid uuid, p_sid text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return (
    select jsonb_build_object(
      'n', coalesce(sum(t.n), 0), 'first', min(t.first), 'last', max(t.last), 'max_seq', max(t.mx),
      'kinds', coalesce(jsonb_object_agg(t.kind, t.n) filter (where t.kind is not null), '{}'::jsonb),
      'bad', (select count(*) from public.diag_events d where d.user_id = p_uid and d.sid = p_sid and private.diag_bad(d.kind, d.data)),
      'boot', (select d.data from public.diag_events d where d.user_id = p_uid and d.sid = p_sid and d.kind = 'boot' order by d.seq limit 1)
    )
    from (
      select d.kind, count(*) as n, min(d.at) as first, max(d.at) as last, max(d.seq) as mx
      from public.diag_events d
      where d.user_id = p_uid and d.sid = p_sid
      group by d.kind
    ) t
  );
end;
$$;

create or replace function private.diag_bad(p_kind text, p_data jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case p_kind
    when 'err' then true
    when 'log' then p_data ->> 'l' in ('error', 'warn')
    when 'res' then p_data ? 'e' or (case when (p_data ->> 's') ~ '^[0-9]{1,3}$' then (p_data ->> 's')::integer else 0 end) >= 400
    when 'ws' then p_data ->> 'a' = 'error' or (p_data ->> 'a' = 'close' and p_data ->> 'clean' = 'false')
    when 'pc' then p_data ->> 's' in ('failed', 'disconnected') or p_data ->> 'a' = 'canderr'
    when 'dc' then p_data ->> 'a' = 'error'
    when 'life' then p_data ->> 'a' = 'offline'
    when 'net' then p_data ->> 'a' ~ '(fail|lost|error|timeout)'
    else false
  end;
$$;

create or replace function public.admin_diag_page(p_uid uuid, p_sid text, p_after integer default 0, p_before integer default null, p_limit integer default 200, p_kinds text[] default null, p_q text default null, p_bad boolean default false)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_n integer := least(greatest(coalesce(p_limit, 200), 1), 2000);
  v_q text := nullif(btrim(coalesce(p_q, '')), '');
  v_like text;
  r jsonb;
begin
  if v_q is not null then
    v_like := '%' || replace(replace(replace(left(v_q, 80), '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;
  with m as materialized (
    select d.seq, d.at, d.kind, d.data
    from public.diag_events d
    where d.user_id = p_uid and d.sid = p_sid
      and (p_kinds is null or d.kind = any (p_kinds))
      and (not coalesce(p_bad, false) or private.diag_bad(d.kind, d.data))
      and (v_like is null or d.kind ilike v_like or d.data::text ilike v_like)
  ), pg as (
    select * from (
      select m.* from m where p_before is not null and m.seq < p_before order by m.seq desc limit v_n
    ) a
    union all
    select * from (
      select m.* from m where p_before is null and m.seq > coalesce(p_after, 0) order by m.seq limit v_n
    ) b
  )
  select jsonb_build_object(
    'total', (select count(*) from m),
    'rows', coalesce((select jsonb_agg(jsonb_build_array(pg.seq, round(extract(epoch from pg.at) * 1000), pg.kind, pg.data) order by pg.seq) from pg), '[]'::jsonb),
    'lo', (select min(pg.seq) from pg),
    'hi', (select max(pg.seq) from pg),
    'before', (select count(*) from m where m.seq < (select min(pg.seq) from pg)),
    'after', (select count(*) from m where m.seq > (select max(pg.seq) from pg))
  ) into r;
  return r;
end;
$$;

revoke all on function private.diag_bad(text, jsonb) from public, anon, authenticated;
revoke all on function public.admin_diag_info(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_diag_page(uuid, text, integer, integer, integer, text[], text, boolean) from public, anon, authenticated;
grant execute on function public.admin_diag_info(uuid, text) to authenticated;
grant execute on function public.admin_diag_page(uuid, text, integer, integer, integer, text[], text, boolean) to authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
notify pgrst, 'reload schema';

-- ============================================================================
-- 2026-11-13 Relay secret and trusted client address (Part 10.2)
-- ============================================================================
create table if not exists private.relay_key (
  id integer primary key check (id = 1),
  key_hash text not null,
  at timestamptz not null default now()
);
alter table private.relay_key enable row level security;
revoke all on table private.relay_key from public, anon, authenticated;

create table if not exists private.ip_salt (
  id integer primary key check (id = 1),
  salt text not null
);
alter table private.ip_salt enable row level security;
revoke all on table private.ip_salt from public, anon, authenticated;
insert into private.ip_salt (id, salt) values (1, encode(extensions.gen_random_bytes(24), 'hex')) on conflict (id) do nothing;

create or replace function private.set_relay_key(p_key text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if p_key is null or length(p_key) < 32 then
    raise exception 'The relay key must have at least 32 characters' using errcode = '22023';
  end if;
  insert into private.relay_key (id, key_hash) values (1, encode(extensions.digest(p_key, 'sha256'), 'hex'))
    on conflict (id) do update set key_hash = excluded.key_hash, at = now();
end;
$$;
revoke all on function private.set_relay_key(text) from public, anon, authenticated;

create or replace function private.req_headers()
returns json
language plpgsql
stable
set search_path = ''
as $$
begin
  return nullif(current_setting('request.headers', true), '')::json;
exception when others then
  return null;
end;
$$;
revoke all on function private.req_headers() from public, anon, authenticated;

create or replace function private.relay_ok(p_h json)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(p_h ->> 'x-gp-relay', '') <> ''
    and exists (select 1 from private.relay_key k where k.id = 1 and k.key_hash = encode(extensions.digest(p_h ->> 'x-gp-relay', 'sha256'), 'hex'));
$$;
revoke all on function private.relay_ok(json) from public, anon, authenticated;

create or replace function private.client_ip()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_h json := private.req_headers();
  v_cf text;
  v_xf text;
begin
  if v_h is null then
    return '';
  end if;
  v_cf := btrim(coalesce(v_h ->> 'cf-connecting-ip', ''));
  v_xf := btrim(split_part(coalesce(v_h ->> 'x-forwarded-for', ''), ',', 1));
  if private.relay_ok(v_h) then
    return left(coalesce(nullif(btrim(coalesce(v_h ->> 'x-gp-ip', '')), ''), nullif(v_xf, ''), v_cf), 64);
  end if;
  if v_cf like '2a06:98c0:3600:%' and not exists (select 1 from private.relay_key) then
    return left(coalesce(nullif(v_xf, ''), v_cf), 64);
  end if;
  if v_cf <> '' then
    return left(v_cf, 64);
  end if;
  return left(v_xf, 64);
end;
$$;
revoke all on function private.client_ip() from public, anon, authenticated;

create or replace function private.client_country()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_h json := private.req_headers();
  v_c text;
begin
  if v_h is null then
    return null;
  end if;
  v_c := upper(btrim(coalesce(case when private.relay_ok(v_h) then v_h ->> 'x-gp-country' end, v_h ->> 'cf-ipcountry', '')));
  return case when v_c ~ '^[A-Z]{2}$' and v_c not in ('XX', 'T1') then v_c end;
end;
$$;
revoke all on function private.client_country() from public, anon, authenticated;

create or replace function private.ip_hash(p_ip text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case when coalesce(p_ip, '') = '' then null else encode(extensions.digest((select s.salt from private.ip_salt s where s.id = 1) || '|' || p_ip, 'sha256'), 'hex') end;
$$;
revoke all on function private.ip_hash(text) from public, anon, authenticated;

create or replace function private.rate_key(p_action text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p_action || ':' || coalesce(auth.uid()::text, 'ip:' || coalesce(private.ip_hash(private.client_ip()), ''));
$$;
revoke all on function private.rate_key(text) from public, anon, authenticated;

create or replace function private.rate_ok(p_action text, p_max integer, p_window interval, p_key text default null)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_k text := coalesce(p_key, private.rate_key(p_action));
  v_max integer := private.rate_scale(p_action, p_max);
  v_n integer;
  v_ip text := nullif(private.client_ip(), '');
begin
  if auth.uid() is not null and not private.rate_sensitive(p_action) and private.is_staff(auth.uid()) then
    return true;
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_k, 0));
  select count(*) into v_n from private.rate_hits h where h.k = v_k and h.at > now() - p_window;
  if v_n >= v_max then
    return false;
  end if;
  insert into private.rate_hits (k, action, uid, ip, full_hit) values (v_k, p_action, auth.uid(), private.ip_hash(v_ip), v_max > 1 and v_n + 1 >= v_max);
  if random() < 0.005 then
    delete from private.rate_hits where at < now() - interval '8 days';
  end if;
  return true;
end;
$$;
revoke all on function private.rate_ok(text, integer, interval, text) from public, anon, authenticated;

-- ============================================================================
-- 2026-11-13 Party registry and private realtime channels (Part 10.1, 17.1.3)
-- ============================================================================

-- ============================================================================
-- 2026-11-13 Sign-in and account security (Part 10.3 to 10.7)
-- ============================================================================

-- ============================================================================
-- 2026-11-13 Online players per second and all-time peaks (Part 17.1.4)
-- ============================================================================
create table if not exists private.online_sec (
  at timestamptz primary key,
  n integer not null default 0,
  g jsonb not null default '{}'::jsonb
);
create table if not exists private.online_min (
  at timestamptz primary key,
  n integer not null default 0,
  g jsonb not null default '{}'::jsonb
);
create table if not exists private.online_day (
  day date primary key,
  n integer not null default 0,
  at timestamptz not null,
  g jsonb not null default '{}'::jsonb
);
create table if not exists private.online_peak (
  scope text primary key,
  n integer not null,
  at timestamptz not null
);
alter table private.online_sec enable row level security;
alter table private.online_min enable row level security;
alter table private.online_day enable row level security;
alter table private.online_peak enable row level security;
revoke all on table private.online_sec, private.online_min, private.online_day, private.online_peak from public, anon, authenticated;

create or replace function private.online_gmax(p_a jsonb, p_b jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(jsonb_object_agg(k, greatest(coalesce((p_a ->> k)::integer, 0), coalesce((p_b ->> k)::integer, 0))), '{}'::jsonb)
  from (select jsonb_object_keys(coalesce(p_a, '{}'::jsonb)) as k union select jsonb_object_keys(coalesce(p_b, '{}'::jsonb))) x;
$$;

create or replace function private.online_dmax(p_old jsonb, p_g jsonb, p_at timestamptz)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(jsonb_object_agg(k, case
      when coalesce((p_g ->> k)::integer, 0) > coalesce((p_old -> k ->> 'n')::integer, 0) then jsonb_build_object('n', (p_g ->> k)::integer, 'at', p_at)
      else p_old -> k end), '{}'::jsonb)
  from (select jsonb_object_keys(coalesce(p_old, '{}'::jsonb)) as k union select jsonb_object_keys(coalesce(p_g, '{}'::jsonb))) x;
$$;

create or replace function private.online_tick()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_s timestamptz := date_trunc('second', now());
  v_day date := (now() at time zone 'Europe/Paris')::date;
  v_n integer;
  v_g jsonb;
  v_k text;
  v_v integer;
begin
  insert into private.online_sec (at) values (v_s) on conflict (at) do nothing;
  if not found then
    return;
  end if;
  select count(*) into v_n from private.presence_now x where x.at > now() - interval '100 seconds';
  select coalesce(jsonb_object_agg(y.game, y.c), '{}'::jsonb) into v_g
  from (select x.game, count(*)::integer as c from private.presence_now x where x.at > now() - interval '100 seconds' and x.game is not null group by x.game) y;
  update private.online_sec set n = v_n, g = v_g where at = v_s;
  insert into private.online_min as m (at, n, g) values (date_trunc('minute', v_s), v_n, v_g)
    on conflict (at) do update set n = greatest(m.n, excluded.n), g = private.online_gmax(m.g, excluded.g);
  insert into private.online_day as d (day, n, at, g) values (v_day, v_n, v_s, private.online_dmax('{}'::jsonb, v_g, v_s))
    on conflict (day) do update set
      at = case when excluded.n > d.n then excluded.at else d.at end,
      n = greatest(d.n, excluded.n),
      g = private.online_dmax(d.g, v_g, v_s);
  insert into private.online_peak as p (scope, n, at) values ('site', v_n, v_s)
    on conflict (scope) do update set n = excluded.n, at = excluded.at where excluded.n > p.n;
  for v_k, v_v in select key, value::integer from jsonb_each_text(v_g) loop
    insert into private.online_peak as p (scope, n, at) values ('g:' || v_k, v_v, v_s)
      on conflict (scope) do update set n = excluded.n, at = excluded.at where excluded.n > p.n;
  end loop;
  insert into public.presence_samples as ps (at, online) values (to_timestamp(floor(extract(epoch from v_s) / 300) * 300), v_n)
    on conflict (at) do update set online = greatest(ps.online, excluded.online);
  if extract(second from v_s) < 1 and extract(minute from v_s)::integer % 10 = 0 then
    delete from private.online_sec where at < now() - interval '48 hours';
    delete from private.online_min where at < now() - interval '90 days';
  end if;
end;
$$;
revoke all on function private.online_tick() from public, anon, authenticated;
revoke all on function private.online_gmax(jsonb, jsonb) from public, anon, authenticated;
revoke all on function private.online_dmax(jsonb, jsonb, timestamptz) from public, anon, authenticated;

create or replace function private.online_beat()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.online_tick();
  return null;
end;
$$;
revoke all on function private.online_beat() from public, anon, authenticated;
drop trigger if exists online_beat on private.presence_now;
create trigger online_beat after insert or update on private.presence_now
  for each statement execute function private.online_beat();

do $$
begin
  begin
    create extension if not exists pg_cron;
  exception when others then
    raise notice 'pg_cron is not available here (%); online players are recorded on each heartbeat only', sqlerrm;
  end;
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('gp_online_tick', '1 seconds', 'select private.online_tick()');
    perform cron.schedule('gp_cron_log_cleanup', '17 3 * * *', 'delete from cron.job_run_details where end_time < now() - interval ''1 day''');
  end if;
exception when others then
  raise notice 'could not schedule the online players job: %', sqlerrm;
end;
$$;

create or replace function public.admin_online(p_scope text default null, p_range text default '1h')
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_g text := nullif(lower(btrim(coalesce(p_scope, ''))), '');
  v_now timestamptz := now();
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_series jsonb;
  v_at timestamptz;
  v_n integer;
begin
  if v_g is not null and v_g !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
    raise exception 'Unknown game' using errcode = '22023';
  end if;
  select s.at, case when v_g is null then s.n else coalesce((s.g ->> v_g)::integer, 0) end into v_at, v_n
  from private.online_sec s where s.at > v_now - interval '10 seconds' order by s.at desc limit 1;
  if p_range in ('1m', '1h') then
    select coalesce(jsonb_agg(jsonb_build_array(extract(epoch from x.at)::bigint, x.n) order by x.at), '[]'::jsonb) into v_series
    from (select s.at, case when v_g is null then s.n else coalesce((s.g ->> v_g)::integer, 0) end as n from private.online_sec s
          where s.at > v_now - case when p_range = '1m' then interval '1 minute' else interval '1 hour' end) x;
  elsif p_range = '48h' then
    select coalesce(jsonb_agg(jsonb_build_array(extract(epoch from x.at)::bigint, x.n) order by x.at), '[]'::jsonb) into v_series
    from (select m.at, case when v_g is null then m.n else coalesce((m.g ->> v_g)::integer, 0) end as n from private.online_min m where m.at > v_now - interval '48 hours') x;
  elsif p_range = '90d' then
    select coalesce(jsonb_agg(jsonb_build_array(extract(epoch from x.h)::bigint, x.n) order by x.h), '[]'::jsonb) into v_series
    from (select date_trunc('hour', m.at) as h, max(case when v_g is null then m.n else coalesce((m.g ->> v_g)::integer, 0) end) as n
          from private.online_min m where m.at > v_now - interval '90 days' group by 1) x;
  elsif p_range = 'all' then
    select coalesce(jsonb_agg(jsonb_build_array(d.day, case when v_g is null then d.n else coalesce((d.g -> v_g ->> 'n')::integer, 0) end) order by d.day), '[]'::jsonb) into v_series
    from private.online_day d;
  else
    raise exception 'Unknown range' using errcode = '22023';
  end if;
  return jsonb_build_object(
    'now', coalesce(v_n, 0),
    'at', v_at,
    'peak', (select jsonb_build_object('n', p.n, 'at', p.at) from private.online_peak p where p.scope = coalesce('g:' || v_g, 'site')),
    'today', (select case when v_g is null then jsonb_build_object('n', d.n, 'at', d.at) else d.g -> v_g end from private.online_day d where d.day = v_today),
    'series', v_series,
    'games', coalesce((select s.g from private.online_sec s where s.at > v_now - interval '10 seconds' order by s.at desc limit 1), '{}'::jsonb),
    'cron', exists (select 1 from pg_extension where extname = 'pg_cron')
  );
end;
$$;
revoke all on function public.admin_online(text, text) from public, anon, authenticated;
grant execute on function public.admin_online(text, text) to authenticated;

-- ============================================================================
-- 2026-11-13 IP bans (Part 17.2)
-- ============================================================================
create table if not exists private.ip_seen (
  ip inet not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  primary key (ip, user_id)
);
create index if not exists ip_seen_user_idx on private.ip_seen (user_id, last_at desc);
create index if not exists ip_seen_last_idx on private.ip_seen (last_at);
create table if not exists private.device_seen (
  dk text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  primary key (dk, user_id)
);
create index if not exists device_seen_user_idx on private.device_seen (user_id, last_at desc);
create index if not exists device_seen_last_idx on private.device_seen (last_at);
create table if not exists private.ip_bans (
  id bigint generated always as identity primary key,
  net cidr not null,
  until timestamptz,
  reason text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  lifted_at timestamptz,
  lifted_by uuid references auth.users (id) on delete set null
);
create index if not exists ip_bans_net_idx on private.ip_bans using gist (net inet_ops);
create table if not exists private.device_bans (
  id bigint generated always as identity primary key,
  dk text not null,
  user_id uuid references auth.users (id) on delete set null,
  until timestamptz,
  reason text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  lifted_at timestamptz,
  lifted_by uuid references auth.users (id) on delete set null
);
create index if not exists device_bans_dk_idx on private.device_bans (dk) where lifted_at is null;
alter table private.ip_seen enable row level security;
alter table private.device_seen enable row level security;
alter table private.ip_bans enable row level security;
alter table private.device_bans enable row level security;
revoke all on table private.ip_seen, private.device_seen, private.ip_bans, private.device_bans from public, anon, authenticated;

create or replace function private.to_inet(p text)
returns inet
language plpgsql
immutable
set search_path = ''
as $$
begin
  if coalesce(p, '') = '' then
    return null;
  end if;
  return p::inet;
exception when others then
  return null;
end;
$$;

create or replace function private.to_net(p text)
returns cidr
language plpgsql
immutable
set search_path = ''
as $$
declare
  v cidr;
begin
  v := btrim(coalesce(p, ''))::cidr;
  if (family(v) = 4 and masklen(v) < 16) or (family(v) = 6 and masklen(v) < 32) then
    return null;
  end if;
  return v;
exception when others then
  return null;
end;
$$;

create or replace function private.client_dk()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_k text := btrim(coalesce(private.req_headers() ->> 'x-gp-device', ''));
begin
  if v_k !~ '^[A-Za-z0-9_-]{16,64}$' then
    return null;
  end if;
  return encode(extensions.digest('gp-device|' || v_k, 'sha256'), 'hex');
end;
$$;
revoke all on function private.client_dk() from public, anon, authenticated;
revoke all on function private.to_inet(text) from public, anon, authenticated;
revoke all on function private.to_net(text) from public, anon, authenticated;

create or replace function private.seen_record()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ip inet := private.to_inet(private.client_ip());
  v_dk text := private.client_dk();
begin
  if v_ip is not null then
    insert into private.ip_seen as s (ip, user_id) values (v_ip, new.user_id)
      on conflict (ip, user_id) do update set last_at = now() where s.last_at < now() - interval '5 minutes';
  end if;
  if v_dk is not null then
    insert into private.device_seen as s (dk, user_id) values (v_dk, new.user_id)
      on conflict (dk, user_id) do update set last_at = now() where s.last_at < now() - interval '5 minutes';
  end if;
  if random() < 0.001 then
    delete from private.ip_seen where last_at < now() - interval '30 days';
    delete from private.device_seen where last_at < now() - interval '30 days';
  end if;
  return null;
end;
$$;
revoke all on function private.seen_record() from public, anon, authenticated;
drop trigger if exists seen_record on private.presence_now;
create trigger seen_record after insert or update on private.presence_now
  for each row execute function private.seen_record();

create or replace function private.access_block()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_ip inet;
  v_dk text;
  v_b record;
begin
  if not exists (select 1 from private.ip_bans b where b.lifted_at is null and (b.until is null or b.until > now()))
    and not exists (select 1 from private.device_bans d where d.lifted_at is null and (d.until is null or d.until > now())) then
    return null;
  end if;
  v_ip := private.to_inet(private.client_ip());
  if v_ip is not null then
    select b.id, b.until into v_b from private.ip_bans b
    where b.lifted_at is null and (b.until is null or b.until > now()) and v_ip <<= b.net
    order by b.until desc nulls first limit 1;
    if found then
      if auth.uid() is not null and private.is_staff(auth.uid()) then
        return null;
      end if;
      return jsonb_build_object('kind', 'ip', 'until', v_b.until);
    end if;
  end if;
  v_dk := private.client_dk();
  if v_dk is not null then
    select d.id, d.until into v_b from private.device_bans d
    where d.dk = v_dk and d.lifted_at is null and (d.until is null or d.until > now())
    order by d.until desc nulls first limit 1;
    if found then
      if auth.uid() is not null and private.is_staff(auth.uid()) then
        return null;
      end if;
      return jsonb_build_object('kind', 'device', 'until', v_b.until);
    end if;
  end if;
  return null;
end;
$$;
revoke all on function private.access_block() from public, anon, authenticated;

create or replace function public.gp_pre_request()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_b jsonb;
begin
  if coalesce(current_setting('request.path', true), '') in ('/rpc/access_status', '/rpc/gp_pre_request', '/rpc/get_gate_slot') then
    return;
  end if;
  v_b := private.access_block();
  if v_b is not null then
    raise sqlstate 'PT403' using message = 'Access blocked', detail = v_b::text, hint = 'access_blocked';
  end if;
end;
$$;
revoke all on function public.gp_pre_request() from public;
grant execute on function public.gp_pre_request() to anon, authenticated, service_role;

create or replace function public.access_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_b jsonb := private.access_block();
begin
  return jsonb_build_object('blocked', v_b is not null, 'kind', v_b ->> 'kind', 'until', v_b -> 'until');
end;
$$;
revoke all on function public.access_status() from public;
grant execute on function public.access_status() to anon, authenticated, service_role;

do $$
begin
  execute 'alter role authenticator set pgrst.db_pre_request to ''public.gp_pre_request''';
exception when others then
  raise notice 'could not set the request check: %', sqlerrm;
end;
$$;
notify pgrst, 'reload config';

create or replace function public.admin_ip_preview(p_net text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_net cidr := private.to_net(p_net);
  v_mine inet := private.to_inet(private.client_ip());
begin
  if v_net is null then
    raise exception 'Enter one address or a range such as 203.0.113.0/24 (at most /16 for IPv4, /32 for IPv6)' using errcode = '22023';
  end if;
  return jsonb_build_object(
    'net', v_net::text,
    'size', case when family(v_net) = 4 then power(2, 32 - masklen(v_net))::bigint else null end,
    'mine', v_mine is not null and v_mine <<= v_net,
    'accounts', coalesce((
      select jsonb_agg(jsonb_build_object('id', a.user_id, 'username', p.username, 'display', p.display_name, 'role', p.role, 'last', a.last_at, 'ips', a.ips) order by a.last_at desc)
      from (select s.user_id, max(s.last_at) as last_at, count(*) as ips from private.ip_seen s where s.ip <<= v_net and s.last_at > now() - interval '30 days' group by s.user_id) a
      left join public.profiles p on p.id = a.user_id), '[]'::jsonb),
    'staff', (select count(distinct s.user_id) from private.ip_seen s join public.profiles p on p.id = s.user_id where s.ip <<= v_net and s.last_at > now() - interval '30 days' and p.role in ('admin', 'owner'))
  );
end;
$$;

create or replace function public.admin_ip_ban(p_net text, p_hours integer, p_reason text)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_net cidr := private.to_net(p_net);
  v_mine inet := private.to_inet(private.client_ip());
  v_id bigint;
  v_until timestamptz := case when coalesce(p_hours, 0) > 0 then now() + make_interval(hours => least(p_hours, 24 * 3650)) end;
  v_reason text := nullif(left(regexp_replace(btrim(coalesce(p_reason, '')), '\s+', ' ', 'g'), 500), '');
begin
  if v_net is null then
    raise exception 'Enter one address or a range such as 203.0.113.0/24 (at most /16 for IPv4, /32 for IPv6)' using errcode = '22023';
  end if;
  if v_mine is not null and v_mine <<= v_net then
    raise exception 'This range includes your own address' using errcode = '42501';
  end if;
  if v_reason is null then
    raise exception 'Give a reason' using errcode = '22023';
  end if;
  insert into private.ip_bans (net, until, reason, created_by) values (v_net, v_until, v_reason, v_me) returning id into v_id;
  perform private.admin_log('ip_ban', null, jsonb_build_object('id', v_id, 'net', v_net::text, 'until', v_until, 'reason', v_reason));
  return v_id;
end;
$$;

create or replace function public.admin_ip_unban(p_id bigint)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_net cidr;
begin
  update private.ip_bans set lifted_at = now(), lifted_by = v_me where id = p_id and lifted_at is null returning net into v_net;
  if not found then
    return false;
  end if;
  perform private.admin_log('ip_unban', null, jsonb_build_object('id', p_id, 'net', v_net::text));
  return true;
end;
$$;

create or replace function public.admin_bans(p_all boolean default false)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return jsonb_build_object(
    'ip', coalesce((select jsonb_agg(jsonb_build_object('id', b.id, 'net', b.net::text, 'until', b.until, 'reason', b.reason, 'at', b.created_at, 'by', pb.username, 'lifted', b.lifted_at, 'lifted_by', pl.username,
        'active', b.lifted_at is null and (b.until is null or b.until > now())) order by b.created_at desc)
      from private.ip_bans b left join public.profiles pb on pb.id = b.created_by left join public.profiles pl on pl.id = b.lifted_by
      where coalesce(p_all, false) or (b.lifted_at is null and (b.until is null or b.until > now()))), '[]'::jsonb),
    'device', coalesce((select jsonb_agg(jsonb_build_object('user', x.user_id, 'username', p.username, 'n', x.n, 'until', x.until, 'reason', x.reason, 'at', x.at) order by x.at desc)
      from (select d.user_id, count(*) as n, max(d.until) as until, max(d.reason) as reason, max(d.created_at) as at from private.device_bans d
            where coalesce(p_all, false) or (d.lifted_at is null and (d.until is null or d.until > now())) group by d.user_id) x
      left join public.profiles p on p.id = x.user_id), '[]'::jsonb)
  );
end;
$$;

create or replace function public.admin_user_addresses(p_uid uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return jsonb_build_object(
    'ips', coalesce((select jsonb_agg(jsonb_build_object('ip', host(s.ip), 'first', s.first_at, 'last', s.last_at,
        'others', (select count(distinct o.user_id) from private.ip_seen o where o.ip = s.ip and o.user_id <> p_uid and o.last_at > now() - interval '30 days'),
        'ban', (select jsonb_build_object('id', b.id, 'net', b.net::text, 'until', b.until) from private.ip_bans b where b.lifted_at is null and (b.until is null or b.until > now()) and s.ip <<= b.net order by b.id desc limit 1)) order by s.last_at desc)
      from private.ip_seen s where s.user_id = p_uid and s.last_at > now() - interval '30 days'), '[]'::jsonb),
    'devices', (select count(*) from private.device_seen d where d.user_id = p_uid and d.last_at > now() - interval '30 days'),
    'devices_banned', (select count(*) from private.device_bans b where b.user_id = p_uid and b.lifted_at is null and (b.until is null or b.until > now()))
  );
end;
$$;

create or replace function public.admin_ban_devices(p_uid uuid, p_hours integer, p_reason text)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_until timestamptz := case when coalesce(p_hours, 0) > 0 then now() + make_interval(hours => least(p_hours, 24 * 3650)) end;
  v_reason text := nullif(left(regexp_replace(btrim(coalesce(p_reason, '')), '\s+', ' ', 'g'), 500), '');
  v_n integer;
begin
  if private.is_staff(p_uid) then
    raise exception 'Make this admin a regular user first' using errcode = '42501';
  end if;
  if p_uid = v_me then
    raise exception 'You cannot ban your own account' using errcode = '42501';
  end if;
  insert into private.device_bans (dk, user_id, until, reason, created_by)
  select d.dk, p_uid, v_until, v_reason, v_me from private.device_seen d
  where d.user_id = p_uid and d.last_at > now() - interval '30 days'
    and not exists (select 1 from private.device_seen o join public.profiles p on p.id = o.user_id where o.dk = d.dk and p.role in ('admin', 'owner'));
  get diagnostics v_n = row_count;
  perform private.admin_log('device_ban', p_uid, jsonb_build_object('devices', v_n, 'until', v_until, 'reason', v_reason));
  return v_n;
end;
$$;

create or replace function public.admin_unban_devices(p_uid uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_n integer;
begin
  update private.device_bans set lifted_at = now(), lifted_by = v_me where user_id = p_uid and lifted_at is null;
  get diagnostics v_n = row_count;
  if v_n > 0 then
    perform private.admin_log('device_unban', p_uid, jsonb_build_object('devices', v_n));
  end if;
  return v_n;
end;
$$;

revoke all on function public.admin_ip_preview(text) from public, anon, authenticated;
revoke all on function public.admin_ip_ban(text, integer, text) from public, anon, authenticated;
revoke all on function public.admin_ip_unban(bigint) from public, anon, authenticated;
revoke all on function public.admin_bans(boolean) from public, anon, authenticated;
revoke all on function public.admin_user_addresses(uuid) from public, anon, authenticated;
revoke all on function public.admin_ban_devices(uuid, integer, text) from public, anon, authenticated;
revoke all on function public.admin_unban_devices(uuid) from public, anon, authenticated;
grant execute on function public.admin_ip_preview(text) to authenticated;
grant execute on function public.admin_ip_ban(text, integer, text) to authenticated;
grant execute on function public.admin_ip_unban(bigint) to authenticated;
grant execute on function public.admin_bans(boolean) to authenticated;
grant execute on function public.admin_user_addresses(uuid) to authenticated;
grant execute on function public.admin_ban_devices(uuid, integer, text) to authenticated;
grant execute on function public.admin_unban_devices(uuid) to authenticated;

-- ============================================================================
-- 2026-11-13 Read marks only by the recipient (Part 17.1.2)
-- ============================================================================
create or replace function public.dm_read(p_with uuid)
returns integer
language sql
volatile
security definer
set search_path = ''
as $$
  select 0;
$$;

drop function if exists public.dm_read(uuid, bigint);
create or replace function public.dm_read(p_with uuid, p_ids bigint[])
returns integer
language sql
volatile
security definer
set search_path = ''
as $$
  with u as (
    update public.dms d set read_at = now()
    where auth.uid() is not null and d.to_id = auth.uid() and d.from_id = p_with and d.read_at is null and d.id = any (coalesce(p_ids[1:200], '{}'::bigint[]))
    returning 1
  )
  select count(*)::integer from u;
$$;
revoke all on function public.dm_read(uuid) from public, anon, authenticated;
revoke all on function public.dm_read(uuid, bigint[]) from public, anon, authenticated;
grant execute on function public.dm_read(uuid) to authenticated;
grant execute on function public.dm_read(uuid, bigint[]) to authenticated;

-- ============================================================================
-- 2026-11-13 Data collection: 50 measures (Part 17.5)
-- ============================================================================

insert into private.an_events (event)
select unnest(array['record', 'milestone', 'party_fail', 'party_end', 'mem10', 'su_step'])
on conflict (event) do nothing;

create table if not exists private.sd_salt (
  id integer primary key check (id = 1),
  salt text not null default encode(extensions.gen_random_bytes(32), 'hex'),
  at timestamptz not null default now()
);
alter table private.sd_salt enable row level security;
revoke all on table private.sd_salt from public, anon, authenticated;
insert into private.sd_salt (id) values (1) on conflict (id) do nothing;

create or replace function private.sd_hash(p text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case when coalesce(p, '') = '' then null
    else left(encode(extensions.hmac(p, (select s.salt from private.sd_salt s where s.id = 1), 'sha256'), 'hex'), 32) end;
$$;
revoke all on function private.sd_hash(text) from public, anon, authenticated;

create or replace function private.sd_geo()
returns text[]
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_h json;
  v_cc text := '';
  v_rg text := '';
begin
  begin
    v_h := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    return array['', ''];
  end;
  if v_h is null then
    return array['', ''];
  end if;
  if coalesce(v_h ->> 'cf-connecting-ip', '') like '2a06:98c0:3600:%' then
    v_cc := upper(btrim(coalesce(v_h ->> 'x-gp-cc', '')));
    v_rg := btrim(coalesce(v_h ->> 'x-gp-region', ''));
  end if;
  if v_cc = '' then
    v_cc := upper(btrim(coalesce(v_h ->> 'cf-ipcountry', '')));
  end if;
  if v_rg = '' then
    v_rg := btrim(coalesce(v_h ->> 'cf-region-code', v_h ->> 'cf-region', ''));
  end if;
  if v_cc !~ '^[A-Z][A-Z0-9]$' or v_cc = 'XX' then
    v_cc := '';
  end if;
  v_rg := left(regexp_replace(v_rg, '[^A-Za-z0-9 .''-]', '', 'g'), 40);
  return array[v_cc, case when v_cc = '' then '' else v_rg end];
end;
$$;
revoke all on function private.sd_geo() from public, anon, authenticated;

create or replace function private.sd_acct(p_uid uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case private.an_level(p_uid) when 2 then 'test' when 1 then 'staff' else case when p_uid is null then 'anon' else 'user' end end;
$$;
revoke all on function private.sd_acct(uuid) from public, anon, authenticated;

create or replace function private.sd_bk(p numeric, p_edges numeric[])
returns text
language sql
immutable
set search_path = ''
as $$
  select case when p is null then null
    else coalesce((select '<' || e::text from unnest(p_edges) e where p < e order by e limit 1), '>=' || p_edges[array_length(p_edges, 1)]::text) end;
$$;
revoke all on function private.sd_bk(numeric, numeric[]) from public, anon, authenticated;

create or replace function private.sd_gpu(p text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when coalesce(btrim(p), '') = '' then 'Unknown|unknown'
    when p ~* 'swiftshader|llvmpipe|softpipe|software|basic render' then 'Software|software'
    when p ~* 'nvidia|geforce|quadro|tesla|rtx|gtx' then 'NVIDIA|discrete'
    when p ~* 'radeon|amd|ati ' then 'AMD|' || case when p ~* '\m(rx|r9|r7|hd [0-9]{4}|pro w|firepro|vii)\M' then 'discrete' else 'integrated' end
    when p ~* 'intel' then 'Intel|' || case when p ~* '\marc\M' then 'discrete' else 'integrated' end
    when p ~* 'apple|\mm[1-9]\M' then 'Apple|integrated'
    when p ~* 'adreno|qualcomm' then 'Qualcomm|mobile'
    when p ~* 'mali|\marm\M' then 'ARM|mobile'
    when p ~* 'powervr|imagination' then 'Imagination|mobile'
    when p ~* 'xclipse|samsung' then 'Samsung|mobile'
    when p ~* 'videocore|broadcom|v3d' then 'Broadcom|mobile'
    else 'Other|unknown' end;
$$;
revoke all on function private.sd_gpu(text) from public, anon, authenticated;

create or replace function private.sd_sig(p jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select left(regexp_replace(coalesce(nullif(p ->> 'where', ''), '?') || ': ' || left(btrim(coalesce(p ->> 'msg', '')), 100), '[0-9]+', '#', 'g'), 110);
$$;
revoke all on function private.sd_sig(jsonb) from public, anon, authenticated;

create or replace function private.sd_ban_kind(p_action text, p_detail jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_action ~ '^(ip_ban|ban_ip|ipban|ip_block)$' then 'ip'
    when p_action ~ '^(device_ban|ban_device|ban_devices|device_block)$' then 'device'
    when p_action in ('lock', 'ban', 'ban_account') then case when coalesce(p_detail ->> 'devices', '') ~ '^[1-9]' then 'device' else 'account' end
    when p_action ~ '^(ip_unban|unban_ip|ip_unblock)$' then 'un:ip'
    when p_action ~ '^(device_unban|unban_device|device_unblock)$' then 'un:device'
    when p_action in ('unlock', 'unban', 'unban_account') then 'un:account'
    else null end;
$$;
revoke all on function private.sd_ban_kind(text, jsonb) from public, anon, authenticated;

create table if not exists private.sd_sess (
  session_id text primary key,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  cc text not null default '',
  region text not null default '',
  ip_h text
);
create index if not exists sd_sess_first_idx on private.sd_sess (first_at);
alter table private.sd_sess enable row level security;
revoke all on table private.sd_sess from public, anon, authenticated;

create or replace function private.sd_sess_note()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_g text[];
  v_ip text;
begin
  v_g := private.sd_geo();
  v_ip := private.sd_hash(nullif(private.client_ip(), ''));
  insert into private.sd_sess as s (session_id, cc, region, ip_h)
    select distinct n.session_id, v_g[1], v_g[2], v_ip from new_rows n
    on conflict (session_id) do update set last_at = now(),
      cc = case when s.cc = '' then excluded.cc else s.cc end,
      region = case when s.region = '' then excluded.region else s.region end,
      ip_h = coalesce(s.ip_h, excluded.ip_h);
  return null;
exception when others then
  return null;
end;
$$;
revoke all on function private.sd_sess_note() from public, anon, authenticated;
drop trigger if exists analytics_sd_sess on public.analytics_events;
create trigger analytics_sd_sess after insert on public.analytics_events
  referencing new table as new_rows
  for each statement execute function private.sd_sess_note();

create table if not exists private.sd_sec (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  kind text not null,
  method text not null default '',
  ok boolean not null,
  code text not null default '',
  uid uuid,
  ip_h text,
  cc text not null default ''
);
create index if not exists sd_sec_at_idx on private.sd_sec (at);
alter table private.sd_sec enable row level security;
revoke all on table private.sd_sec from public, anon, authenticated;

create or replace function public.sec_note(p_kind text, p_method text, p_ok boolean, p_code text default null)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_ip text := nullif(private.client_ip(), '');
  v_k text := lower(coalesce(p_kind, ''));
  v_m text := lower(coalesce(p_method, ''));
  v_g text[];
begin
  if v_k not in ('login', 'signup', 'verify') or v_m not in ('email', 'username', 'google', 'google_relay', '') or p_ok is null then
    return false;
  end if;
  if private.over('sec:' || coalesce(md5(v_ip), auth.uid()::text, 'none'), date_trunc('hour', now()), 120) then
    return false;
  end if;
  v_g := private.sd_geo();
  insert into private.sd_sec (kind, method, ok, code, uid, ip_h, cc)
  values (v_k, v_m, p_ok, left(regexp_replace(lower(coalesce(p_code, '')), '[^a-z0-9_]', '', 'g'), 40), auth.uid(), private.sd_hash(v_ip), v_g[1]);
  return true;
end;
$$;
revoke all on function public.sec_note(text, text, boolean, text) from public, anon, authenticated;
grant execute on function public.sec_note(text, text, boolean, text) to anon, authenticated;

create table if not exists private.sd_gone (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  kind text not null,
  reason text not null default '',
  age_days integer,
  acct text not null default 'user'
);
create index if not exists sd_gone_at_idx on private.sd_gone (at);
alter table private.sd_gone enable row level security;
revoke all on table private.sd_gone from public, anon, authenticated;

create or replace function private.sd_gone_note()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.sd_gone (kind, reason, age_days, acct)
  values (case when auth.uid() is null then 'system' when auth.uid() = old.id then 'self' else 'staff' end,
    coalesce(nullif(current_setting('gp.del_reason', true), ''), ''),
    greatest(0, (now() at time zone 'Europe/Paris')::date - (old.created_at at time zone 'Europe/Paris')::date),
    case when exists (select 1 from public.test_accounts t where t.user_id = old.id) then 'test' when old.role in ('admin', 'owner') then 'staff' else 'user' end);
  return old;
exception when others then
  return old;
end;
$$;
revoke all on function private.sd_gone_note() from public, anon, authenticated;
drop trigger if exists profiles_sd_gone on public.profiles;
create trigger profiles_sd_gone before delete on public.profiles
  for each row execute function private.sd_gone_note();

create or replace function public.delete_my_account_why(p_reason text default null)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_r text := lower(btrim(coalesce(p_reason, '')));
  v_out text;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if v_r not in ('', 'not_playing', 'privacy', 'new_account', 'too_many_messages', 'problems', 'other') then
    v_r := 'other';
  end if;
  perform set_config('gp.del_reason', v_r, true);
  v_out := public.delete_my_account();
  if v_out = 'requested' then
    insert into private.sd_gone (kind, reason, age_days, acct)
    select 'request', v_r, greatest(0, (now() at time zone 'Europe/Paris')::date - (p.created_at at time zone 'Europe/Paris')::date), private.sd_acct(v_uid)
    from public.profiles p where p.id = v_uid;
  end if;
  return v_out;
end;
$$;
revoke all on function public.delete_my_account_why(text) from public, anon, authenticated;
grant execute on function public.delete_my_account_why(text) to authenticated;

create table if not exists private.sd_ticket (
  ticket_id bigint primary key,
  opened_at timestamptz not null,
  first_staff_at timestamptz,
  closed_at timestamptz,
  acct text not null default 'user'
);
create index if not exists sd_ticket_opened_idx on private.sd_ticket (opened_at);
alter table private.sd_ticket enable row level security;
revoke all on table private.sd_ticket from public, anon, authenticated;

create or replace function private.sd_ticket_note()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'tickets' then
    if tg_op = 'INSERT' then
      insert into private.sd_ticket (ticket_id, opened_at, acct) values (new.id, new.created_at, private.sd_acct(new.user_id)) on conflict (ticket_id) do nothing;
    elsif new.status is distinct from old.status then
      insert into private.sd_ticket as t (ticket_id, opened_at, acct, closed_at)
      values (new.id, new.created_at, private.sd_acct(new.user_id), case when new.status = 'closed' then now() end)
      on conflict (ticket_id) do update set closed_at = case when new.status = 'closed' then coalesce(t.closed_at, now()) else null end;
    end if;
  elsif new.is_admin then
    update private.sd_ticket t set first_staff_at = new.created_at
    where t.ticket_id = new.ticket_id and t.first_staff_at is null
      and not exists (select 1 from public.tickets k where k.id = new.ticket_id and k.user_id = new.author_id);
  end if;
  return null;
exception when others then
  return null;
end;
$$;
revoke all on function private.sd_ticket_note() from public, anon, authenticated;
drop trigger if exists tickets_sd_note on public.tickets;
create trigger tickets_sd_note after insert or update of status on public.tickets
  for each row execute function private.sd_ticket_note();
drop trigger if exists ticket_messages_sd_note on public.ticket_messages;
create trigger ticket_messages_sd_note after insert on public.ticket_messages
  for each row execute function private.sd_ticket_note();

insert into private.sd_ticket (ticket_id, opened_at, first_staff_at, closed_at, acct)
select k.id, k.created_at,
  (select min(m.created_at) from public.ticket_messages m where m.ticket_id = k.id and m.is_admin and m.author_id is distinct from k.user_id),
  case when k.status = 'closed' then k.updated_at end,
  private.sd_acct(k.user_id)
from public.tickets k
on conflict (ticket_id) do nothing;

create table if not exists private.sd_roll (
  day date not null,
  k text not null,
  game text not null default '',
  cc text not null default '',
  dev text not null default '',
  acct text not null default '',
  n bigint not null default 0,
  s double precision not null default 0,
  primary key (day, k, game, cc, dev, acct)
);
create index if not exists sd_roll_k_idx on private.sd_roll (k, day);
alter table private.sd_roll enable row level security;
revoke all on table private.sd_roll from public, anon, authenticated;

create table if not exists private.sd_act (
  day date not null,
  who text not null,
  game text not null default '',
  acct text not null default '',
  cc text not null default '',
  dev text not null default '',
  born date,
  hrs integer not null default 0,
  primary key (day, who, game)
);
create index if not exists sd_act_who_idx on private.sd_act (who, day);
create index if not exists sd_act_born_idx on private.sd_act (born) where game = '';
alter table private.sd_act enable row level security;
revoke all on table private.sd_act from public, anon, authenticated;

create table if not exists private.sd_mark (
  day date primary key,
  at timestamptz not null default now(),
  ms integer,
  final boolean not null default false
);
alter table private.sd_mark enable row level security;
revoke all on table private.sd_mark from public, anon, authenticated;

create or replace function private.sd_roll_day(p_day date)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_t0 timestamptz := (p_day::timestamp at time zone 'Europe/Paris');
  v_t1 timestamptz := ((p_day + 1)::timestamp at time zone 'Europe/Paris');
  v_c0 timestamptz := clock_timestamp();
  v_n integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('gameplay:sd_roll', 0));
  delete from private.sd_roll where day = p_day;
  delete from private.sd_act where day = p_day;
  if to_regclass('pg_temp.sd_x') is not null then drop table pg_temp.sd_x; end if;
  if to_regclass('pg_temp.sd_s') is not null then drop table pg_temp.sd_s; end if;
  if to_regclass('pg_temp.sd_e') is not null then drop table pg_temp.sd_e; end if;
  create temporary table sd_x on commit drop as
  select e.id, e.created_at, coalesce(e.client_at, e.created_at) as at, e.session_id, e.event,
    case when e.game_id is not null then e.game_id when e.props ->> 'game' ~ '^[a-z0-9][a-z0-9-]{0,39}$' then e.props ->> 'game' else '' end as game,
    e.props as p, e.device, coalesce(e.user_id, l.user_id) as uid, e.visitor_id, e.skip
  from public.analytics_events e
  left join private.an_link l on e.user_id is null and l.k = 's:' || e.session_id
  where e.created_at >= v_t0 and e.created_at < v_t1;
  create temporary table sd_s on commit drop as
  select x.session_id,
    coalesce(nullif(max(s.cc), ''), max(upper(coalesce(nullif(x.p ->> 'scc', ''), x.p ->> 'cc'))) filter (where x.event = 'env_geo' and coalesce(nullif(x.p ->> 'scc', ''), x.p ->> 'cc', '') ~ '^[A-Za-z][A-Za-z0-9]$'), '') as cc,
    coalesce(nullif(max(s.region), ''), left(max(x.p ->> 'region') filter (where x.event = 'env_geo'), 40), '') as region,
    coalesce(max(x.device), '') as dev,
    case max(x.skip) when 2 then 'test' when 1 then 'staff' else case when bool_or(x.uid is not null) then 'user' else 'anon' end end as acct,
    private.sd_hash(coalesce(max(x.uid::text), 'v:' || max(x.visitor_id), 's:' || x.session_id)) as who,
    max(x.uid::text)::uuid as uid,
    min(x.at) as t0, max(x.at) as t1,
    greatest(extract(epoch from max(x.at) - min(x.at)), coalesce(max(private.jnum(x.p, 'dur')) filter (where x.event = 'sess_sum'), 0)) as dur,
    min(x.at) filter (where x.event = 'game_launch') as fl,
    count(*) filter (where x.event = 'view') as views,
    (array_agg(x.p ->> 'v' order by x.at, x.id) filter (where x.event = 'view'))[1] as ent,
    coalesce((array_agg(x.p ->> 'v' order by x.at desc, x.id desc) filter (where x.event = 'page_time' and private.jbool(x.p, 'exit'))) [1],
      (array_agg(x.p ->> 'v' order by x.at desc, x.id desc) filter (where x.event = 'view'))[1]) as ext,
    coalesce((array_agg(x.p ->> 'ref' order by x.at, x.id) filter (where x.event = 'env_caps'))[1], (array_agg(coalesce(nullif(x.p ->> 'ref', ''), 'direct') order by x.at, x.id) filter (where x.event = 'session'))[1]) as ref,
    (array_agg(x.p order by x.at, x.id) filter (where x.event = 'env_dev'))[1] as dv,
    (array_agg(x.p order by x.at, x.id) filter (where x.event = 'env_scr'))[1] as sc,
    (array_agg(x.p order by x.at, x.id) filter (where x.event = 'env_geo'))[1] as geo,
    (array_agg(x.p order by x.at desc, x.id desc) filter (where x.event = 'sess_sum'))[1] as sm
  from pg_temp.sd_x x
  left join private.sd_sess s on s.session_id = x.session_id
  group by x.session_id;
  create temporary table sd_e on commit drop as
  select x.*, s.cc, s.dev as sdev, s.acct, s.who
  from pg_temp.sd_x x join pg_temp.sd_s s on s.session_id = x.session_id;

  insert into private.sd_roll (day, k, game, cc, dev, acct, n, s)
  select p_day, u.k, u.game, u.cc, u.dev, u.acct, sum(u.n), sum(u.s)
  from (
    select 'm3.n' as k, '' as game, s.cc, s.dev, s.acct, 1::bigint as n, s.dur::float8 as s from pg_temp.sd_s s
    union all select 'm3.b:' || private.sd_bk(s.dur::numeric, array[60, 300, 900, 1800, 3600]), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s
    union all select 'm3.h0:' || extract(hour from s.t0 at time zone 'Europe/Paris')::int, '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s
    union all select 'm3.h1:' || extract(hour from s.t1 at time zone 'Europe/Paris')::int, '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s
    union all select 'm4.scr', '', s.cc, s.dev, s.acct, 1, s.views from pg_temp.sd_s s
    union all select 'm4.ent:' || left(coalesce(s.ent, '?'), 24), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s
    union all select 'm4.ext:' || left(coalesce(s.ext, '?'), 24), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s
    union all select 'm7:' || left(coalesce(nullif(s.ref, ''), 'direct'), 60), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where s.ref is not null
    union all select 'm8.t', '', s.cc, s.dev, s.acct, 1, greatest(0, extract(epoch from s.fl - s.t0)) from pg_temp.sd_s s where s.fl is not null
    union all select 'm8.b:' || private.sd_bk(greatest(0, extract(epoch from s.fl - s.t0))::numeric, array[5, 15, 30, 60, 120, 300]), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where s.fl is not null
    union all select 'm8.none', '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where s.fl is null
    union all select 'm23:' || left(coalesce(nullif(s.dv ->> 'brv', ''), 'Unknown'), 30), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where s.dv is not null
    union all select 'm24:' || left(coalesce(nullif(s.dv ->> 'osv', ''), 'Unknown'), 30), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where s.dv is not null
    union all select 'm25.t:' || coalesce(nullif(s.dev, ''), 'unknown'), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s
    union all select 'm25.res:' || left(s.sc ->> 'res', 12), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where s.sc ->> 'res' ~ '^[0-9]{2,5}x[0-9]{2,5}$'
    union all select 'm25.dpr:' || round(private.jnum(s.sc, 'dpr'), 2)::text, '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where private.jnum(s.sc, 'dpr') between 0.25 and 8
    union all select 'm26:' || private.sd_gpu(s.dv ->> 'gpu'), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where s.dv is not null
    union all select 'm27.c:' || coalesce(private.sd_bk(private.jnum(s.dv, 'cores'), array[3, 5, 9, 17]), '?'), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where s.dv is not null
    union all select 'm27.m:' || coalesce(private.jnum(s.dv, 'mem')::text, '?'), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where s.dv is not null
    union all select 'm31.net:' || left(coalesce(nullif(s.geo ->> 'net', ''), '?'), 12), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where s.geo is not null
    union all select 'm31.ct:' || left(coalesce(nullif(s.geo ->> 'ctype', ''), '?'), 12), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where s.geo is not null
    union all select 'm31.dl:' || coalesce(private.sd_bk(private.jnum(s.geo, 'dl'), array[0.5, 1, 2, 5, 10, 25, 50, 100]), '?'), '', s.cc, s.dev, s.acct, 1, coalesce(private.jnum(s.geo, 'dl'), 0) from pg_temp.sd_s s where s.geo is not null
    union all select 'm31.rtt:' || coalesce(private.sd_bk(private.jnum(s.geo, 'rtt'), array[50, 100, 200, 400, 800]), '?'), '', s.cc, s.dev, s.acct, 1, coalesce(private.jnum(s.geo, 'rtt'), 0) from pg_temp.sd_s s where s.geo is not null
    union all select 'm48:' || coalesce(nullif(upper(s.cc), ''), '??'), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s
    union all select 'm48.r:' || upper(s.cc) || '/' || s.region, '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where s.cc <> '' and s.region <> ''
    union all select 'm49.lang:' || left(s.sm ->> 'lang', 8), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where coalesce(s.sm ->> 'lang', '') <> ''
    union all select 'm49.theme:' || left(s.sm ->> 'theme', 12), '', s.cc, s.dev, s.acct, 1, 0 from pg_temp.sd_s s where coalesce(s.sm ->> 'theme', '') <> ''

    union all select 'm9.open', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'game_open'
    union all select 'm9.launch', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'game_launch'
    union all select 'm9.play', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'game_play'
    union all select 'm9.fail', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'error' and e.p ->> 'where' in ('load', 'mount')
    union all select 'm10.t', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, coalesce(private.jnum(e.p, 'lt'), private.jnum(e.p, 'ms')) from pg_temp.sd_e e where e.event = 'game_launch' and coalesce(private.jnum(e.p, 'lt'), private.jnum(e.p, 'ms')) between 0 and 600000
    union all select 'm10.b:' || private.sd_bk(coalesce(private.jnum(e.p, 'lt'), private.jnum(e.p, 'ms')), array[250, 500, 1000, 2000, 4000, 8000]), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'game_launch' and coalesce(private.jnum(e.p, 'lt'), private.jnum(e.p, 'ms')) between 0 and 600000
    union all select 'm11.t', g.game, g.cc, g.sdev, g.acct, 1, g.sec from (select e.session_id, coalesce(nullif(e.game, ''), '-') as game, e.cc, e.sdev, e.acct, sum(coalesce(private.jnum(e.p, 'sec'), 0)) as sec from pg_temp.sd_e e where e.event = 'game_time' group by 1, 2, 3, 4, 5) g
    union all select 'm11.b:' || private.sd_bk(g.sec, array[60, 300, 900, 1800, 3600]), g.game, g.cc, g.sdev, g.acct, 1, 0 from (select e.session_id, coalesce(nullif(e.game, ''), '-') as game, e.cc, e.sdev, e.acct, sum(coalesce(private.jnum(e.p, 'sec'), 0)) as sec from pg_temp.sd_e e where e.event = 'game_time' group by 1, 2, 3, 4, 5) g
    union all select 'm12.fin', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, coalesce(private.jnum(e.p, 'rounds'), 0) from pg_temp.sd_e e where e.event = 'game_quit'
    union all select 'm12.start', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, coalesce(private.jnum(e.p, 'rs'), private.jnum(e.p, 'rounds'), 0) from pg_temp.sd_e e where e.event = 'game_quit'
    union all select 'm12.ab', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, coalesce(private.jnum(e.p, 'ab'), 0) from pg_temp.sd_e e where e.event = 'game_quit'
    union all select 'm13.lv:' || case when private.jnum(e.p, 'lv') is null then 'none' when private.jnum(e.p, 'lv') >= 50 then '50+' else greatest(0, floor(private.jnum(e.p, 'lv')))::int::text end, coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'game_quit'
    union all select 'm13.why:' || left(coalesce(e.p ->> 'why', '?'), 12), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'game_quit'
    union all select 'm13.last', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, private.jnum(e.p, 'last') from pg_temp.sd_e e where e.event = 'game_quit' and private.jnum(e.p, 'last') is not null
    union all select 'm14.n:' || left(coalesce(nullif(e.p ->> 'dif', ''), '-'), 24), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, coalesce(private.jnum(e.p, 'w'), 0) from pg_temp.sd_e e where e.event = 'game_quit' and (coalesce(e.p ->> 'dif', '') <> '' or coalesce(private.jnum(e.p, 'w'), 0) + coalesce(private.jnum(e.p, 'l'), 0) > 0)
    union all select 'm14.l:' || left(coalesce(nullif(e.p ->> 'dif', ''), '-'), 24), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, coalesce(private.jnum(e.p, 'l'), 0) from pg_temp.sd_e e where e.event = 'game_quit' and (coalesce(e.p ->> 'dif', '') <> '' or coalesce(private.jnum(e.p, 'w'), 0) + coalesce(private.jnum(e.p, 'l'), 0) > 0)
    union all select 'm15.b:' || to_char(floor(log(10, v.v::numeric) * 4) / 4, 'FM990.00'), v.game, v.cc, v.sdev, v.acct, 1, v.v
      from (select coalesce(nullif(e.game, ''), '-') as game, e.cc, e.sdev, e.acct, x.value::float8 as v
        from pg_temp.sd_e e, jsonb_array_elements_text(case when jsonb_typeof(e.p -> 'sc') = 'array' and jsonb_array_length(e.p -> 'sc') > 0 then e.p -> 'sc' when jsonb_typeof(e.p -> 'last') = 'number' then jsonb_build_array(e.p -> 'last') else '[]'::jsonb end) x
        where e.event = 'game_quit' and x.value ~ '^[0-9.eE+-]+$') v
      where v.v > 0 and v.v < 1e15
    union all select 'm16:' || left(coalesce(nullif(e.p ->> 'mo', ''), 'unknown'), 12), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'game_quit'
    union all select 'm17', g.game, g.cc, g.sdev, g.acct, 1, g.n from (select e.session_id, coalesce(nullif(e.game, ''), '-') as game, e.cc, e.sdev, e.acct, count(*) as n from pg_temp.sd_e e where e.event = 'restart' group by 1, 2, 3, 4, 5) g
    union all select 'm18.show:' || left(coalesce(nullif(split_part(i.v, '|', 2), ''), '?'), 12), split_part(i.v, '|', 1), e.cc, e.sdev, e.acct, 1, 0
      from pg_temp.sd_e e, jsonb_array_elements_text(case when jsonb_typeof(e.p -> 'l') = 'array' then e.p -> 'l' else '[]'::jsonb end) i(v)
      where e.event = 'impr' and split_part(i.v, '|', 1) ~ '^[a-z0-9][a-z0-9-]{0,39}$'
    union all select 'm18.click:' || left(coalesce(nullif(e.p ->> 'src', ''), '?'), 12), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'tile_click'
    union all select 'm19.fav:' || case when private.jbool(e.p, 'on') then 'on' else 'off' end, coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'favourite'
    union all select 'm19.search', '', e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'search'
    union all select 'm19.search_go', '', e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'search_go'
    union all select 'm19.cat:' || left(coalesce(e.p ->> 'k', '?') || '=' || coalesce(e.p ->> 'v', '?'), 40), '', e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'filter' and private.jbool(e.p, 'on') is not false
    union all select 'm19.sort:' || left(coalesce(e.p ->> 'v', '?'), 20), '', e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'sort'
    union all select 'm20:' || left(lower(btrim(e.p ->> 'q')), 40), '', e.cc, e.sdev, e.acct, 1, case when private.jnum(e.p, 'n') = 0 then 1 else 0 end from pg_temp.sd_e e where e.event = 'search' and coalesce(btrim(e.p ->> 'q'), '') <> ''
    union all select 'm21.fs', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'fullscreen'
    union all select 'm21.th:' || case when e.p ->> 'v' in ('true', 'false') then case when (e.p ->> 'v')::boolean then 'on' else 'off' end else '?' end, '', e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'setting' and e.p ->> 'k' = 'theater'
    union all select 'm22.best', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'record'
    union all select 'm22.' || case when e.p ->> 'k' in ('ach', 'level') then e.p ->> 'k' else 'ach' end, coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'milestone'
    union all select 'm28.fr', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, private.jnum(e.p, 'fr') from pg_temp.sd_e e where e.event = 'game_time' and private.jnum(e.p, 'fr') >= 60 and private.jnum(e.p, 'fps') > 0
    union all select 'm28.ft', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, private.jnum(e.p, 'fr') / private.jnum(e.p, 'fps') from pg_temp.sd_e e where e.event = 'game_time' and private.jnum(e.p, 'fr') >= 60 and private.jnum(e.p, 'fps') > 0
    union all select 'm28.sl', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, coalesce(private.jnum(e.p, 'sl'), 0) from pg_temp.sd_e e where e.event = 'game_time' and private.jnum(e.p, 'fr') >= 60 and private.jnum(e.p, 'fps') > 0
    union all select 'm28.lf', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, coalesce(private.jnum(e.p, 'lf'), 0) from pg_temp.sd_e e where e.event = 'game_time' and private.jnum(e.p, 'fr') >= 60 and private.jnum(e.p, 'fps') > 0
    union all select 'm28.b:' || private.sd_bk(private.jnum(e.p, 'fps'), array[20, 30, 45, 55]), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'game_time' and private.jnum(e.p, 'fr') >= 60 and private.jnum(e.p, 'fps') > 0
    union all select 'm29.t', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, private.jnum(e.p, 'mb') from pg_temp.sd_e e where e.event = 'mem10' and private.jnum(e.p, 'mb') > 0
    union all select 'm29.b:' || private.sd_bk(private.jnum(e.p, 'mb'), array[50, 100, 200, 400, 800, 1600]), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'mem10' and private.jnum(e.p, 'mb') > 0
    union all select 'm30.' || m.k || ':' || private.sd_bk(private.jnum(e.p, m.k), array[100, 200, 500, 800, 1000, 1500, 2000, 2500, 3000, 4000, 6000, 10000]), '', e.cc, e.sdev, e.acct, 1, private.jnum(e.p, m.k)
      from pg_temp.sd_e e, unnest(array['ttfb', 'fp', 'fcp', 'lcp']) m(k)
      where e.event = 'vitals' and private.jnum(e.p, m.k) between 0 and 600000
    union all select 'm32:' || private.sd_sig(e.p), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'error'
    union all select 'm32.br:' || left(coalesce(nullif(s.dv ->> 'brv', ''), 'Unknown'), 30), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e join pg_temp.sd_s s on s.session_id = e.session_id where e.event = 'error'
    union all select 'm33.create:' || case when private.jnum(e.p, 'rt') = 1 and private.jnum(e.p, 'peer') = 1 then 'both' when private.jnum(e.p, 'rt') = 1 then 'site' when private.jnum(e.p, 'peer') = 1 then 'peerjs' else '?' end, coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'party_create'
    union all select 'm33.join:' || left(coalesce(nullif(e.p ->> 'via', ''), '?'), 16), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'party_join'
    union all select 'm33.fail:' || left(coalesce(nullif(e.p ->> 'why', ''), '?'), 24), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'party_fail'
    union all select 'm33.retry', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'party_retry'
    union all select 'm34.t', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, private.jnum(e.p, 'ms') from pg_temp.sd_e e where e.event = 'party_join' and private.jnum(e.p, 'ms') between 0 and 600000
    union all select 'm34.b:' || private.sd_bk(private.jnum(e.p, 'ms') / 1000, array[2, 5, 10, 20, 40]), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'party_join' and private.jnum(e.p, 'ms') between 0 and 600000
    union all select 'm35:' || left(coalesce(nullif(e.p ->> 'via', ''), '?'), 16) || case when private.jnum(e.p, 'turn') = 1 or private.jbool(e.p, 'turn') then '+turn' else '' end, coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'party_join'
    union all select 'm36.drop', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, coalesce(private.jnum(e.p, 'drops'), 0) from pg_temp.sd_e e where e.event = 'party_end'
    union all select 'm36.back', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, coalesce(private.jnum(e.p, 'backs'), 0) from pg_temp.sd_e e where e.event = 'party_end'
    union all select 'm37.size:' || least(greatest(coalesce(private.jnum(e.p, 'players'), 0), 0), 99)::int, coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'party_play'
    union all select 'm37.dur', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, private.jnum(e.p, 'sec') from pg_temp.sd_e e where e.event = 'party_end' and private.jnum(e.p, 'sec') >= 0
    union all select 'm37.b:' || private.sd_bk(private.jnum(e.p, 'sec'), array[60, 300, 900, 1800, 3600]), coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'party_end' and private.jnum(e.p, 'sec') >= 0
    union all select 'm38.' || case when private.jnum(e.p, 'pub') = 1 then 'pub' else 'priv' end, coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'party_create'
    union all select 'm38.acc', coalesce(nullif(e.game, ''), '-'), e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'party_join' and private.jnum(e.p, 'inv') = 1
    union all select 'm44.' || left(coalesce(nullif(g.m, ''), '?'), 12) || ':' || left(coalesce(nullif(g.st, ''), '?'), 12), '', g.cc, g.sdev, g.acct, 1, 0 from (select distinct e.session_id, e.p ->> 'm' as m, e.p ->> 's' as st, e.cc, e.sdev, e.acct from pg_temp.sd_e e where e.event = 'su_step'
      and (not exists (select 1 from pg_temp.sd_e a where a.session_id = e.session_id and a.event = 'auth' and a.p ->> 'act' = 'signin')
        or exists (select 1 from pg_temp.sd_e a where a.session_id = e.session_id and a.event = 'su_step' and a.p ->> 'm' = e.p ->> 'm' and a.p ->> 's' not in ('open', 'start')))) g
    union all select 'm49:' || left(coalesce(e.p ->> 'k', '?'), 20) || ':' || left(coalesce(e.p ->> 'old', '?'), 20) || '>' || left(coalesce(e.p ->> 'v', '?'), 20), '', e.cc, e.sdev, e.acct, 1, 0 from pg_temp.sd_e e where e.event = 'setting'

    union all select 'm38.inv', '', '*', '*', private.sd_acct(d.from_id), 1, 0 from public.dms d where d.kind = 'invite' and d.created_at >= v_t0 and d.created_at < v_t1
    union all select 'm40:' || left(coalesce(d.kind, '?'), 12), '', '*', '*', private.sd_acct(d.from_id), 1, 0 from public.dms d where d.created_at >= v_t0 and d.created_at < v_t1
    union all select 'm39.sent', '', '*', '*', private.sd_acct(f.from_id), 1, 0 from public.friend_requests f where f.created_at >= v_t0 and f.created_at < v_t1
    union all select 'm39.' || left(f.status, 12), '', '*', '*', private.sd_acct(f.to_id), 1, extract(epoch from f.updated_at - f.created_at) from public.friend_requests f where f.status <> 'pending' and f.updated_at >= v_t0 and f.updated_at < v_t1
    union all select 'm41.block', '', '*', '*', private.sd_acct(b.blocker), 1, 0 from public.user_blocks b where b.created_at >= v_t0 and b.created_at < v_t1
    union all select 'm41.rep:' || left(coalesce(r.reason, '?'), 24), '', '*', '*', private.sd_acct(r.reporter), 1, 0 from public.user_reports r where r.created_at >= v_t0 and r.created_at < v_t1
    union all select 'm42.open', '', '*', '*', t.acct, 1, 0 from private.sd_ticket t where t.opened_at >= v_t0 and t.opened_at < v_t1
    union all select 'm42.reply', '', '*', '*', t.acct, 1, extract(epoch from t.first_staff_at - t.opened_at) from private.sd_ticket t where t.first_staff_at >= v_t0 and t.first_staff_at < v_t1
    union all select 'm42.res', '', '*', '*', t.acct, 1, extract(epoch from t.closed_at - t.opened_at) from private.sd_ticket t where t.closed_at >= v_t0 and t.closed_at < v_t1
    union all select 'm43.idea:' || left(coalesce(i.kind, '?'), 16), '', '*', '*', private.sd_acct(i.user_id), 1, 0 from public.ideas i where i.created_at >= v_t0 and i.created_at < v_t1
    union all select 'm43.vote:' || case when v.vote > 0 then 'up' else 'down' end, v.game_id, '*', '*', private.sd_acct(v.user_id), 1, 0 from public.game_votes v where v.created_at >= v_t0 and v.created_at < v_t1
    union all select 'm44.acct:' || left(coalesce(u.raw_app_meta_data ->> 'provider', 'email'), 12), '', '*', '*', private.sd_acct(u.id), 1, 0 from auth.users u where u.created_at >= v_t0 and u.created_at < v_t1
    union all select 'm45.' || q.method || ':' || case when q.ok then 'ok' else 'fail' end, '', q.cc, '*', private.sd_acct(q.uid), 1, 0 from private.sd_sec q where q.kind = 'login' and q.at >= v_t0 and q.at < v_t1
    union all select 'm45.code:' || coalesce(nullif(q.code, ''), '?'), '', q.cc, '*', private.sd_acct(q.uid), 1, 0 from private.sd_sec q where q.kind = 'login' and not q.ok and q.at >= v_t0 and q.at < v_t1
    union all select 'm44.srv:' || q.kind || ':' || case when q.ok then 'ok' else 'fail' end, '', q.cc, '*', private.sd_acct(q.uid), 1, 0 from private.sd_sec q where q.kind in ('signup', 'verify') and q.at >= v_t0 and q.at < v_t1
    union all select 'm46.' || g.kind || ':' || coalesce(nullif(g.reason, ''), 'none'), '', '*', '*', g.acct, 1, coalesce(g.age_days, 0) from private.sd_gone g where g.at >= v_t0 and g.at < v_t1
    union all select 'm47:' || left(h.action, 30), '', '*', '*', private.sd_acct(h.uid), 1, case when h.full_hit then 1 else 0 end from private.rate_hits h where h.at >= v_t0 and h.at < v_t1
    union all select 'm50:' || private.sd_ban_kind(l.action, l.detail), '', '*', '*', private.sd_acct(l.target_user), 1, 0 from public.admin_log l where l.at >= v_t0 and l.at < v_t1 and private.sd_ban_kind(l.action, l.detail) is not null
    union all select 'm50.rep:' || private.sd_ban_kind(l.action, l.detail), '', '*', '*', private.sd_acct(l.target_user), 1, 0 from public.admin_log l
      where l.at >= v_t0 and l.at < v_t1 and private.sd_ban_kind(l.action, l.detail) in ('account', 'device', 'ip')
        and exists (select 1 from public.admin_log o where o.at < l.at and private.sd_ban_kind(o.action, o.detail) in ('account', 'device', 'ip')
          and ((l.target_user is not null and o.target_user = l.target_user) or (l.target_user is null and coalesce(l.detail ->> 'cidr', l.detail ->> 'ip', '') <> '' and coalesce(o.detail ->> 'cidr', o.detail ->> 'ip', '') = coalesce(l.detail ->> 'cidr', l.detail ->> 'ip'))))
  ) u
  where u.k is not null and u.s is not null
  group by u.k, u.game, u.cc, u.dev, u.acct;
  get diagnostics v_n = row_count;

  insert into private.sd_act (day, who, game, acct, cc, dev, born, hrs)
  select p_day, a.who, a.game,
    (array['anon', 'user', 'staff', 'test'])[a.lv + 1], a.cc, a.dev,
    coalesce((select (p.created_at at time zone 'Europe/Paris')::date from public.profiles p where p.id = a.uid),
      (select min(o.day) from private.sd_act o where o.who = a.who and o.day < p_day), p_day),
    a.hrs
  from (
    select e.who, g.game, max(case e.acct when 'test' then 3 when 'staff' then 2 when 'user' then 1 else 0 end) as lv,
      max(e.cc) as cc, max(e.sdev) as dev, max(e.uid::text)::uuid as uid,
      bit_or(1 << extract(hour from e.created_at at time zone 'Europe/Paris')::int) as hrs
    from pg_temp.sd_e e
    cross join lateral (select '' as game union all select e.game where e.game <> '' and e.event in ('game_launch', 'game_play', 'game_time', 'game_quit', 'game_active')) g
    where e.who is not null
    group by e.who, g.game
  ) a;

  insert into private.sd_mark as m (day, at, ms, final)
  values (p_day, now(), (extract(epoch from clock_timestamp() - v_c0) * 1000)::integer, now() > v_t1 + interval '3 hours')
  on conflict (day) do update set at = excluded.at, ms = excluded.ms, final = excluded.final;
  if to_regclass('pg_temp.sd_x') is not null then drop table pg_temp.sd_x; end if;
  if to_regclass('pg_temp.sd_s') is not null then drop table pg_temp.sd_s; end if;
  if to_regclass('pg_temp.sd_e') is not null then drop table pg_temp.sd_e; end if;
  return v_n;
end;
$$;
revoke all on function private.sd_roll_day(date) from public, anon, authenticated;

create or replace function private.sd_sweep()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  delete from private.sd_sess where first_at < now() - interval '400 days';
  update private.sd_sess set ip_h = null where ip_h is not null and first_at < now() - interval '30 days';
  delete from private.sd_sec where at < now() - interval '90 days';
  delete from private.sd_act where day < (now() at time zone 'Europe/Paris')::date - 730;
  delete from private.sd_roll where day < (now() at time zone 'Europe/Paris')::date - 1096;
  delete from private.sd_roll where k like 'm20:%' and day < (now() at time zone 'Europe/Paris')::date - 400;
  delete from private.sd_gone where at < now() - interval '1096 days';
  delete from private.sd_ticket where opened_at < now() - interval '1096 days';
  delete from private.sd_mark where day < (now() at time zone 'Europe/Paris')::date - 1096;
end;
$$;
revoke all on function private.sd_sweep() from public, anon, authenticated;

create or replace function private.sd_roll_due(p_from date default null, p_to date default null, p_max integer default 7)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_to date := least(coalesce(p_to, v_today), v_today);
  v_from date := greatest(coalesce(p_from, v_today - 7), v_today - 400);
  v_d date;
  v_n integer := 0;
begin
  if not pg_try_advisory_xact_lock(hashtextextended('gameplay:sd_due', 0)) then
    return -1;
  end if;
  for v_d in
    select g.d::date from generate_series(v_to, v_from, interval '-1 day') g(d)
    left join private.sd_mark m on m.day = g.d::date
    where m.day is null or (not m.final and m.at < now() - case when g.d::date = v_today then interval '5 minutes' else interval '30 minutes' end)
    order by (m.day is not null), g.d desc
  loop
    exit when v_n >= greatest(1, coalesce(p_max, 7));
    perform private.sd_roll_day(v_d);
    v_n := v_n + 1;
  end loop;
  if random() < 0.05 or not exists (select 1 from private.sd_mark m where m.day = v_today - 1) then
    perform private.sd_sweep();
  end if;
  return v_n;
end;
$$;
revoke all on function private.sd_roll_due(date, date, integer) from public, anon, authenticated;

create or replace function private.sd_tick()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or exists (select 1 from pg_catalog.pg_extension x where x.extname = 'pg_cron') then
    return null;
  end if;
  if coalesce((select m.at from private.sd_mark m where m.day = (now() at time zone 'Europe/Paris')::date), 'epoch') < now() - interval '20 minutes' then
    perform private.sd_roll_due(null, null, 2);
  end if;
  return null;
exception when others then
  return null;
end;
$$;
revoke all on function private.sd_tick() from public, anon, authenticated;
drop trigger if exists analytics_sd_tick on public.analytics_events;
create trigger analytics_sd_tick after insert on public.analytics_events
  for each statement execute function private.sd_tick();

do $$
begin
  if exists (select 1 from pg_catalog.pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(j.jobid) from cron.job j where j.jobname = 'gameplay-sd-roll';
    perform cron.schedule('gameplay-sd-roll', '*/10 * * * *', 'select private.sd_roll_due(null, null, 4)');
  end if;
exception when others then
  raise notice 'pg_cron job not created: %', sqlerrm;
end;
$$;

create or replace function private.sd_m6(p_from date, p_to date, p_game text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  r jsonb;
begin
  with t as (
    select pt.at, count(distinct pt.user_id) as n
    from private.presence_ticks pt
    where private.an_level(pt.user_id) = 0
    group by pt.at
  )
  select jsonb_build_object(
    'src', 'ticks5',
    'now', (select count(*) from private.presence_now n where n.at > now() - interval '100 seconds' and (p_game is null or n.game = p_game) and private.an_level(n.user_id) = 0),
    'best', (select jsonb_build_object('n', t.n, 'at', t.at) from t order by t.n desc, t.at limit 1),
    'days', coalesce((
      select jsonb_agg(jsonb_build_object('d', d.day, 'n', d.n, 'at', d.at) order by d.day)
      from (
        select distinct on ((t.at at time zone 'Europe/Paris')::date) (t.at at time zone 'Europe/Paris')::date as day, t.n, t.at
        from t
        where t.at >= (p_from::timestamp at time zone 'Europe/Paris') and t.at < ((p_to + 1)::timestamp at time zone 'Europe/Paris')
        order by (t.at at time zone 'Europe/Paris')::date, t.n desc, t.at
      ) d
    ), '[]'::jsonb),
    'games', coalesce((
      select jsonb_agg(jsonb_build_object('g', g.game, 'n', g.n) order by g.n desc)
      from (select n.game, count(*) as n from private.presence_now n where n.at > now() - interval '100 seconds' and n.game is not null and private.an_level(n.user_id) = 0 group by n.game) g
    ), '[]'::jsonb)
  ) into r;
  return r;
end;
$$;
revoke all on function private.sd_m6(date, date, text) from public, anon, authenticated;

create or replace function public.admin_measures(p_from date default null, p_to date default null, p_game text default null, p_cc text default null, p_dev text default null, p_acct text default 'players')
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_today date := (now() at time zone 'Europe/Paris')::date;
  v_to date := least(coalesce(p_to, (now() at time zone 'Europe/Paris')::date), (now() at time zone 'Europe/Paris')::date);
  v_from date;
  v_acct text[];
  v_game text := nullif(btrim(coalesce(p_game, '')), '');
  v_cc text := nullif(upper(btrim(coalesce(p_cc, ''))), '');
  v_dev text := nullif(btrim(coalesce(p_dev, '')), '');
  v_gm integer[] := array[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 28, 29, 32, 33, 34, 35, 36, 37, 38, 43];
  v_step integer;
  v_pend integer;
  r jsonb;
begin
  v_from := greatest(least(coalesce(p_from, v_to - 29), v_to), v_to - 1095);
  v_acct := case coalesce(p_acct, 'players')
    when 'all' then array['anon', 'user', 'staff', 'test']
    when 'user' then array['user']
    when 'anon' then array['anon']
    when 'staff' then array['staff']
    when 'test' then array['test']
    else array['anon', 'user'] end;
  perform private.sd_roll_due(greatest(v_from - 30, v_today - 400), v_to, 45);
  select count(*) into v_pend
  from generate_series(greatest(v_from - 30, v_today - 400), v_to, interval '1 day') g(d)
  left join private.sd_mark m on m.day = g.d::date
  where m.day is null;
  v_step := case when v_to - v_from > 120 then 7 else 1 end;
  with r0 as materialized (
    select x.day, x.k, x.game, x.n, x.s
    from private.sd_roll x
    where x.day between v_from and v_to
      and x.acct = any (v_acct)
      and (v_cc is null or x.cc in (v_cc, '*'))
      and (v_dev is null or x.dev in (v_dev, '*'))
      and (v_game is null or x.game = v_game or (x.game = '' and coalesce(substring(x.k from '^m([0-9]+)')::int, 0) <> all (v_gm)))
  ), a0 as materialized (
    select a.day, a.who, a.born, a.hrs
    from private.sd_act a
    where a.day between v_from - 29 and v_to
      and a.game = coalesce(v_game, '')
      and a.acct = any (v_acct)
      and (v_cc is null or a.cc = v_cc)
      and (v_dev is null or a.dev = v_dev)
  ), c0 as (
    select distinct on (a.who) a.who, a.born
    from private.sd_act a
    where a.game = '' and a.born between v_from and v_to and a.acct = any (v_acct)
      and (v_cc is null or a.cc = v_cc) and (v_dev is null or a.dev = v_dev)
    order by a.who, a.day
  )
  select jsonb_build_object(
    'from', v_from, 'to', v_to, 'today', v_today, 'at', now(), 'pending', v_pend,
    'filters', jsonb_build_object('game', v_game, 'cc', v_cc, 'dev', v_dev, 'acct', coalesce(p_acct, 'players')),
    'rows', coalesce((
      select jsonb_agg(jsonb_build_array(q.k, q.game, q.n, round(q.s::numeric, 2)))
      from (
        select r0.k, r0.game, sum(r0.n) as n, sum(r0.s) as s from r0
        where r0.k not like 'm20:%' and r0.k not like 'm32:%'
        group by r0.k, r0.game
        union all
        select * from (select r0.k, '' as game, sum(r0.n) as n, sum(r0.s) as s from r0 where r0.k like 'm20:%' group by r0.k order by 3 desc, 1 limit 300) t20
        union all
        select * from (select r0.k, r0.game, sum(r0.n) as n, sum(r0.s) as s from r0 where r0.k like 'm32:%' group by r0.k, r0.game order by 3 desc, 1 limit 300) t32
      ) q
    ), '[]'::jsonb),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_array(q.day - v_from, q.f, q.n, round(q.s::numeric, 2)) order by q.day, q.f)
      from (
        select v_from + ((r0.day - v_from) / v_step) * v_step as day, split_part(r0.k, ':', 1) as f, sum(r0.n) as n, sum(r0.s) as s
        from r0
        group by 1, 2
      ) q
    ), '[]'::jsonb),
    'act', coalesce((
      select jsonb_agg(jsonb_build_object('d', q.d, 'dau', q.dau, 'wau', q.wau, 'mau', q.mau) order by q.d)
      from (
        select d.d::date as d,
          count(distinct a0.who) filter (where a0.day = d.d::date) as dau,
          count(distinct a0.who) filter (where a0.day > d.d::date - 7) as wau,
          count(distinct a0.who) as mau
        from generate_series(v_from, v_to, make_interval(days => v_step)) d(d)
        join a0 on a0.day > d.d::date - 30 and a0.day <= d.d::date
        group by 1
      ) q
    ), '[]'::jsonb),
    'ret', coalesce((
      select jsonb_agg(jsonb_build_object('wk', q.wk, 'n', q.n, 'e1', q.e1, 'r1', q.r1, 'e7', q.e7, 'r7', q.r7, 'e30', q.e30, 'r30', q.r30) order by q.wk)
      from (
        select date_trunc('week', c0.born)::date as wk, count(*) as n,
          count(*) filter (where c0.born + 1 <= v_today) as e1,
          count(*) filter (where c0.born + 1 <= v_today and exists (select 1 from private.sd_act b where b.who = c0.who and b.game = '' and b.day = c0.born + 1)) as r1,
          count(*) filter (where c0.born + 7 <= v_today) as e7,
          count(*) filter (where c0.born + 7 <= v_today and exists (select 1 from private.sd_act b where b.who = c0.who and b.game = '' and b.day = c0.born + 7)) as r7,
          count(*) filter (where c0.born + 30 <= v_today) as e30,
          count(*) filter (where c0.born + 30 <= v_today and exists (select 1 from private.sd_act b where b.who = c0.who and b.game = '' and b.day = c0.born + 30)) as r30
        from c0
        group by 1
      ) q
    ), '[]'::jsonb),
    'heat', coalesce((
      select jsonb_agg(jsonb_build_array(w.dw, h.h, round(coalesce(c.n, 0)::numeric / greatest(w.days, 1), 2)) order by w.dw, h.h)
      from (select g.dw, (select count(*) from generate_series(v_from, v_to, interval '1 day') z(d) where extract(isodow from z.d)::int - 1 = g.dw) as days from generate_series(0, 6) g(dw)) w
      cross join generate_series(0, 23) h(h)
      left join (
        select extract(isodow from a0.day)::int - 1 as dw, hh.h, count(*) as n
        from a0 cross join generate_series(0, 23) hh(h)
        where a0.day >= v_from and (a0.hrs >> hh.h) & 1 = 1
        group by 1, 2
      ) c on c.dw = w.dw and c.h = h.h
    ), '[]'::jsonb),
    'm6', private.sd_m6(v_from, v_to, v_game),
    'errs', coalesce((
      select jsonb_agg(to_jsonb(q) order by q.n desc)
      from (
        select distinct on (t.k, t.game) t.k, t.game, t.n, e.created_at as at, left(e.props ->> 'msg', 200) as msg, left(e.props ->> 'stk', 600) as stk, e.props ->> 'src' as src, private.jnum(e.props, 'line') as line, e.device
        from (select r0.k, r0.game, sum(r0.n) as n from r0 where r0.k like 'm32:%' group by 1, 2 order by 3 desc limit 40) t
        left join public.analytics_events e on e.event = 'error' and e.created_at >= (v_from::timestamp at time zone 'Europe/Paris') and coalesce(e.game_id, '-') = t.game and 'm32:' || private.sd_sig(e.props) = t.k
        order by t.k, t.game, e.created_at desc nulls last
      ) q
    ), '[]'::jsonb)
  ) into r;
  return r;
end;
$$;
revoke all on function public.admin_measures(date, date, text, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_measures(date, date, text, text, text, text) to authenticated;

create or replace function public.admin_measures_dims()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return jsonb_build_object(
    'cc', coalesce((select jsonb_agg(q.cc order by q.n desc) from (select x.cc, sum(x.n) as n from private.sd_roll x where x.k = 'm3.n' and x.cc not in ('', '*') group by x.cc) q), '[]'::jsonb),
    'dev', coalesce((select jsonb_agg(distinct x.dev) from private.sd_roll x where x.k = 'm3.n' and x.dev not in ('', '*')), '[]'::jsonb),
    'first', (select min(m.day) from private.sd_mark m)
  );
end;
$$;
revoke all on function public.admin_measures_dims() from public, anon, authenticated;
grant execute on function public.admin_measures_dims() to authenticated;

-- ============================================================================
-- 2026-11-13 Game services
-- ============================================================================

-- ============================================================================
-- 2026-11-13 One-time clean-ups (each runs once, recorded in private.once_done)
-- ============================================================================
create table if not exists private.once_done (
  id text primary key,
  at timestamptz not null default now()
);
alter table private.once_done enable row level security;
revoke all on table private.once_done from public, anon, authenticated;

do $$
begin
  if not exists (select 1 from private.once_done where id = '2026-11-13 analytics clean-up') then
    if not coalesce((select h.retention from private.housekeep h where h.id = 1), false) then
      perform set_config('statement_timeout', '0', true);
      delete from public.analytics_events a using public.analytics_events b
        where a.session_id = b.session_id and a.event = b.event and a.client_at = b.client_at and a.props = b.props and a.id > b.id;
      update public.analytics_events e set props = e.props - array['lh', 'wd', 'asn', 'city', 'isp']
        where e.event = 'env_geo' and e.props ?| array['lh', 'wd', 'asn', 'city', 'isp'];
      update public.analytics_events e set props = e.props - array['sw', 'sh', 'aw', 'ah']
        where e.event = 'env_scr' and e.props ?| array['sw', 'sh', 'aw', 'ah'];
      update public.analytics_events e set props = (e.props - 'adb') || case when jsonb_typeof(e.props -> 'langs') = 'array' and jsonb_array_length(e.props -> 'langs') > 1 then jsonb_build_object('langs', jsonb_build_array(e.props -> 'langs' -> 0)) else '{}'::jsonb end
        where e.event = 'env_dev' and (e.props ? 'adb' or (jsonb_typeof(e.props -> 'langs') = 'array' and jsonb_array_length(e.props -> 'langs') > 1));
      update public.analytics_events e set props = e.props - array['mdist', 'wheel', 'scr', 'copy', 'rsz']
        where e.event = 'sess_sum' and e.props ?| array['mdist', 'wheel', 'scr', 'copy', 'rsz'];
      update public.analytics_events e set props = e.props - array['ck', 'dnt', 'gpc', 'pdf', 'sab', 'coi', 'swk', 'notif', 'vib', 'bt', 'usb', 'ser', 'hid', 'xr', 'midi', 'share', 'wl', 'voices', 'mic', 'cam', 'spk', 'sr', 'ach',
          'h264', 'vp9', 'av1', 'hevc', 'mtex', 'glx', 'gpuv', 'quota', 'used', 'qb', 'pers', 'heap', 'bat', 'batb', 'chg', 'bench', 'benchb', 'loc', 'cal', 'num', 'hc', 'fdw', 'hist', 'plat', 'vend', 'ua']
        where e.event = 'env_caps' and e.props ?| array['ua', 'bat', 'mic', 'cam', 'bench', 'quota', 'dnt', 'gpc', 'plat', 'vend', 'hist', 'loc', 'voices', 'heap', 'ck'];
      update private.housekeep set retention = true where id = 1;
    end if;
    insert into private.once_done (id) values ('2026-11-13 analytics clean-up');
  end if;
end;
$$;

notify pgrst, 'reload schema';
