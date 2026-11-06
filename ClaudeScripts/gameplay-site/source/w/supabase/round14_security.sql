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
