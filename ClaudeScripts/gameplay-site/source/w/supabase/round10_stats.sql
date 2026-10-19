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
    'hour', private.ins_top('env_caps', 'hc', v_since, 4),
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
