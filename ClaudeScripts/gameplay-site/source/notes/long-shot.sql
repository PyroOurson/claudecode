create table if not exists public.long_shot_counts (
  prompt text not null,
  answer text not null,
  n integer not null default 0,
  primary key (prompt, answer),
  constraint long_shot_counts_prompt_check check (prompt ~ '^[a-z0-9.-]{2,48}$'),
  constraint long_shot_counts_answer_check check (answer ~ '^[a-z0-9-]{1,40}$'),
  constraint long_shot_counts_n_check check (n >= 0)
);
create index if not exists long_shot_counts_top on public.long_shot_counts (prompt, n desc);

create table if not exists public.long_shot_totals (
  prompt text primary key,
  n integer not null default 0,
  keys integer not null default 0,
  constraint long_shot_totals_prompt_check check (prompt ~ '^[a-z0-9.-]{2,48}$'),
  constraint long_shot_totals_n_check check (n >= 0 and keys >= 0)
);

create table if not exists public.long_shot_seen (
  day integer not null,
  uid uuid not null references auth.users (id) on delete cascade,
  prompt text not null,
  primary key (day, uid, prompt)
);

alter table public.long_shot_counts enable row level security;
alter table public.long_shot_totals enable row level security;
alter table public.long_shot_seen enable row level security;
revoke all on table public.long_shot_counts from public, anon, authenticated;
revoke all on table public.long_shot_totals from public, anon, authenticated;
revoke all on table public.long_shot_seen from public, anon, authenticated;

create or replace function public.long_shot_answer(p_prompt text, p_answer text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_day integer := floor(extract(epoch from now()) / 86400)::integer;
  v_new boolean := false;
  v_had boolean;
  v_keys integer;
  v_today integer;
  v_n integer;
  v_t integer;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles where id = v_uid and locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  if p_prompt is null or p_prompt !~ '^[a-z0-9.-]{2,48}$' or p_answer is null or p_answer !~ '^[a-z0-9-]{1,40}$' then
    raise exception 'Bad answer' using errcode = '22023';
  end if;
  if private.rate_ok('long_shot_answer', 100, interval '10 minutes') then
    select count(*) into v_today from public.long_shot_seen s where s.day = v_day and s.uid = v_uid;
    if v_today < 300 then
      insert into public.long_shot_seen (day, uid, prompt) values (v_day, v_uid, p_prompt) on conflict do nothing;
      v_new := found;
    end if;
  end if;
  if v_new then
    select exists (select 1 from public.long_shot_counts c where c.prompt = p_prompt and c.answer = p_answer) into v_had;
    select t.keys into v_keys from public.long_shot_totals t where t.prompt = p_prompt;
    if v_had or coalesce(v_keys, 0) < 2000 then
      insert into public.long_shot_counts as c (prompt, answer, n) values (p_prompt, p_answer, 1)
        on conflict (prompt, answer) do update set n = c.n + 1;
      insert into public.long_shot_totals as t (prompt, n, keys) values (p_prompt, 1, 1)
        on conflict (prompt) do update set n = t.n + 1, keys = t.keys + case when v_had then 0 else 1 end;
    else
      v_new := false;
    end if;
  end if;
  if random() < 0.01 then
    delete from public.long_shot_seen where day < v_day - 1;
  end if;
  select c.n into v_n from public.long_shot_counts c where c.prompt = p_prompt and c.answer = p_answer;
  select t.n into v_t from public.long_shot_totals t where t.prompt = p_prompt;
  return jsonb_build_object('n', coalesce(v_n, 0), 't', coalesce(v_t, 0), 'c', v_new);
end;
$$;
revoke all on function public.long_shot_answer(text, text) from public, anon, authenticated;
grant execute on function public.long_shot_answer(text, text) to authenticated;

create or replace function public.long_shot_stats(p_prompts text[])
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v jsonb;
begin
  if p_prompts is null or cardinality(p_prompts) = 0 then
    return '[]'::jsonb;
  end if;
  if cardinality(p_prompts) > 10 or exists (select 1 from unnest(p_prompts) x where x is null or x !~ '^[a-z0-9.-]{2,48}$') then
    raise exception 'Bad prompts' using errcode = '22023';
  end if;
  if auth.uid() is not null and exists (select 1 from public.profiles where id = auth.uid() and locked) then
    raise exception 'Account locked' using errcode = '42501';
  end if;
  perform private.rate_check('long_shot_stats', 60, interval '10 minutes');
  select coalesce(jsonb_agg(jsonb_build_object(
      'p', q.p,
      't', coalesce(t.n, 0),
      'a', coalesce((select jsonb_agg(jsonb_build_array(c.answer, c.n) order by c.n desc, c.answer)
                     from (select c2.answer, c2.n from public.long_shot_counts c2 where c2.prompt = q.p order by c2.n desc, c2.answer limit 40) c), '[]'::jsonb)
    )), '[]'::jsonb)
    into v
    from (select distinct x as p from unnest(p_prompts) x) q
    left join public.long_shot_totals t on t.prompt = q.p;
  return v;
end;
$$;
revoke all on function public.long_shot_stats(text[]) from public, anon, authenticated;
grant execute on function public.long_shot_stats(text[]) to anon, authenticated;
