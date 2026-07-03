create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text unique,
  avatar_id text not null,
  xp integer not null default 0,
  rank text not null default 'Neural Rookie',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add column if not exists username text,
  add column if not exists email text,
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

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email is null;

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
  won boolean not null default true,
  accuracy numeric(5,2) not null check (accuracy >= 0 and accuracy <= 100),
  max_combo integer not null check (max_combo >= 0),
  duration integer not null check (duration >= 0),
  moves_used integer not null default 0 check (moves_used >= 0),
  move_limit integer not null default 0 check (move_limit >= 0),
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
  add column if not exists won boolean default true,
  add column if not exists accuracy numeric(5,2) default 0,
  add column if not exists max_combo integer default 0,
  add column if not exists duration integer default 0,
  add column if not exists moves_used integer default 0,
  add column if not exists move_limit integer default 0,
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
  won = coalesce(won, true),
  accuracy = coalesce(accuracy, 0),
  max_combo = coalesce(max_combo, 0),
  duration = coalesce(duration, 0),
  moves_used = coalesce(moves_used, 0),
  move_limit = coalesce(move_limit, 0),
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
create unique index if not exists idx_profiles_email on public.profiles (email) where email is not null;
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

create or replace function public.resolve_login_email(login_name text)
returns text
language sql
security definer
set search_path = ''
as $$
  select p.email
  from public.profiles p
  where p.username = lower(regexp_replace(trim(login_name), '[^a-z0-9_]', '', 'g'))
    and p.email is not null
  limit 1
$$;

grant execute on function public.resolve_login_email(text) to anon, authenticated;

create or replace view public.leaderboard_rankings with (security_invoker = true) as
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
select ranked.id, ranked.user_id, ranked.username, profiles.email, ranked.avatar_id, ranked.mode, ranked.match_type, ranked.grid_size,
  ranked.score, ranked.rating, totals.total_points, ranked.won, ranked.accuracy, ranked.max_combo, ranked.duration, ranked.moves_used, ranked.move_limit, ranked.played_at,
  ranked.suspicion_score, ranked.suspicion_reasons, ranked.automation_flag, ranked.fast_input_flag, ranked.hidden_tab_flag,
  ranked.rapid_sequence_count, ranked.reviewed_status, ranked.reviewed_note
from ranked
join totals on totals.user_id = ranked.user_id
join public.profiles profiles on profiles.id = ranked.user_id
where ranked.rn = 1;

create or replace view public.leaderboard_accounts with (security_invoker = true) as
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
  profiles.email,
  best_runs.avatar_id,
  totals.total_points,
  totals.best_rating,
  totals.runs_played,
  best_runs.mode,
  best_runs.match_type,
  best_runs.grid_size,
  best_runs.score as best_score,
  best_runs.won as best_won,
  best_runs.accuracy as best_accuracy,
  best_runs.max_combo as best_max_combo,
  best_runs.duration as best_duration,
  best_runs.moves_used as best_moves_used,
  best_runs.move_limit as best_move_limit,
  best_runs.played_at as best_played_at
from best_runs
join totals on totals.user_id = best_runs.user_id
join public.profiles profiles on profiles.id = best_runs.user_id
where best_runs.rn = 1;

drop view if exists public.public_leaderboard_rankings;
drop view if exists public.public_leaderboard_accounts;

create view public.public_leaderboard_rankings with (security_invoker = true) as
with totals as (
  select user_id, coalesce(sum(score), 0)::integer as total_points
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
select
  ranked.id,
  ranked.user_id,
  ranked.username,
  ''::text as email,
  ranked.avatar_id,
  ranked.mode,
  ranked.match_type,
  ranked.grid_size,
  ranked.score,
  ranked.rating,
  totals.total_points,
  ranked.won,
  ranked.accuracy,
  ranked.max_combo,
  ranked.duration,
  ranked.moves_used,
  ranked.move_limit,
  ranked.played_at,
  ranked.suspicion_score,
  ranked.suspicion_reasons,
  ranked.automation_flag,
  ranked.fast_input_flag,
  ranked.hidden_tab_flag,
  ranked.rapid_sequence_count,
  ranked.reviewed_status,
  ranked.reviewed_note
from ranked
join totals on totals.user_id = ranked.user_id
where ranked.rn = 1;

create view public.public_leaderboard_accounts with (security_invoker = true) as
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
  ''::text as email,
  best_runs.avatar_id,
  totals.total_points,
  totals.best_rating,
  totals.runs_played,
  best_runs.mode,
  best_runs.match_type,
  best_runs.grid_size,
  best_runs.score as best_score,
  best_runs.won as best_won,
  best_runs.accuracy as best_accuracy,
  best_runs.max_combo as best_max_combo,
  best_runs.duration as best_duration,
  best_runs.moves_used as best_moves_used,
  best_runs.move_limit as best_move_limit,
  best_runs.played_at as best_played_at
from best_runs
join totals on totals.user_id = best_runs.user_id
where best_runs.rn = 1;

grant select on public.public_leaderboard_rankings to anon, authenticated;
grant select on public.public_leaderboard_accounts to anon, authenticated;
grant select on public.game_runs to anon, authenticated;

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
