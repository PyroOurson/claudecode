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
