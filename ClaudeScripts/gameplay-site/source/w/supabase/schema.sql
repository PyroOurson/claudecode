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

create or replace function public.my_status()
returns table (role text, locked boolean, locked_reason text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.role, p.locked, p.locked_reason from public.profiles p where p.id = auth.uid();
$$;

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
