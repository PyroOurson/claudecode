create or replace function private.is_test(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_uid is not null and exists (select 1 from public.test_accounts t where t.user_id = p_uid);
$$;
revoke all on function private.is_test(uuid) from public, anon, authenticated;

create table if not exists public.diag_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  sid text not null,
  seq integer not null,
  at timestamptz not null,
  kind text not null,
  data jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists diag_events_sid_seq_idx on public.diag_events (user_id, sid, seq);
create index if not exists diag_events_created_idx on public.diag_events (created_at);
create index if not exists diag_events_kind_idx on public.diag_events (user_id, kind, at desc);
alter table public.diag_events enable row level security;
revoke all on table public.diag_events from public, anon, authenticated;

create or replace function public.diag_enabled()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_test(auth.uid());
$$;

create or replace function public.diag_push(p_sid text, p_events jsonb)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_n integer := 0;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if not private.is_test(v_uid) then
    raise exception 'Not a test account' using errcode = '42501';
  end if;
  if p_sid is null or p_sid !~ '^[a-z0-9]{6,24}$' then
    raise exception 'Bad session id' using errcode = '22023';
  end if;
  if p_events is null or jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) > 500 or octet_length(p_events::text) > 2000000 then
    raise exception 'Bad batch' using errcode = '22023';
  end if;
  insert into public.diag_events (user_id, sid, seq, at, kind, data)
  select v_uid, p_sid, (e->>'q')::integer, to_timestamp(least(greatest((e->>'t')::double precision, 0), 4102444800000) / 1000.0), left(coalesce(e->>'k', '?'), 24), e->'d'
  from jsonb_array_elements(p_events) e
  where jsonb_typeof(e) = 'object' and (e->>'q') ~ '^[0-9]{1,9}$' and (e->>'t') ~ '^[0-9]{1,15}(\.[0-9]+)?$'
  on conflict (user_id, sid, seq) do nothing;
  get diagnostics v_n = row_count;
  if random() < 0.02 then
    delete from public.diag_events where created_at < now() - interval '30 days';
  end if;
  return v_n;
end;
$$;

create or replace function public.admin_diag_sessions(p_uid uuid default null, p_limit integer default 100)
returns table (user_id uuid, username text, sid text, first_at timestamptz, last_at timestamptz, events bigint, errors bigint, failed_requests bigint, games text[], page text, agent text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return query
  select d.user_id, p.username, d.sid, min(d.at), max(d.at), count(*),
    count(*) filter (where d.kind = 'err' or (d.kind = 'log' and d.data->>'l' = 'error')),
    count(*) filter (where d.kind = 'res' and (d.data ? 'e' or coalesce((d.data->>'s')::integer, 0) >= 400)),
    array_remove(array_agg(distinct case when d.kind = 'game' then d.data->>'id' end), null),
    max(case when d.kind = 'boot' then d.data->>'u' end),
    max(case when d.kind = 'boot' then d.data->>'ua' end)
  from public.diag_events d
  left join public.profiles p on p.id = d.user_id
  where p_uid is null or d.user_id = p_uid
  group by d.user_id, p.username, d.sid
  order by max(d.at) desc
  limit least(greatest(coalesce(p_limit, 100), 1), 500);
end;
$$;

create or replace function public.admin_diag_events(p_sid text, p_after integer default 0, p_limit integer default 500, p_kinds text[] default null)
returns table (seq integer, at timestamptz, kind text, data jsonb)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return query
  select d.seq, d.at, d.kind, d.data
  from public.diag_events d
  where d.sid = p_sid and d.seq > coalesce(p_after, 0) and (p_kinds is null or d.kind = any (p_kinds))
  order by d.seq
  limit least(greatest(coalesce(p_limit, 500), 1), 2000);
end;
$$;

create or replace function public.admin_diag_clear(p_sid text default null)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_n integer;
begin
  delete from public.diag_events d where p_sid is null or d.sid = p_sid;
  get diagnostics v_n = row_count;
  perform private.admin_log('diag_clear', null, jsonb_build_object('sid', p_sid, 'rows', v_n));
  return v_n;
end;
$$;

revoke all on function public.diag_enabled() from public, anon, authenticated;
revoke all on function public.diag_push(text, jsonb) from public, anon, authenticated;
revoke all on function public.admin_diag_sessions(uuid, integer) from public, anon, authenticated;
revoke all on function public.admin_diag_events(text, integer, integer, text[]) from public, anon, authenticated;
revoke all on function public.admin_diag_clear(text) from public, anon, authenticated;
grant execute on function public.diag_enabled() to authenticated;
grant execute on function public.diag_push(text, jsonb) to authenticated;
grant execute on function public.admin_diag_sessions(uuid, integer) to authenticated;
grant execute on function public.admin_diag_events(text, integer, integer, text[]) to authenticated;
grant execute on function public.admin_diag_clear(text) to authenticated;
notify pgrst, 'reload schema';
