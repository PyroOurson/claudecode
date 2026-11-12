create or replace function private.file_class(p_ext text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_ext in ('png', 'jpg', 'webp', 'gif') then 'image'
    when p_ext in ('pdf', 'txt', 'md', 'csv', 'json', 'log', 'zip') then 'file'
  end;
$$;

create or replace function private.file_mime(p_ext text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case p_ext
    when 'png' then 'image/png'
    when 'jpg' then 'image/jpeg'
    when 'webp' then 'image/webp'
    when 'gif' then 'image/gif'
    when 'pdf' then 'application/pdf'
    when 'txt' then 'text/plain'
    when 'log' then 'text/plain'
    when 'md' then 'text/markdown'
    when 'csv' then 'text/csv'
    when 'json' then 'application/json'
    when 'zip' then 'application/zip'
  end;
$$;

create or replace function private.files_clean(p_bucket text, p_prefix text, p_files jsonb, p_max integer default 4)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_out jsonb := '[]'::jsonb;
  v_it jsonb;
  v_one jsonb;
  v_path text;
  v_ext text;
  v_class text;
  v_name text;
  v_owner text;
  v_meta jsonb;
  v_size bigint;
  v_max bigint;
  v_tail text;
  v_w integer;
  v_h integer;
begin
  if p_files is null or jsonb_typeof(p_files) = 'null' then
    return v_out;
  end if;
  if v_me is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if jsonb_typeof(p_files) <> 'array' then
    raise exception 'Bad attachment' using errcode = '22023';
  end if;
  if jsonb_array_length(p_files) > greatest(coalesce(p_max, 4), 0) then
    raise exception 'Too many attachments' using errcode = '22023';
  end if;
  for v_it in select e from jsonb_array_elements(p_files) e loop
    v_path := case when jsonb_typeof(v_it) = 'object' then v_it ->> 'path' end;
    if v_path is null or v_path !~ ('^' || p_prefix || '/[a-z0-9-]{8,64}\.(png|jpg|webp|gif|pdf|txt|md|csv|json|log|zip)$') then
      raise exception 'Bad attachment' using errcode = '22023';
    end if;
    if v_out @> jsonb_build_array(jsonb_build_object('path', v_path)) then
      raise exception 'Bad attachment' using errcode = '22023';
    end if;
    v_ext := substring(v_path from '\.([a-z0-9]+)$');
    v_class := private.file_class(v_ext);
    v_owner := null;
    v_meta := null;
    select o.owner_id, o.metadata into v_owner, v_meta
      from storage.objects o
      where o.bucket_id = p_bucket and o.name = v_path
      order by o.created_at desc
      limit 1;
    if v_owner is null or v_owner <> v_me::text or v_meta is null then
      raise exception 'Attachment not found' using errcode = '22023';
    end if;
    v_size := case when (v_meta ->> 'size') ~ '^[0-9]{1,12}$' then (v_meta ->> 'size')::bigint else 0 end;
    v_max := case when v_class = 'image' then 5242880 else 8388608 end;
    if v_size <= 0 or v_size > v_max then
      raise exception 'Attachment too large' using errcode = '22023';
    end if;
    if lower(btrim(split_part(coalesce(v_meta ->> 'mimetype', ''), ';', 1))) <> private.file_mime(v_ext) then
      raise exception 'Bad attachment type' using errcode = '22023';
    end if;
    v_name := coalesce(private.clean_text(regexp_replace(coalesce(v_it ->> 'name', ''), '[\u202A-\u202E\u2066-\u2069\u200B-\u200F/\\]', '', 'g'), 120), 'file');
    v_tail := '\.' || replace(v_ext, 'jpg', '(jpg|jpeg)') || '$';
    if lower(v_name) !~ v_tail then
      v_name := left(v_name, 110) || '.' || v_ext;
    end if;
    v_one := jsonb_build_object('path', v_path, 'name', v_name, 'size', v_size, 'type', private.file_mime(v_ext), 'kind', v_class);
    if v_class = 'image' then
      v_w := case when (v_it ->> 'w') ~ '^[0-9]{1,5}$' then (v_it ->> 'w')::integer else 0 end;
      v_h := case when (v_it ->> 'h') ~ '^[0-9]{1,5}$' then (v_it ->> 'h')::integer else 0 end;
      if v_w between 1 and 20000 and v_h between 1 and 20000 then
        v_one := v_one || jsonb_build_object('w', v_w, 'h', v_h);
      end if;
    end if;
    v_out := v_out || jsonb_build_array(v_one);
  end loop;
  return v_out;
end;
$$;

create or replace function private.long_text(p_text text, p_max integer)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(left(btrim(regexp_replace(regexp_replace(replace(left(coalesce(p_text, ''), p_max * 2), E'\r', ''), E'[\\x01-\\x09\\x0b-\\x1f\\x7f]', '', 'g'), E'\n{3,}', E'\n\n', 'g')), p_max), '');
$$;

create or replace function private.need_user()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles p where p.id = v_uid and p.locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  return v_uid;
end;
$$;

create or replace function private.file_used(p_bucket text, p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_bucket = 'ideas' then
    return exists (select 1 from public.ideas i where i.attachments @> jsonb_build_array(jsonb_build_object('path', p_name)));
  elsif p_bucket = 'tickets' then
    return exists (select 1 from public.ticket_messages m where m.attachments @> jsonb_build_array(jsonb_build_object('path', p_name)));
  elsif p_bucket = 'dm' then
    return exists (select 1 from public.dms d where d.kind in ('image', 'file') and d.meta ->> 'path' = p_name);
  end if;
  return true;
end;
$$;

create or replace function private.files_rm(p_bucket text, p_paths text[])
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_n integer := 0;
begin
  if p_bucket is null or p_bucket not in ('ideas', 'tickets', 'dm') or p_paths is null or cardinality(p_paths) = 0 then
    return 0;
  end if;
  perform set_config('storage.allow_delete_query', 'true', true);
  delete from storage.objects o where o.bucket_id = p_bucket and o.name = any (p_paths);
  get diagnostics v_n = row_count;
  perform set_config('storage.allow_delete_query', 'false', true);
  return v_n;
end;
$$;

create or replace function private.files_sweep(p_uid uuid default null)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_n integer := 0;
begin
  perform set_config('storage.allow_delete_query', 'true', true);
  delete from storage.objects o
    where o.bucket_id in ('ideas', 'tickets', 'dm')
      and (p_uid is null or o.name like p_uid::text || '/%')
      and not private.file_used(o.bucket_id, o.name)
      and (o.created_at < now() - interval '1 hour' or not exists (select 1 from public.profiles p where p.id::text = split_part(o.name, '/', 1)));
  get diagnostics v_n = row_count;
  perform set_config('storage.allow_delete_query', 'false', true);
  return v_n;
end;
$$;

create or replace function private.files_drop_user(p_uid uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_n integer := 0;
  v_paths text[];
begin
  if p_uid is null then
    return 0;
  end if;
  select array_agg(a ->> 'path') into v_paths
    from public.tickets t
    join public.ticket_messages m on m.ticket_id = t.id
    cross join lateral jsonb_array_elements(m.attachments) a
    where t.user_id = p_uid;
  perform set_config('storage.allow_delete_query', 'true', true);
  delete from storage.objects o
    where (o.bucket_id in ('ideas', 'tickets', 'dm') and o.name like p_uid::text || '/%')
      or (o.bucket_id = 'dm' and o.name like '%/' || p_uid::text || '/%')
      or (o.bucket_id = 'tickets' and v_paths is not null and o.name = any (v_paths));
  get diagnostics v_n = row_count;
  perform set_config('storage.allow_delete_query', 'false', true);
  return v_n;
end;
$$;

revoke all on function private.file_class(text) from public, anon, authenticated;
revoke all on function private.file_mime(text) from public, anon, authenticated;
revoke all on function private.files_clean(text, text, jsonb, integer) from public, anon, authenticated;
revoke all on function private.long_text(text, integer) from public, anon, authenticated;
revoke all on function private.need_user() from public, anon, authenticated;
revoke all on function private.file_used(text, text) from public, anon, authenticated;
revoke all on function private.files_rm(text, text[]) from public, anon, authenticated;
revoke all on function private.files_sweep(uuid) from public, anon, authenticated;
revoke all on function private.files_drop_user(uuid) from public, anon, authenticated;

create table if not exists public.ideas (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  game text,
  ctx jsonb not null default '{}'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  status text not null default 'new',
  reply text,
  reply_at timestamptz,
  reply_by uuid references auth.users (id) on delete set null,
  fresh boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ideas drop constraint if exists ideas_kind_check;
alter table public.ideas add constraint ideas_kind_check check (kind in ('game', 'improvement', 'bug', 'patch', 'other'));
alter table public.ideas drop constraint if exists ideas_status_check;
alter table public.ideas add constraint ideas_status_check check (status in ('new', 'seen', 'planned', 'done', 'declined'));
alter table public.ideas drop constraint if exists ideas_title_check;
alter table public.ideas add constraint ideas_title_check check (char_length(title) between 3 and 100 and title !~ '[[:cntrl:]]');
alter table public.ideas drop constraint if exists ideas_body_check;
alter table public.ideas add constraint ideas_body_check check (char_length(body) between 10 and 4000);
alter table public.ideas drop constraint if exists ideas_game_check;
alter table public.ideas add constraint ideas_game_check check (game is null or game ~ '^[a-z0-9][a-z0-9-]{0,39}$');
alter table public.ideas drop constraint if exists ideas_reply_check;
alter table public.ideas add constraint ideas_reply_check check (reply is null or char_length(reply) between 1 and 2000);
alter table public.ideas drop constraint if exists ideas_attachments_check;
alter table public.ideas add constraint ideas_attachments_check check (jsonb_typeof(attachments) = 'array' and pg_column_size(attachments) <= 8192);
alter table public.ideas drop constraint if exists ideas_ctx_check;
alter table public.ideas add constraint ideas_ctx_check check (jsonb_typeof(ctx) = 'object' and pg_column_size(ctx) <= 2048);
create index if not exists ideas_user_idx on public.ideas (user_id, id desc);
create index if not exists ideas_status_idx on public.ideas (status, id desc);
create index if not exists ideas_attachments_idx on public.ideas using gin (attachments jsonb_path_ops);
alter table public.ideas enable row level security;
revoke all on public.ideas from public, anon, authenticated;
grant all on public.ideas to service_role;

create or replace function public.idea_create(p_kind text, p_title text, p_body text, p_files jsonb default '[]'::jsonb, p_game text default null, p_ctx jsonb default null)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.need_user();
  v_kind text := lower(btrim(coalesce(p_kind, '')));
  v_title text := private.clean_text(p_title, 100);
  v_body text := private.long_text(p_body, 4000);
  v_game text := lower(btrim(coalesce(p_game, '')));
  v_ctx jsonb := '{}'::jsonb;
  v_files jsonb;
  v_id bigint;
begin
  if v_kind not in ('game', 'improvement', 'bug', 'patch', 'other') then
    raise exception 'Bad type' using errcode = '22023';
  end if;
  if v_title is null or char_length(v_title) < 3 then
    raise exception 'Write a title' using errcode = '22023';
  end if;
  if v_body is null or char_length(v_body) < 10 then
    raise exception 'Write a description' using errcode = '22023';
  end if;
  if v_game !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
    v_game := null;
  end if;
  if v_kind = 'bug' and p_ctx is not null and jsonb_typeof(p_ctx) = 'object' then
    v_ctx := jsonb_strip_nulls(jsonb_build_object(
      'ua', private.clean_text(p_ctx ->> 'ua', 240),
      'w', case when (p_ctx ->> 'w') ~ '^[0-9]{1,5}$' then (p_ctx ->> 'w')::integer end,
      'h', case when (p_ctx ->> 'h') ~ '^[0-9]{1,5}$' then (p_ctx ->> 'h')::integer end,
      'lang', case when (p_ctx ->> 'lang') ~ '^[a-z]{2}$' then p_ctx ->> 'lang' end
    ));
  end if;
  select i.id into v_id from public.ideas i
    where i.user_id = v_uid and i.kind = v_kind and i.title = v_title and i.body = v_body and i.created_at > now() - interval '2 minutes'
    order by i.id desc limit 1;
  if v_id is not null then
    return v_id;
  end if;
  v_files := private.files_clean('ideas', v_uid::text, p_files, 4);
  perform private.rate_check('idea_create', 5, interval '1 hour');
  perform private.rate_check('idea_create_d', 20, interval '1 day');
  insert into public.ideas (user_id, kind, title, body, game, ctx, attachments)
    values (v_uid, v_kind, v_title, v_body, v_game, v_ctx, v_files)
    returning id into v_id;
  perform private.files_sweep(v_uid);
  return v_id;
end;
$$;

create or replace function public.my_ideas()
returns table (id bigint, kind text, title text, body text, game text, attachments jsonb, status text, reply text, reply_at timestamptz, created_at timestamptz, fresh boolean)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.need_user();
begin
  return query
    select i.id, i.kind, i.title, i.body, i.game, i.attachments, i.status, i.reply, i.reply_at, i.created_at, i.fresh
    from public.ideas i
    where i.user_id = v_uid
    order by i.id desc
    limit 100;
  update public.ideas i set fresh = false where i.user_id = v_uid and i.fresh;
end;
$$;

create or replace function public.my_idea_news()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from public.ideas i where i.user_id = auth.uid() and i.fresh
    and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.locked);
$$;

create or replace function public.idea_delete(p_id bigint)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.need_user();
  v_att jsonb;
begin
  delete from public.ideas i where i.id = p_id and i.user_id = v_uid returning i.attachments into v_att;
  if not found then
    raise exception 'Idea not found' using errcode = 'P0002';
  end if;
  perform private.files_rm('ideas', array(select a ->> 'path' from jsonb_array_elements(v_att) a));
  return true;
end;
$$;

create or replace function public.my_file_delete(p_bucket text, p_path text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.need_user();
  v_one jsonb := jsonb_build_array(jsonb_build_object('path', p_path));
begin
  if p_bucket is null or p_bucket not in ('ideas', 'tickets', 'dm') or p_path is null or left(p_path, 37) <> v_uid::text || '/' then
    raise exception 'File not found' using errcode = 'P0002';
  end if;
  if not exists (select 1 from storage.objects o where o.bucket_id = p_bucket and o.name = p_path and o.owner_id = v_uid::text) then
    raise exception 'File not found' using errcode = 'P0002';
  end if;
  if p_bucket = 'ideas' then
    update public.ideas i set attachments = coalesce((select jsonb_agg(a) from jsonb_array_elements(i.attachments) a where a ->> 'path' <> p_path), '[]'::jsonb)
      where i.user_id = v_uid and i.attachments @> v_one;
  elsif p_bucket = 'tickets' then
    update public.ticket_messages m set attachments = coalesce((select jsonb_agg(a) from jsonb_array_elements(m.attachments) a where a ->> 'path' <> p_path), '[]'::jsonb)
      where m.author_id = v_uid and m.attachments @> v_one;
  else
    delete from public.dms d where d.from_id = v_uid and d.kind in ('image', 'file') and d.meta ->> 'path' = p_path;
  end if;
  perform private.files_rm(p_bucket, array[p_path]);
  return true;
end;
$$;

create or replace function public.my_file_usage()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.need_user();
begin
  return (
    select jsonb_build_object('bytes', coalesce(sum(case when (o.metadata ->> 'size') ~ '^[0-9]{1,12}$' then (o.metadata ->> 'size')::bigint else 0 end), 0), 'files', count(*), 'cap', 209715200)
    from storage.objects o
    where o.bucket_id in ('ideas', 'tickets', 'dm') and o.name like v_uid::text || '/%'
  );
end;
$$;

create or replace function public.admin_ideas(p_kind text default null, p_status text default null, p_q text default null, p_before bigint default null, p_limit integer default 100)
returns table (id bigint, user_id uuid, username text, display_name text, kind text, title text, body text, game text, ctx jsonb, attachments jsonb, status text, reply text, reply_at timestamptz, reply_by text, created_at timestamptz, updated_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_q text := btrim(coalesce(p_q, ''));
  v_pat text := '%' || replace(replace(replace(v_q, '\', '\\'), '%', '\%'), '_', '\_') || '%';
begin
  return query
    select i.id, i.user_id, p.username, p.display_name, i.kind, i.title, i.body, i.game, i.ctx, i.attachments, i.status, i.reply, i.reply_at,
      coalesce(r.username, r.display_name), i.created_at, i.updated_at
    from public.ideas i
    left join public.profiles p on p.id = i.user_id
    left join public.profiles r on r.id = i.reply_by
    where (p_kind is null or p_kind = '' or i.kind = p_kind)
      and (p_status is null or p_status = '' or i.status = p_status)
      and (p_before is null or i.id < p_before)
      and (char_length(v_q) < 2 or i.title ilike v_pat or i.body ilike v_pat or p.username ilike v_pat or p.display_name ilike v_pat)
    order by i.id desc
    limit least(greatest(coalesce(p_limit, 100), 1), 200);
end;
$$;

create or replace function public.admin_idea_count()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
begin
  return (select jsonb_build_object('new', count(*) filter (where i.status = 'new'), 'total', count(*)) from public.ideas i);
end;
$$;

create or replace function public.admin_idea_update(p_id bigint, p_status text default null, p_reply text default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_reply text := private.long_text(p_reply, 2000);
  v_old public.ideas%rowtype;
  v_new public.ideas%rowtype;
begin
  if p_status is not null and p_status not in ('new', 'seen', 'planned', 'done', 'declined') then
    raise exception 'Bad status' using errcode = '22023';
  end if;
  select * into v_old from public.ideas i where i.id = p_id for update;
  if not found then
    raise exception 'Idea not found' using errcode = 'P0002';
  end if;
  update public.ideas i set
      status = coalesce(p_status, i.status),
      reply = case when p_reply is null then i.reply else v_reply end,
      reply_at = case when p_reply is null or v_reply is not distinct from i.reply then i.reply_at when v_reply is null then null else now() end,
      reply_by = case when p_reply is null or v_reply is not distinct from i.reply then i.reply_by when v_reply is null then null else v_me end,
      fresh = i.fresh
        or (p_reply is not null and v_reply is not null and v_reply is distinct from i.reply)
        or (p_status is not null and p_status <> i.status and p_status in ('planned', 'done', 'declined')),
      updated_at = now()
    where i.id = p_id
    returning * into v_new;
  if not (p_reply is null and p_status = 'seen' and v_old.status = 'new') then
    perform private.admin_log('idea_update', v_new.user_id, jsonb_build_object('idea', v_new.id, 'title', left(v_new.title, 80), 'status', case when v_new.status <> v_old.status then v_new.status end, 'reply', case when v_new.reply is distinct from v_old.reply then true end));
  end if;
  return jsonb_build_object('id', v_new.id, 'status', v_new.status, 'reply', v_new.reply, 'reply_at', v_new.reply_at, 'updated_at', v_new.updated_at,
    'reply_by', (select coalesce(p.username, p.display_name) from public.profiles p where p.id = v_new.reply_by));
end;
$$;

create or replace function public.admin_idea_delete(p_id bigint)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_old public.ideas%rowtype;
begin
  delete from public.ideas i where i.id = p_id returning * into v_old;
  if not found then
    raise exception 'Idea not found' using errcode = 'P0002';
  end if;
  perform private.files_rm('ideas', array(select a ->> 'path' from jsonb_array_elements(v_old.attachments) a));
  perform private.admin_log('idea_delete', v_old.user_id, jsonb_build_object('idea', v_old.id, 'title', left(v_old.title, 80)));
  return true;
end;
$$;

revoke all on function public.idea_create(text, text, text, jsonb, text, jsonb) from public, anon, authenticated;
revoke all on function public.my_ideas() from public, anon, authenticated;
revoke all on function public.my_idea_news() from public, anon, authenticated;
revoke all on function public.admin_ideas(text, text, text, bigint, integer) from public, anon, authenticated;
revoke all on function public.admin_idea_count() from public, anon, authenticated;
revoke all on function public.admin_idea_update(bigint, text, text) from public, anon, authenticated;
revoke all on function public.admin_idea_delete(bigint) from public, anon, authenticated;
revoke all on function public.idea_delete(bigint) from public, anon, authenticated;
revoke all on function public.my_file_delete(text, text) from public, anon, authenticated;
revoke all on function public.my_file_usage() from public, anon, authenticated;
grant execute on function public.idea_create(text, text, text, jsonb, text, jsonb) to authenticated;
grant execute on function public.my_ideas() to authenticated;
grant execute on function public.my_idea_news() to authenticated;
grant execute on function public.admin_ideas(text, text, text, bigint, integer) to authenticated;
grant execute on function public.admin_idea_count() to authenticated;
grant execute on function public.admin_idea_update(bigint, text, text) to authenticated;
grant execute on function public.admin_idea_delete(bigint) to authenticated;
grant execute on function public.idea_delete(bigint) to authenticated;
grant execute on function public.my_file_delete(text, text) to authenticated;
grant execute on function public.my_file_usage() to authenticated;

alter table public.dms drop constraint if exists dms_kind_check;
alter table public.dms add constraint dms_kind_check check (kind in ('text', 'image', 'invite', 'join', 'file'));
create index if not exists dms_path_idx on public.dms ((meta ->> 'path')) where kind in ('image', 'file');

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
  v_file jsonb;
  v_id bigint;
begin
  if v_me is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles p where p.id = v_me and p.locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  if private.blocked_between(v_me, p_to) or not exists (select 1 from public.friends f where f.user_id = v_me and f.friend_id = p_to) then
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
    perform private.rate_check('dm_text', 30, interval '1 minute');
    perform private.rate_check('dm_text_h', 600, interval '1 hour');
  elsif v_kind = 'image' then
    if coalesce(p_meta ->> 'path', '') !~ ('^' || v_me::text || '/' || p_to::text || '/[a-z0-9-]{8,64}\.(webp|jpg|png|gif)$') then
      raise exception 'Bad image' using errcode = '22023';
    end if;
    v_file := private.files_clean('dm', v_me::text || '/' || p_to::text, jsonb_build_array(jsonb_build_object('path', p_meta ->> 'path')), 1) -> 0;
    perform private.rate_check('dm_image', 10, interval '1 minute');
    perform private.rate_check('dm_image_d', 150, interval '1 day');
    v_meta := jsonb_build_object('path', p_meta ->> 'path', 'w', least(greatest(coalesce((p_meta ->> 'w')::int, 0), 0), 8000), 'h', least(greatest(coalesce((p_meta ->> 'h')::int, 0), 0), 8000));
  elsif v_kind = 'file' then
    if coalesce(p_meta ->> 'path', '') !~ ('^' || v_me::text || '/' || p_to::text || '/[a-z0-9-]{8,64}\.(pdf|txt|md|csv|json|log|zip)$') then
      raise exception 'Bad file' using errcode = '22023';
    end if;
    v_file := private.files_clean('dm', v_me::text || '/' || p_to::text, jsonb_build_array(jsonb_build_object('path', p_meta ->> 'path', 'name', p_meta ->> 'name')), 1) -> 0;
    perform private.rate_check('dm_file', 5, interval '1 minute');
    perform private.rate_check('dm_file_d', 40, interval '1 day');
    v_meta := v_file - 'kind';
    v_body := v_file ->> 'name';
  elsif v_kind in ('invite', 'join') then
    if coalesce(p_meta ->> 'game', '') !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
      raise exception 'Bad game' using errcode = '22023';
    end if;
    if v_kind = 'invite' and coalesce(p_meta ->> 'code', '') !~ '^[A-Z0-9]{3,8}$' then
      raise exception 'Bad code' using errcode = '22023';
    end if;
    v_meta := jsonb_build_object('game', p_meta ->> 'game') || case when v_kind = 'invite' then jsonb_build_object('code', p_meta ->> 'code') else '{}'::jsonb end;
    if exists (select 1 from public.dms d where d.from_id = v_me and d.to_id = p_to and d.kind = v_kind and d.meta = v_meta and d.read_at is null and d.created_at > now() - interval '30 seconds') then
      select d.id into v_id from public.dms d where d.from_id = v_me and d.to_id = p_to and d.kind = v_kind and d.meta = v_meta and d.read_at is null order by d.id desc limit 1;
      return v_id;
    end if;
    perform private.rate_check('party', 1, interval '3 seconds');
    perform private.rate_check('party_h', 300, interval '1 hour');
    delete from public.dms d where d.from_id = v_me and d.to_id = p_to and d.kind = v_kind and d.read_at is null and d.meta ->> 'game' = v_meta ->> 'game';
  else
    raise exception 'Bad kind' using errcode = '22023';
  end if;
  insert into public.dms (from_id, to_id, kind, body, meta) values (v_me, p_to, v_kind, v_body, v_meta) returning id into v_id;
  if v_kind in ('image', 'file') then
    perform private.files_sweep(v_me);
  end if;
  return v_id;
end;
$$;
revoke all on function public.dm_send(uuid, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.dm_send(uuid, text, text, jsonb) to authenticated;

alter table public.ticket_messages add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table public.ticket_messages drop constraint if exists ticket_messages_attachments_check;
alter table public.ticket_messages add constraint ticket_messages_attachments_check check (jsonb_typeof(attachments) = 'array' and pg_column_size(attachments) <= 8192);
create index if not exists ticket_messages_attachments_idx on public.ticket_messages using gin (attachments jsonb_path_ops);

drop function if exists public.ticket_create(text, text);
create or replace function public.ticket_create(p_subject text, p_body text, p_files jsonb default '[]'::jsonb)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_files jsonb := '[]'::jsonb;
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if p_files is not null and jsonb_typeof(p_files) = 'array' and jsonb_array_length(p_files) > 0 then
    perform private.need_user();
    v_files := private.files_clean('tickets', v_uid::text, p_files, 4);
  end if;
  if not private.is_staff(v_uid) then
    perform private.rate_check('ticket_create', 3, interval '10 minutes');
    perform private.rate_check('ticket_create_d', 12, interval '1 day');
    if (select count(*) from public.tickets t where t.user_id = v_uid and t.status = 'open') >= 10 then
      raise exception 'Too many open tickets' using errcode = '54000';
    end if;
  end if;
  insert into public.tickets (user_id, subject) values (v_uid, p_subject) returning id into v_id;
  insert into public.ticket_messages (ticket_id, body, attachments) values (v_id, p_body, v_files);
  if v_files <> '[]'::jsonb then
    perform private.files_sweep(v_uid);
  end if;
  return v_id;
end;
$$;

drop function if exists public.ticket_send(bigint, text);
create or replace function public.ticket_send(p_ticket bigint, p_body text, p_files jsonb default '[]'::jsonb)
returns bigint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_files jsonb := '[]'::jsonb;
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if p_files is not null and jsonb_typeof(p_files) = 'array' and jsonb_array_length(p_files) > 0 then
    perform private.need_user();
    v_files := private.files_clean('tickets', v_uid::text, p_files, 4);
  end if;
  if not private.is_staff(v_uid) then
    perform private.rate_check('ticket_send', 10, interval '1 minute');
    perform private.rate_check('ticket_send_d', 200, interval '1 day');
  end if;
  insert into public.ticket_messages (ticket_id, body, attachments) values (p_ticket, p_body, v_files) returning id into v_id;
  if v_files <> '[]'::jsonb then
    perform private.files_sweep(v_uid);
  end if;
  return v_id;
end;
$$;

drop function if exists public.ticket_thread(bigint);
create or replace function public.ticket_thread(p_ticket bigint)
returns table (id bigint, body text, is_admin boolean, mine boolean, author text, created_at timestamptz, attachments jsonb)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_admin boolean := public.is_admin();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if not exists (select 1 from public.tickets t where t.id = p_ticket and (t.user_id = v_uid or v_admin)) then
    raise exception 'Ticket not found' using errcode = 'P0002';
  end if;
  return query
    select m.id, m.body, m.is_admin, m.author_id = v_uid,
      case when v_admin then coalesce(p.username, p.display_name) end,
      m.created_at, m.attachments
    from public.ticket_messages m
    left join public.profiles p on p.id = m.author_id
    where m.ticket_id = p_ticket
    order by m.id
    limit 500;
end;
$$;

revoke all on function public.ticket_create(text, text, jsonb) from public, anon, authenticated;
revoke all on function public.ticket_send(bigint, text, jsonb) from public, anon, authenticated;
revoke all on function public.ticket_thread(bigint) from public, anon, authenticated;
grant execute on function public.ticket_create(text, text, jsonb) to authenticated;
grant execute on function public.ticket_send(bigint, text, jsonb) to authenticated;
grant execute on function public.ticket_thread(bigint) to authenticated;

create or replace function public.file_upload_ok(p_bucket text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_recent bigint;
  v_day bigint;
  v_all bigint;
begin
  if v_me is null or p_bucket is null or p_bucket not in ('ideas', 'tickets', 'dm') then
    return false;
  end if;
  if exists (select 1 from public.profiles p where p.id = v_me and p.locked) then
    return false;
  end if;
  if private.is_staff(v_me) then
    return true;
  end if;
  select count(*) filter (where o.bucket_id = p_bucket and o.created_at > now() - interval '10 minutes'),
      count(*) filter (where o.bucket_id = p_bucket and o.created_at > now() - interval '1 day'),
      coalesce(sum(case when (o.metadata ->> 'size') ~ '^[0-9]{1,12}$' then (o.metadata ->> 'size')::bigint else 0 end), 0)
    into v_recent, v_day, v_all
    from storage.objects o
    where o.bucket_id in ('ideas', 'tickets', 'dm') and o.name like v_me::text || '/%';
  if v_all >= 209715200 then
    return false;
  end if;
  if p_bucket = 'dm' then
    return v_recent < 60 and v_day < 300;
  end if;
  return v_recent < 30 and v_day < 100;
end;
$$;

create or replace function public.file_mine(p_bucket text, p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_one jsonb := jsonb_build_array(jsonb_build_object('path', p_name));
begin
  if v_me is null or exists (select 1 from public.profiles p where p.id = v_me and p.locked) then
    return false;
  end if;
  if p_bucket = 'ideas' then
    return exists (select 1 from public.ideas i where i.user_id = v_me and i.attachments @> v_one);
  elsif p_bucket = 'tickets' then
    return exists (select 1 from public.ticket_messages m join public.tickets t on t.id = m.ticket_id where t.user_id = v_me and m.attachments @> v_one);
  elsif p_bucket = 'dm' then
    return exists (select 1 from public.dms d where d.kind in ('image', 'file') and d.meta ->> 'path' = p_name and v_me in (d.from_id, d.to_id));
  end if;
  return false;
end;
$$;

create table if not exists private.file_opens (
  admin_id uuid not null references auth.users (id) on delete cascade,
  bucket text not null,
  path text not null,
  at timestamptz not null default now(),
  primary key (admin_id, bucket, path)
);
create index if not exists file_opens_at_idx on private.file_opens (at);
alter table private.file_opens enable row level security;
revoke all on private.file_opens from public, anon, authenticated;

create or replace function public.admin_files_open(p_bucket text, p_paths text[])
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.need_admin();
  v_path text;
  v_one jsonb;
  v_ref bigint;
  v_owner uuid;
  v_n integer := 0;
begin
  if p_bucket is null or p_bucket not in ('ideas', 'tickets') or p_paths is null or cardinality(p_paths) > 40 then
    raise exception 'Bad request' using errcode = '22023';
  end if;
  foreach v_path in array p_paths loop
    v_one := jsonb_build_array(jsonb_build_object('path', v_path));
    v_ref := null;
    v_owner := null;
    if p_bucket = 'ideas' then
      select i.id, i.user_id into v_ref, v_owner from public.ideas i where i.attachments @> v_one limit 1;
    else
      select t.id, t.user_id into v_ref, v_owner from public.ticket_messages m join public.tickets t on t.id = m.ticket_id where m.attachments @> v_one limit 1;
    end if;
    if v_ref is null then
      continue;
    end if;
    insert into private.file_opens as f (admin_id, bucket, path, at) values (v_me, p_bucket, v_path, now())
      on conflict (admin_id, bucket, path) do update set at = excluded.at;
    v_n := v_n + 1;
    if not exists (select 1 from public.admin_log l where l.admin_id = v_me and l.action = case when p_bucket = 'ideas' then 'idea_files' else 'ticket_files' end and (l.detail ->> 'ref')::bigint = v_ref and l.at > now() - interval '30 minutes') then
      perform private.admin_log(case when p_bucket = 'ideas' then 'idea_files' else 'ticket_files' end, v_owner, jsonb_build_object('ref', v_ref));
    end if;
  end loop;
  if random() < 0.05 then
    delete from private.file_opens where at < now() - interval '1 day';
  end if;
  return v_n;
end;
$$;

create or replace function public.file_staff_ok(p_bucket text, p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_staff(auth.uid())
    and exists (select 1 from private.file_opens f where f.admin_id = auth.uid() and f.bucket = p_bucket and f.path = p_name and f.at > now() - interval '1 hour');
$$;

create or replace function public.admin_files_cleanup()
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
  v_n := private.files_sweep(null);
  if v_n > 0 then
    perform private.admin_log('files_cleanup', null, jsonb_build_object('files', v_n));
  end if;
  return v_n;
end;
$$;

revoke all on function public.file_upload_ok(text) from public, anon, authenticated;
revoke all on function public.file_mine(text, text) from public, anon, authenticated;
revoke all on function public.file_staff_ok(text, text) from public, anon, authenticated;
revoke all on function public.admin_files_open(text, text[]) from public, anon, authenticated;
revoke all on function public.admin_files_cleanup() from public, anon, authenticated;
grant execute on function public.file_upload_ok(text) to authenticated;
grant execute on function public.file_mine(text, text) to authenticated;
grant execute on function public.file_staff_ok(text, text) to authenticated;
grant execute on function public.admin_files_open(text, text[]) to authenticated;
grant execute on function public.admin_files_cleanup() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('ideas', 'ideas', false, 8388608, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json', 'application/zip']),
  ('tickets', 'tickets', false, 8388608, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json', 'application/zip']),
  ('dm', 'dm', false, 8388608, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json', 'application/zip'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "ideas: upload own" on storage.objects;
create policy "ideas: upload own" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'ideas'
    and name ~ ('^' || (select auth.uid())::text || '/[a-z0-9-]{8,64}\.(png|jpg|webp|gif|pdf|txt|md|csv|json|log|zip)$')
    and public.file_upload_ok('ideas')
  );
drop policy if exists "ideas: read own or staff" on storage.objects;
create policy "ideas: read own or staff" on storage.objects for select to authenticated
  using (bucket_id = 'ideas' and (public.file_mine('ideas', name) or public.file_staff_ok('ideas', name)));

drop policy if exists "tickets: upload own" on storage.objects;
create policy "tickets: upload own" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'tickets'
    and name ~ ('^' || (select auth.uid())::text || '/[a-z0-9-]{8,64}\.(png|jpg|webp|gif|pdf|txt|md|csv|json|log|zip)$')
    and public.file_upload_ok('tickets')
  );
drop policy if exists "tickets: read own ticket or staff" on storage.objects;
create policy "tickets: read own ticket or staff" on storage.objects for select to authenticated
  using (bucket_id = 'tickets' and (public.file_mine('tickets', name) or public.file_staff_ok('tickets', name)));

drop policy if exists "dm: upload to friend" on storage.objects;
create policy "dm: upload to friend" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'dm'
    and name ~ ('^' || (select auth.uid())::text || '/[0-9a-f-]{36}/[a-z0-9-]{8,64}\.(png|jpg|webp|gif|pdf|txt|md|csv|json|log|zip)$')
    and exists (select 1 from public.friends f where f.user_id = (select auth.uid()) and f.friend_id::text = (storage.foldername(name))[2])
    and public.file_upload_ok('dm')
    and public.dm_upload_ok((storage.foldername(name))[2])
  );
drop policy if exists "dm: read own conversations" on storage.objects;
create policy "dm: read own conversations" on storage.objects for select to authenticated
  using (bucket_id = 'dm' and (select auth.uid())::text in ((storage.foldername(name))[1], (storage.foldername(name))[2]) and public.file_mine('dm', name));

create or replace function public.export_my_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return null;
  end if;
  perform private.rate_check('export', 5, interval '1 hour');
  return jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at, 'providers', u.raw_app_meta_data -> 'providers') from auth.users u where u.id = auth.uid()),
    'profile', (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
    'game_stats', coalesce((select jsonb_agg(to_jsonb(s) order by s.game_id) from public.game_stats s where s.user_id = auth.uid()), '[]'::jsonb),
    'game_saves', coalesce((select jsonb_agg(to_jsonb(s) order by s.game_id) from public.game_saves s where s.user_id = auth.uid()), '[]'::jsonb),
    'friends', coalesce((select jsonb_agg(to_jsonb(f)) from public.my_friends() f), '[]'::jsonb),
    'friend_requests', coalesce((select jsonb_agg(to_jsonb(r)) from public.my_friend_requests() r), '[]'::jsonb),
    'blocks', coalesce((select jsonb_agg(jsonb_build_object('blocked', b.blocked, 'created_at', b.created_at)) from public.user_blocks b where b.blocker = auth.uid()), '[]'::jsonb),
    'analytics_events', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at) from (select created_at, session_id, event, game_id, props, device from public.analytics_events where user_id = auth.uid() order by created_at desc limit 20000) e), '[]'::jsonb),
    'ideas', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'kind', i.kind, 'title', i.title, 'body', i.body, 'game', i.game, 'context', i.ctx, 'attachments', i.attachments, 'status', i.status, 'reply', i.reply, 'reply_at', i.reply_at, 'created_at', i.created_at) order by i.id) from public.ideas i where i.user_id = auth.uid()), '[]'::jsonb),
    'tickets', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'subject', t.subject, 'status', t.status, 'created_at', t.created_at,
      'messages', coalesce((select jsonb_agg(jsonb_build_object('from_staff', m.is_admin, 'body', m.body, 'attachments', m.attachments, 'created_at', m.created_at) order by m.id) from public.ticket_messages m where m.ticket_id = t.id), '[]'::jsonb)) order by t.id) from public.tickets t where t.user_id = auth.uid()), '[]'::jsonb),
    'files', coalesce((select jsonb_agg(jsonb_build_object('bucket', o.bucket_id, 'path', o.name, 'size', o.metadata -> 'size', 'type', o.metadata -> 'mimetype', 'created_at', o.created_at) order by o.created_at) from storage.objects o where o.bucket_id in ('ideas', 'tickets', 'dm') and o.name like auth.uid()::text || '/%'), '[]'::jsonb)
  );
end;
$$;

create or replace function public.delete_my_account()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  perform private.rate_check('delete_account', 3, interval '1 hour');
  perform private.files_drop_user(v_uid);
  delete from public.ideas where user_id = v_uid;
  delete from public.game_saves where user_id = v_uid;
  delete from public.game_stats where user_id = v_uid;
  delete from public.friends where user_id = v_uid or friend_id = v_uid;
  delete from public.friend_requests where from_id = v_uid or to_id = v_uid;
  delete from public.dms where from_id = v_uid or to_id = v_uid;
  delete from public.user_blocks where blocker = v_uid or blocked = v_uid;
  update public.analytics_events set user_id = null where user_id = v_uid;
  begin
    delete from auth.users where id = v_uid;
    return 'deleted';
  exception when insufficient_privilege then
    update public.profiles set username = null, display_name = null, avatar_url = null where id = v_uid;
    insert into public.account_deletion_requests (user_id) values (v_uid) on conflict (user_id) do nothing;
    return 'requested';
  end;
end;
$$;
revoke all on function public.export_my_data() from public, anon, authenticated;
revoke all on function public.delete_my_account() from public, anon, authenticated;
grant execute on function public.export_my_data() to authenticated;
grant execute on function public.delete_my_account() to authenticated;

create or replace function private.profile_files_gone()
returns trigger
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  begin
    perform private.files_drop_user(old.id);
  exception when others then
    null;
  end;
  return old;
end;
$$;
revoke all on function private.profile_files_gone() from public, anon, authenticated;
drop trigger if exists profiles_files_gone on public.profiles;
create trigger profiles_files_gone before delete on public.profiles
  for each row execute function private.profile_files_gone();

notify pgrst, 'reload schema';
