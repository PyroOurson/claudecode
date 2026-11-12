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

create or replace view admin.events_who with (security_invoker = true) as
select e.id, e.created_at, e.client_at, e.session_id, e.visitor_id, e.user_id, e.event, e.game_id, e.props, e.device,
  e.who,
  (e.created_at at time zone 'Europe/Paris')::date as day
from private.an_ev e;

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
