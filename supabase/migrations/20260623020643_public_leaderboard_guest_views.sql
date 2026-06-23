drop view if exists public.public_leaderboard_rankings;
drop view if exists public.public_leaderboard_accounts;

create view public.public_leaderboard_rankings with (security_invoker = true) as
with totals as (
  select
    user_id,
    coalesce(sum(score), 0)::integer as total_points
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
