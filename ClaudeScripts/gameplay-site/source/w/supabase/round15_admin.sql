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
