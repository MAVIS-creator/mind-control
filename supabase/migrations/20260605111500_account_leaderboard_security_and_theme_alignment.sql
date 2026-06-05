alter table public.profiles
  add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email is null;

create unique index if not exists idx_profiles_email on public.profiles (email) where email is not null;

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

alter view if exists public.leaderboard_rankings set (security_invoker = on);
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
  ranked.score, ranked.rating, totals.total_points, ranked.accuracy, ranked.max_combo, ranked.duration, ranked.played_at,
  ranked.suspicion_score, ranked.suspicion_reasons, ranked.automation_flag, ranked.fast_input_flag, ranked.hidden_tab_flag,
  ranked.rapid_sequence_count, ranked.reviewed_status, ranked.reviewed_note
from ranked
join totals on totals.user_id = ranked.user_id
join public.profiles profiles on profiles.id = ranked.user_id
where ranked.rn = 1;

alter view if exists public.leaderboard_accounts set (security_invoker = on);
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
  best_runs.accuracy as best_accuracy,
  best_runs.max_combo as best_max_combo,
  best_runs.duration as best_duration,
  best_runs.played_at as best_played_at
from best_runs
join totals on totals.user_id = best_runs.user_id
join public.profiles profiles on profiles.id = best_runs.user_id
where best_runs.rn = 1;
