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
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin'));
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
