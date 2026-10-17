drop function if exists public.admin_list_users();
create or replace function public.admin_list_users()
returns table (id uuid, created_at timestamptz, last_sign_in_at timestamptz, last_seen timestamptz, providers text[], email_confirmed boolean, email_confirmed_at timestamptz, last_lang text, last_game text, role text, email text, username text, display_name text, friends integer, fav_game text, locked boolean, locked_reason text, has_password boolean, seconds_played bigint, plays bigint)
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
      coalesce(p.locked, false), p.locked_reason,
      coalesce(u.encrypted_password, '') <> '',
      (select coalesce(sum(s.seconds_played), 0)::bigint from public.game_stats s where s.user_id = u.id),
      (select coalesce(sum(s.plays), 0)::bigint from public.game_stats s where s.user_id = u.id)
    from auth.users u
    left join public.profiles p on p.id = u.id
    where u.deleted_at is null
    order by u.created_at desc
    limit 10000;
end;
$$;

create or replace function public.admin_user_games(p_uid uuid)
returns table (game_id text, plays integer, seconds_played integer, best_score double precision, last_played timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  return query select s.game_id, s.plays::integer, s.seconds_played::integer, s.best_score::double precision, s.last_played from public.game_stats s where s.user_id = p_uid order by s.seconds_played desc, s.plays desc;
end;
$$;

create or replace function public.admin_set_username(p_uid uuid, p_name text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_name text := lower(btrim(coalesce(p_name, '')));
begin
  perform private.need_admin();
  if not private.username_ok(v_name) then
    raise exception 'Username not allowed' using errcode = '22023';
  end if;
  if exists (select 1 from public.profiles p where p.username = v_name and p.id <> p_uid) then
    raise exception 'Username taken' using errcode = '23505';
  end if;
  update public.profiles p set username = v_name where p.id = p_uid;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  return v_name;
end;
$$;

create table if not exists public.dms (
  id bigint generated always as identity primary key,
  from_id uuid not null references auth.users (id) on delete cascade,
  to_id uuid not null references auth.users (id) on delete cascade,
  kind text not null default 'text' check (kind in ('text', 'image', 'invite', 'join')),
  body text check (body is null or char_length(body) <= 2000),
  meta jsonb not null default '{}'::jsonb check (pg_column_size(meta) <= 4096),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists dms_pair_idx on public.dms (least(from_id, to_id), greatest(from_id, to_id), id desc);
create index if not exists dms_unread_idx on public.dms (to_id) where read_at is null;
alter table public.dms enable row level security;
revoke all on public.dms from anon, authenticated;
grant all on public.dms to service_role;

create or replace function public.admin_delete_user(p_uid uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  if p_uid = v_me then
    raise exception 'You cannot delete your own account here' using errcode = '42501';
  end if;
  if exists (select 1 from public.profiles p where p.id = p_uid and p.role = 'admin') then
    raise exception 'Make this admin a regular user first' using errcode = '42501';
  end if;
  if not exists (select 1 from auth.users u where u.id = p_uid) then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  update public.analytics_events set user_id = null where user_id = p_uid;
  delete from public.dms where from_id = p_uid or to_id = p_uid;
  delete from public.friends where user_id = p_uid or friend_id = p_uid;
  delete from public.friend_requests where from_id = p_uid or to_id = p_uid;
  delete from auth.users where id = p_uid;
  return 'deleted';
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
  if not exists (select 1 from public.friends f where f.user_id = v_me and f.friend_id = p_to) then
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
  elsif v_kind = 'image' then
    if coalesce(p_meta ->> 'path', '') !~ ('^' || v_me::text || '/' || p_to::text || '/[a-z0-9-]{8,64}\.(webp|jpg|png|gif)$') then
      raise exception 'Bad image' using errcode = '22023';
    end if;
    v_meta := jsonb_build_object('path', p_meta ->> 'path', 'w', least(greatest(coalesce((p_meta ->> 'w')::int, 0), 0), 8000), 'h', least(greatest(coalesce((p_meta ->> 'h')::int, 0), 0), 8000));
  elsif v_kind in ('invite', 'join') then
    if coalesce(p_meta ->> 'game', '') !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
      raise exception 'Bad game' using errcode = '22023';
    end if;
    if v_kind = 'invite' and coalesce(p_meta ->> 'code', '') !~ '^[A-Z0-9]{3,8}$' then
      raise exception 'Bad code' using errcode = '22023';
    end if;
    v_meta := jsonb_build_object('game', p_meta ->> 'game') || case when v_kind = 'invite' then jsonb_build_object('code', p_meta ->> 'code') else '{}'::jsonb end;
  else
    raise exception 'Bad kind' using errcode = '22023';
  end if;
  insert into public.dms (from_id, to_id, kind, body, meta) values (v_me, p_to, v_kind, v_body, v_meta) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.dm_thread(p_with uuid, p_after bigint default 0)
returns table (id bigint, mine boolean, kind text, body text, meta jsonb, created_at timestamptz, read_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select * from (
    select d.id, d.from_id = auth.uid(), d.kind, d.body, d.meta, d.created_at, d.read_at
    from public.dms d
    where auth.uid() is not null
      and ((d.from_id = auth.uid() and d.to_id = p_with) or (d.to_id = auth.uid() and d.from_id = p_with))
      and d.id > coalesce(p_after, 0)
    order by d.id desc
    limit 200
  ) t order by t.id;
$$;

create or replace function public.dm_read(p_with uuid)
returns integer
language sql
volatile
security definer
set search_path = ''
as $$
  with u as (update public.dms d set read_at = now() where d.to_id = auth.uid() and d.from_id = p_with and d.read_at is null returning 1)
  select count(*)::integer from u;
$$;

create or replace function public.dm_inbox()
returns table (other_id uuid, last_id bigint, last_kind text, last_body text, last_mine boolean, last_at timestamptz, unread integer)
language sql
stable
security definer
set search_path = ''
as $$
  select o.other_id, l.id, l.kind, l.body, l.from_id = auth.uid(), l.created_at,
    (select count(*)::integer from public.dms x where x.to_id = auth.uid() and x.from_id = o.other_id and x.read_at is null)
  from (
    select distinct case when d.from_id = auth.uid() then d.to_id else d.from_id end as other_id
    from public.dms d where auth.uid() is not null and (d.from_id = auth.uid() or d.to_id = auth.uid())
  ) o
  cross join lateral (
    select d.* from public.dms d
    where (d.from_id = auth.uid() and d.to_id = o.other_id) or (d.to_id = auth.uid() and d.from_id = o.other_id)
    order by d.id desc limit 1
  ) l
  order by l.id desc;
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
        from public.analytics_events x where x.event = 'error' and x.game_id is not null group by x.game_id
      ) e on e.game_id = coalesce(m.game_id, t.game_id)
      full join admin.account_game_totals a on a.game_id = coalesce(m.game_id, t.game_id, e.game_id)
    ) g), '[]'::jsonb),
    'players', coalesce((select jsonb_agg(to_jsonb(p)) from (
      select s.user_id, pr.username, pr.display_name, s.game_id, s.plays, s.seconds_played, s.best_score, s.last_played
      from public.game_stats s left join public.profiles pr on pr.id = s.user_id
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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dm', 'dm', false, 3145728, array['image/webp', 'image/jpeg', 'image/png', 'image/gif'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "dm: upload to friend" on storage.objects;
create policy "dm: upload to friend" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'dm'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.friends f where f.user_id = (select auth.uid()) and f.friend_id::text = (storage.foldername(name))[2])
    and not exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.locked)
  );
drop policy if exists "dm: read own conversations" on storage.objects;
create policy "dm: read own conversations" on storage.objects for select to authenticated
  using (bucket_id = 'dm' and (select auth.uid())::text in ((storage.foldername(name))[1], (storage.foldername(name))[2]));

revoke all on function public.admin_list_users() from public, anon, authenticated;
revoke all on function public.admin_user_games(uuid) from public, anon, authenticated;
revoke all on function public.admin_set_username(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_delete_user(uuid) from public, anon, authenticated;
revoke all on function public.admin_stats() from public, anon, authenticated;
revoke all on function public.dm_send(uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.dm_thread(uuid, bigint) from public, anon, authenticated;
revoke all on function public.dm_read(uuid) from public, anon, authenticated;
revoke all on function public.dm_inbox() from public, anon, authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_user_games(uuid) to authenticated;
grant execute on function public.admin_set_username(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.dm_send(uuid, text, text, jsonb) to authenticated;
grant execute on function public.dm_thread(uuid, bigint) to authenticated;
grant execute on function public.dm_read(uuid) to authenticated;
grant execute on function public.dm_inbox() to authenticated;
