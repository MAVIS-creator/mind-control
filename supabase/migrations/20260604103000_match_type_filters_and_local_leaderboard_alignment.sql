alter table public.game_runs
  alter column match_type set default 'numbers';

alter table public.game_runs drop constraint if exists game_runs_match_type_check;
alter table public.game_runs
  add constraint game_runs_match_type_check
  check (match_type in ('standard', 'numbers', 'icons'));

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
