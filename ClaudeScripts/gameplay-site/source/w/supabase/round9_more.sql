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
