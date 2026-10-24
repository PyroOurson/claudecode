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
