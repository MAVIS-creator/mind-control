create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_id text not null,
  xp integer not null default 0,
  rank text not null default 'Neural Rookie',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add column if not exists username text,
  add column if not exists avatar_id text,
  add column if not exists xp integer default 0,
  add column if not exists rank text default 'Neural Rookie',
  add column if not exists created_at timestamptz default timezone('utc', now());

update public.profiles
set
  username = coalesce(username, 'player_' || replace(id::text, '-', '')),
  avatar_id = coalesce(avatar_id, 'avatar-01'),
  xp = coalesce(xp, 0),
  rank = coalesce(rank, 'Neural Rookie'),
  created_at = coalesce(created_at, timezone('utc', now()));

create table if not exists public.admin_users (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.admin_users
  add column if not exists created_at timestamptz default timezone('utc', now());

create table if not exists public.game_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  username text not null,
  avatar_id text not null,
  mode text not null check (mode in ('classic')),
  score integer not null check (score >= 0),
  accuracy numeric(5,2) not null check (accuracy >= 0 and accuracy <= 100),
  max_combo integer not null check (max_combo >= 0),
  duration integer not null check (duration >= 0),
  played_at timestamptz not null default timezone('utc', now()),
  suspicion_score integer not null default 0 check (suspicion_score >= 0),
  suspicion_reasons text[] not null default '{}',
  automation_flag boolean not null default false,
  fast_input_flag boolean not null default false,
  hidden_tab_flag boolean not null default false,
  rapid_sequence_count integer not null default 0 check (rapid_sequence_count >= 0),
  reviewed_status text not null default 'pending' check (reviewed_status in ('pending', 'approved', 'flagged')),
  reviewed_note text not null default ''
);

alter table public.game_runs
  add column if not exists username text,
  add column if not exists avatar_id text,
  add column if not exists mode text default 'classic',
  add column if not exists score integer default 0,
  add column if not exists accuracy numeric(5,2) default 0,
  add column if not exists max_combo integer default 0,
  add column if not exists duration integer default 0,
  add column if not exists played_at timestamptz default timezone('utc', now()),
  add column if not exists suspicion_score integer default 0,
  add column if not exists suspicion_reasons text[] default '{}',
  add column if not exists automation_flag boolean default false,
  add column if not exists fast_input_flag boolean default false,
  add column if not exists hidden_tab_flag boolean default false,
  add column if not exists rapid_sequence_count integer default 0,
  add column if not exists reviewed_status text default 'pending',
  add column if not exists reviewed_note text default '';

update public.game_runs
set
  username = coalesce(username, 'player'),
  avatar_id = coalesce(avatar_id, 'avatar-01'),
  mode = coalesce(mode, 'classic'),
  score = coalesce(score, 0),
  accuracy = coalesce(accuracy, 0),
  max_combo = coalesce(max_combo, 0),
  duration = coalesce(duration, 0),
  played_at = coalesce(played_at, timezone('utc', now())),
  suspicion_score = coalesce(suspicion_score, 0),
  suspicion_reasons = coalesce(suspicion_reasons, '{}'),
  automation_flag = coalesce(automation_flag, false),
  fast_input_flag = coalesce(fast_input_flag, false),
  hidden_tab_flag = coalesce(hidden_tab_flag, false),
  rapid_sequence_count = coalesce(rapid_sequence_count, 0),
  reviewed_status = coalesce(reviewed_status, 'pending'),
  reviewed_note = coalesce(reviewed_note, '');

create index if not exists idx_profiles_username on public.profiles (username);
create index if not exists idx_game_runs_leaderboard on public.game_runs (score desc, duration asc, played_at desc);
create index if not exists idx_game_runs_review_status on public.game_runs (reviewed_status, suspicion_score desc, played_at desc);

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.game_runs enable row level security;

drop policy if exists "profiles_select_own_or_public" on public.profiles;
create policy "profiles_select_own_or_public"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "game_runs_select_public" on public.game_runs;
create policy "game_runs_select_public"
on public.game_runs
for select
to anon, authenticated
using (true);

drop policy if exists "game_runs_insert_own" on public.game_runs;
create policy "game_runs_insert_own"
on public.game_runs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "game_runs_update_admin" on public.game_runs;
create policy "game_runs_update_admin"
on public.game_runs
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.user_id = auth.uid()
  )
);

drop policy if exists "game_runs_delete_admin" on public.game_runs;
create policy "game_runs_delete_admin"
on public.game_runs
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.user_id = auth.uid()
  )
);

alter table public.game_runs
  add column if not exists match_type text not null default 'numbers' check (match_type in ('standard','numbers','icons')),
  add column if not exists grid_size text not null default '4x4' check (grid_size in ('4x4','5x6','6x6')),
  add column if not exists rating integer not null default 0;

alter table public.game_runs drop constraint if exists game_runs_match_type_check;
alter table public.game_runs
  add constraint game_runs_match_type_check
  check (match_type in ('standard','numbers','icons'));

update public.game_runs
set rating = greatest(0, round(score + accuracy * 20 + max_combo * 120 - duration * 2));

create or replace view public.leaderboard_rankings as
with totals as (
  select user_id, coalesce(sum(score),0)::integer as total_points
  from public.game_runs
  group by user_id
),
ranked as (
  select
    gr.*,
    row_number() over (
      partition by gr.user_id, gr.mode, gr.match_type, gr.grid_size
      order by gr.rating desc, gr.score desc, gr.accuracy desc, gr.max_combo desc, gr.duration asc, gr.played_at desc
    ) as rn
  from public.game_runs gr
)
select ranked.id, ranked.user_id, ranked.username, ranked.avatar_id, ranked.mode, ranked.match_type, ranked.grid_size,
  ranked.score, ranked.rating, totals.total_points, ranked.accuracy, ranked.max_combo, ranked.duration, ranked.played_at,
  ranked.suspicion_score, ranked.suspicion_reasons, ranked.automation_flag, ranked.fast_input_flag, ranked.hidden_tab_flag,
  ranked.rapid_sequence_count, ranked.reviewed_status, ranked.reviewed_note
from ranked
join totals on totals.user_id = ranked.user_id
where ranked.rn = 1;

create or replace view public.leaderboard_accounts as
with best_runs as (
  select
    gr.*,
    row_number() over (
      partition by gr.user_id
      order by gr.rating desc, gr.score desc, gr.accuracy desc, gr.max_combo desc, gr.duration asc, gr.played_at desc
    ) as rn
  from public.game_runs gr
),
totals as (
  select
    user_id,
    coalesce(sum(score), 0)::integer as total_points,
    coalesce(max(rating), 0)::integer as best_rating,
    count(*)::integer as runs_played
  from public.game_runs
  group by user_id
)
select
  best_runs.user_id,
  best_runs.username,
  best_runs.avatar_id,
  totals.total_points,
  totals.best_rating,
  totals.runs_played,
  best_runs.mode,
  best_runs.match_type,
  best_runs.grid_size,
  best_runs.score as best_score,
  best_runs.accuracy as best_accuracy,
  best_runs.max_combo as best_max_combo,
  best_runs.duration as best_duration,
  best_runs.played_at as best_played_at
from best_runs
join totals on totals.user_id = best_runs.user_id
where best_runs.rn = 1;
