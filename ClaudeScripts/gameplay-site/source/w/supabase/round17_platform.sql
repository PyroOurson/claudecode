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

create or replace function private.rate_sensitive(p_action text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_action in ('delete_account', 'export', 'username_change', 'username_check', 'username_check_h', 'friend_pair', 'report', 'report_d', 'login', 'login_ip', 'idea_create', 'idea_create_d');
$$;

create or replace function private.rate_scale(p_action text, p_max integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case when private.rate_sensitive(p_action) then p_max else p_max * 3 end;
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
  v_max integer := private.rate_scale(p_action, p_max);
  v_n integer;
  v_ip text := nullif(private.client_ip(), '');
begin
  if auth.uid() is not null and not private.rate_sensitive(p_action) and private.is_staff(auth.uid()) then
    return true;
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_k, 0));
  select count(*) into v_n from private.rate_hits h where h.k = v_k and h.at > now() - p_window;
  if v_n >= v_max then
    return false;
  end if;
  insert into private.rate_hits (k, action, uid, ip, full_hit) values (v_k, p_action, auth.uid(), case when v_ip is null then null else md5(v_ip) end, v_max > 1 and v_n + 1 >= v_max);
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
    raise exception 'rate_limited' using errcode = 'PT429', detail = p_action, hint = 'retry_after=' || coalesce(private.rate_wait(v_k, private.rate_scale(p_action, p_max), p_window), 60);
  end if;
end;
$$;
revoke all on function private.rate_sensitive(text) from public, anon, authenticated;
revoke all on function private.rate_scale(text, integer) from public, anon, authenticated;
revoke all on function private.rate_ok(text, integer, interval, text) from public, anon, authenticated;
revoke all on function private.rate_check(text, integer, interval, text) from public, anon, authenticated;

create or replace function public.my_limits()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('staff', private.is_staff(auth.uid()), 'scale', 3);
$$;
revoke all on function public.my_limits() from public, anon, authenticated;
grant execute on function public.my_limits() to authenticated;

create table if not exists private.presence_now (
  user_id uuid primary key references auth.users (id) on delete cascade,
  at timestamptz not null default now(),
  game text,
  hidden boolean not null default false,
  away boolean not null default false,
  party boolean not null default false
);
create index if not exists presence_now_at_idx on private.presence_now (at);
alter table private.presence_now enable row level security;
revoke all on table private.presence_now from public, anon, authenticated;

drop function if exists public.presence_beat(text, boolean, boolean, boolean);
create or replace function public.presence_beat(p_game text default null, p_hidden boolean default false, p_away boolean default false, p_party boolean default false, p_quiet boolean default false)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_game text := lower(btrim(coalesce(p_game, '')));
  v_staff boolean;
  v_on jsonb;
  v_n integer;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if v_game !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
    v_game := null;
  end if;
  if not private.over('pb:' || v_uid::text, date_trunc('minute', now()), 20) then
    insert into private.presence_now as n (user_id, at, game, hidden, away, party)
    values (v_uid, now(), v_game, coalesce(p_hidden, false), coalesce(p_away, false), coalesce(p_party, false))
    on conflict (user_id) do update set at = excluded.at, game = excluded.game, hidden = excluded.hidden, away = excluded.away, party = excluded.party;
    update public.profiles p set last_seen = now(), last_game = coalesce(v_game, p.last_game) where p.id = v_uid and (p.last_seen is null or p.last_seen < now() - interval '60 seconds');
    if random() < 0.02 then
      delete from private.presence_now where at < now() - interval '10 minutes';
    end if;
  end if;
  v_staff := private.is_staff(v_uid);
  select count(*) into v_n from private.presence_now n where n.at > now() - interval '100 seconds' and not n.hidden;
  select coalesce(jsonb_agg(jsonb_build_object('id', n.user_id, 'g', n.game, 'a', case when n.away then 1 else 0 end, 'p', case when n.party then 1 else 0 end, 'h', case when n.hidden then 1 else 0 end)), '[]'::jsonb) into v_on
  from private.presence_now n
  where n.at > now() - interval '100 seconds' and n.user_id <> v_uid
    and ((v_staff) or (not n.hidden and exists (select 1 from public.friends f where f.user_id = v_uid and f.friend_id = n.user_id)));
  return jsonb_build_object('n', v_n, 'on', v_on, 'staff', v_staff);
end;
$$;

create or replace function public.presence_bye()
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  delete from private.presence_now where user_id = auth.uid();
$$;
revoke all on function public.presence_beat(text, boolean, boolean, boolean, boolean) from public, anon, authenticated;
revoke all on function public.presence_bye() from public, anon, authenticated;
grant execute on function public.presence_beat(text, boolean, boolean, boolean, boolean) to authenticated;
grant execute on function public.presence_bye() to authenticated;
notify pgrst, 'reload schema';

