create table if not exists public.chat_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('party', 'game')),
  game text check (game is null or char_length(game) <= 40),
  room text check (room is null or char_length(room) <= 16),
  body text not null check (char_length(body) <= 500),
  created_at timestamptz not null default now()
);
create index if not exists chat_log_user_idx on public.chat_log (user_id, kind, id desc);
create index if not exists chat_log_room_idx on public.chat_log (room, created_at) where room is not null;
create index if not exists chat_log_time_idx on public.chat_log (created_at);
alter table public.chat_log enable row level security;
revoke all on public.chat_log from anon, authenticated;
grant all on public.chat_log to service_role;

create index if not exists dms_from_idx on public.dms (from_id, id desc);
create index if not exists dms_to_idx on public.dms (to_id, id desc);

create or replace function public.log_chat(p_kind text, p_game text, p_room text, p_body text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_body text;
begin
  if v_uid is null or p_kind is null or p_kind not in ('party', 'game') then
    return;
  end if;
  v_body := nullif(btrim(regexp_replace(left(coalesce(p_body, ''), 500), E'[\\x01-\\x1f\\x7f]', ' ', 'g')), '');
  if v_body is null then
    return;
  end if;
  if not private.rate_ok('log_chat', 90, interval '1 minute') then
    return;
  end if;
  insert into public.chat_log (user_id, kind, game, room, body)
  values (v_uid, p_kind, left(nullif(btrim(coalesce(p_game, '')), ''), 40), upper(left(nullif(regexp_replace(coalesce(p_room, ''), '[^A-Za-z0-9]', '', 'g'), ''), 16)), v_body);
  if random() < 0.01 then
    delete from public.chat_log where created_at < now() - interval '365 days';
  end if;
end;
$$;

create or replace function public.admin_user_chat(p_uid uuid, p_kind text default 'dm', p_before bigint default null, p_limit integer default 60)
returns table (id bigint, created_at timestamptz, kind text, game text, room text, body text, outgoing boolean, other uuid, other_username text, other_display text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_lim integer := greatest(1, least(coalesce(p_limit, 60), 200));
begin
  if p_kind is null or p_kind not in ('dm', 'party', 'game') then
    raise exception 'Unknown kind' using errcode = '22023';
  end if;
  if p_before is null and not exists (select 1 from public.admin_log l where l.admin_id = v_me and l.action = 'view_chat' and l.target_user = p_uid and l.detail ->> 'kind' = p_kind and l.at > now() - interval '30 minutes') then
    perform private.admin_log('view_chat', p_uid, jsonb_build_object('kind', p_kind));
  end if;
  if p_kind = 'dm' then
    return query
      select d.id, d.created_at, d.kind, d.meta ->> 'game', d.meta ->> 'code', d.body, d.from_id = p_uid,
        case when d.from_id = p_uid then d.to_id else d.from_id end, op.username, op.display_name
      from public.dms d
      left join public.profiles op on op.id = case when d.from_id = p_uid then d.to_id else d.from_id end
      where (d.from_id = p_uid or d.to_id = p_uid) and (p_before is null or d.id < p_before)
      order by d.id desc
      limit v_lim;
  else
    return query
      select c.id, c.created_at, c.kind, c.game, c.room, c.body, true, null::uuid, null::text, null::text
      from public.chat_log c
      where c.user_id = p_uid and c.kind = p_kind and (p_before is null or c.id < p_before)
      order by c.id desc
      limit v_lim;
  end if;
end;
$$;

create or replace function public.admin_room_chat(p_room text, p_at timestamptz)
returns table (id bigint, created_at timestamptz, kind text, game text, user_id uuid, username text, display_name text, body text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.need_admin();
  return query
    select c.id, c.created_at, c.kind, c.game, c.user_id, p.username, p.display_name, c.body
    from public.chat_log c
    left join public.profiles p on p.id = c.user_id
    where c.room = upper(p_room) and c.created_at between p_at - interval '3 hours' and p_at + interval '3 hours'
    order by c.created_at, c.id
    limit 400;
end;
$$;

create or replace function public.admin_chat_search(p_q text, p_limit integer default 100)
returns table (id bigint, created_at timestamptz, kind text, game text, room text, user_id uuid, username text, display_name text, other_username text, body text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_q text := btrim(coalesce(p_q, ''));
  v_lim integer := greatest(1, least(coalesce(p_limit, 100), 300));
begin
  if char_length(v_q) < 2 then
    return;
  end if;
  perform private.admin_log('search_chat', null, jsonb_build_object('q', left(v_q, 80)));
  return query
    select * from (
      select c.id, c.created_at, c.kind, c.game, c.room, c.user_id, p.username, p.display_name, null::text, c.body
      from public.chat_log c left join public.profiles p on p.id = c.user_id
      where c.body ilike '%' || replace(replace(v_q, '%', '\%'), '_', '\_') || '%'
      union all
      select d.id, d.created_at, 'dm'::text, d.meta ->> 'game', null::text, d.from_id, p.username, p.display_name, t.username, d.body
      from public.dms d left join public.profiles p on p.id = d.from_id left join public.profiles t on t.id = d.to_id
      where d.kind = 'text' and d.body ilike '%' || replace(replace(v_q, '%', '\%'), '_', '\_') || '%'
    ) x
    order by x.created_at desc
    limit v_lim;
end;
$$;

revoke all on function public.log_chat(text, text, text, text) from public, anon, authenticated;
revoke all on function public.admin_user_chat(uuid, text, bigint, integer) from public, anon, authenticated;
revoke all on function public.admin_room_chat(text, timestamptz) from public, anon, authenticated;
revoke all on function public.admin_chat_search(text, integer) from public, anon, authenticated;
grant execute on function public.log_chat(text, text, text, text) to authenticated;
grant execute on function public.admin_user_chat(uuid, text, bigint, integer) to authenticated;
grant execute on function public.admin_room_chat(text, timestamptz) to authenticated;
grant execute on function public.admin_chat_search(text, integer) to authenticated;
