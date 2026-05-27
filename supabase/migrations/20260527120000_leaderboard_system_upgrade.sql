alter table public.game_runs
  add column if not exists match_type text not null default 'standard' check (match_type in ('standard')),
  add column if not exists grid_size text not null default '4x4' check (grid_size in ('4x4','5x6','6x6')),
  add column if not exists rating integer not null default 0;

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
select
  ranked.id,
  ranked.user_id,
  ranked.username,
  ranked.avatar_id,
  ranked.mode,
  ranked.match_type,
  ranked.grid_size,
  ranked.score,
  ranked.rating,
  totals.total_points,
  ranked.accuracy,
  ranked.max_combo,
  ranked.duration,
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
