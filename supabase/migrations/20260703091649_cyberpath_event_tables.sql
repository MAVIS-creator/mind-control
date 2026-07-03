create table if not exists public.cyberpath_runs (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  nickname text not null,
  participant_code text not null,
  current_stage text not null default 'Completed',
  round_one_score integer not null default 0 check (round_one_score >= 0),
  round_two_score integer not null default 0 check (round_two_score >= 0),
  round_three_score integer not null default 0 check (round_three_score >= 0),
  memory_score integer not null default 0 check (memory_score >= 0),
  bonus_score integer not null default 0 check (bonus_score >= 0),
  total_score integer not null default 0 check (total_score >= 0),
  total_time_seconds integer not null default 0 check (total_time_seconds >= 0),
  qualified_for_bonus boolean not null default false,
  completed_at timestamptz not null default timezone('utc', now()),
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'removed'))
);

alter table public.cyberpath_runs enable row level security;

drop policy if exists "cyberpath_runs_select_public" on public.cyberpath_runs;
create policy "cyberpath_runs_select_public"
on public.cyberpath_runs
for select
to anon, authenticated
using (review_status <> 'removed');

drop policy if exists "cyberpath_runs_insert_public" on public.cyberpath_runs;
create policy "cyberpath_runs_insert_public"
on public.cyberpath_runs
for insert
to anon, authenticated
with check (
  length(trim(nickname)) between 2 and 40
  and length(trim(participant_code)) between 4 and 16
);

create index if not exists idx_cyberpath_runs_event_rank
on public.cyberpath_runs (event_id, total_score desc, total_time_seconds asc, completed_at asc);

drop view if exists public.cyberpath_public_leaderboard;

create view public.cyberpath_public_leaderboard with (security_invoker = true) as
select
  id,
  event_id,
  nickname,
  participant_code,
  current_stage,
  round_one_score,
  round_two_score,
  round_three_score,
  memory_score,
  bonus_score,
  total_score,
  total_time_seconds,
  qualified_for_bonus,
  completed_at,
  review_status
from public.cyberpath_runs
where review_status <> 'removed';

grant select, insert on public.cyberpath_runs to anon, authenticated;
grant select on public.cyberpath_public_leaderboard to anon, authenticated;