create or replace function private.username_ok(p_name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_name is not null
    and p_name ~ '^[a-z0-9_.]{4,20}$'
    and p_name !~ '^\.|\.$|\.\.'
    and p_name not in ('admin', 'administrator', 'gameplay', 'support', 'help', 'root', 'system', 'moderator', 'mod', 'staff', 'official', 'owner', 'null', 'undefined', 'guest', 'anonymous', 'everyone', 'nobody', 'me', 'you');
$$;

alter table public.test_accounts add column if not exists diag boolean not null default false;

create or replace function private.is_test(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_uid is not null and exists (
    select 1 from public.test_accounts t join public.profiles p on p.id = t.user_id
    where t.user_id = p_uid and t.diag and p.role = 'user'
  );
$$;

create or replace function public.admin_set_diag(p_uid uuid, p_on boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  if not exists (select 1 from public.test_accounts t join public.profiles p on p.id = t.user_id where t.user_id = p_uid and p.role = 'user') then
    raise exception 'Diagnostics can only be switched on for an ordinary account created in the dashboard' using errcode = '22023';
  end if;
  update public.test_accounts t set diag = coalesce(p_on, false) where t.user_id = p_uid;
  perform private.admin_log('diag', p_uid, jsonb_build_object('on', coalesce(p_on, false)));
  return coalesce(p_on, false);
end;
$$;

create or replace function public.admin_diag_accounts()
returns table (user_id uuid, username text, email text, diag boolean, note text, created_at timestamptz, last_event timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return query
  select t.user_id, p.username, t.email, t.diag, t.note, t.created_at, (select max(d.at) from public.diag_events d where d.user_id = t.user_id)
  from public.test_accounts t
  join public.profiles p on p.id = t.user_id
  where p.role = 'user'
  order by t.diag desc, t.created_at desc;
end;
$$;
revoke all on function public.admin_set_diag(uuid, boolean) from public, anon, authenticated;
revoke all on function public.admin_diag_accounts() from public, anon, authenticated;
grant execute on function public.admin_set_diag(uuid, boolean) to authenticated;
grant execute on function public.admin_diag_accounts() to authenticated;

create or replace function public.admin_create_user(p_email text, p_username text, p_display text, p_password text, p_role text default 'user', p_note text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_role text := coalesce(nullif(lower(btrim(coalesce(p_role, ''))), ''), 'user');
  v_out jsonb;
  v_id uuid;
  v_name text := private.clean_text(p_display, 32);
begin
  if v_role not in ('user', 'admin', 'owner') then
    raise exception 'Role must be user, admin or owner' using errcode = '22023';
  end if;
  if v_role <> 'user' then
    perform private.need_owner();
  end if;
  v_out := public.admin_create_test_account(p_username, p_password, p_email, p_note);
  v_id := (v_out ->> 'id')::uuid;
  update public.profiles p set display_name = coalesce(v_name, p.display_name), role = v_role where p.id = v_id;
  if v_role <> 'user' then
    delete from public.test_accounts t where t.user_id = v_id;
  end if;
  perform private.admin_log('create_user', v_id, jsonb_build_object('email', v_out ->> 'email', 'role', v_role));
  return v_out || jsonb_build_object('display_name', coalesce(v_name, v_out ->> 'username'), 'role', v_role);
end;
$$;

create or replace function private.rate_sensitive(p_action text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_action in ('delete_account', 'export', 'username_change', 'username_check', 'username_check_h', 'friend_pair', 'report', 'report_d', 'login', 'login_ip', 'idea_create', 'idea_create_d', 'log_chat', 'log_chat_h');
$$;

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
  if not private.rate_ok('log_chat', 60, interval '1 minute') or not private.rate_ok('log_chat_h', 900, interval '1 hour') then
    return;
  end if;
  insert into public.chat_log (user_id, kind, game, room, body)
  values (v_uid, p_kind, left(nullif(btrim(coalesce(p_game, '')), ''), 40), upper(left(nullif(regexp_replace(coalesce(p_room, ''), '[^A-Za-z0-9]', '', 'g'), ''), 16)), v_body);
  if random() < 0.01 then
    delete from public.chat_log where created_at < now() - interval '365 days';
  end if;
end;
$$;

create or replace function public.presence_beat(p_game text default null, p_hidden boolean default false, p_away boolean default false, p_party boolean default false, p_quiet boolean default false)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_game text := lower(btrim(coalesce(p_game, '')));
  v_staff boolean;
  v_on jsonb;
  v_games jsonb;
  v_n integer;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if private.over('pb:' || v_uid::text, date_trunc('minute', now()), 20) then
    return '{}'::jsonb;
  end if;
  if v_game !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
    v_game := null;
  end if;
  if coalesce(p_quiet, false) and exists (select 1 from private.presence_now n where n.user_id = v_uid and n.at > now() - interval '70 seconds') then
    null;
  else
    insert into private.presence_now as n (user_id, at, game, hidden, away, party)
    values (v_uid, now(), v_game, coalesce(p_hidden, false), coalesce(p_away, false), coalesce(p_party, false))
    on conflict (user_id) do update set at = excluded.at, game = excluded.game, hidden = excluded.hidden, away = excluded.away, party = excluded.party;
    update public.profiles p set last_seen = now(), last_game = coalesce(v_game, p.last_game) where p.id = v_uid and (p.last_seen is null or p.last_seen < now() - interval '60 seconds');
  end if;
  if random() < 0.02 then
    delete from private.presence_now where at < now() - interval '10 minutes';
  end if;
  v_staff := private.is_staff(v_uid);
  select count(*) into v_n from private.presence_now n where n.at > now() - interval '100 seconds' and not n.hidden;
  select coalesce(jsonb_object_agg(x.game, x.c), '{}'::jsonb) into v_games
  from (select n.game, count(*) as c from private.presence_now n where n.at > now() - interval '100 seconds' and not n.hidden and n.game is not null group by n.game) x;
  select coalesce(jsonb_agg(jsonb_build_object('id', n.user_id, 'g', n.game, 'a', case when n.away then 1 else 0 end, 'p', case when n.party then 1 else 0 end, 'h', case when n.hidden then 1 else 0 end)), '[]'::jsonb) into v_on
  from private.presence_now n
  where n.at > now() - interval '100 seconds' and n.user_id <> v_uid
    and ((v_staff) or (not n.hidden and exists (select 1 from public.friends f where f.user_id = v_uid and f.friend_id = n.user_id)));
  return jsonb_build_object('n', v_n, 'on', v_on, 'games', v_games, 'staff', v_staff);
end;
$$;
notify pgrst, 'reload schema';
