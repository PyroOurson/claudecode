create schema if not exists private;
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

create unique index if not exists profiles_username_lower_key on public.profiles (lower(username));

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

create or replace function public.find_profiles(p_query text)
returns table (id uuid, username text, display_name text, avatar_url text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.username, p.display_name, p.avatar_url
  from public.profiles p
  where char_length(regexp_replace(lower(coalesce(p_query, '')), '[^a-z0-9_.]', '', 'g')) >= 3
    and p.username like replace(regexp_replace(lower(coalesce(p_query, '')), '[^a-z0-9_.]', '', 'g'), '_', '\_') || '%'
  order by (p.username = regexp_replace(lower(coalesce(p_query, '')), '[^a-z0-9_.]', '', 'g')) desc, p.username
  limit 10;
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
revoke all on function public.find_profiles(text) from public;
revoke all on function public.sync_game_stats(uuid, jsonb) from public;
revoke all on function public.send_friend_request(text) from public;
revoke all on function public.respond_friend_request(bigint, boolean) from public;
revoke all on function public.remove_friend(uuid) from public;
revoke all on function public.my_friends() from public;
revoke all on function public.my_friend_requests() from public;
revoke all on function public.export_my_data() from public;
revoke all on function public.delete_my_account() from public;
revoke all on function public.username_available(text) from anon, authenticated;
revoke all on function public.find_profiles(text) from anon, authenticated;
revoke all on function public.sync_game_stats(uuid, jsonb) from anon, authenticated;
revoke all on function public.send_friend_request(text) from anon, authenticated;
revoke all on function public.respond_friend_request(bigint, boolean) from anon, authenticated;
revoke all on function public.remove_friend(uuid) from anon, authenticated;
revoke all on function public.my_friends() from anon, authenticated;
revoke all on function public.my_friend_requests() from anon, authenticated;
revoke all on function public.export_my_data() from anon, authenticated;
revoke all on function public.delete_my_account() from anon, authenticated;

grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.find_profiles(text) to anon, authenticated;
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
