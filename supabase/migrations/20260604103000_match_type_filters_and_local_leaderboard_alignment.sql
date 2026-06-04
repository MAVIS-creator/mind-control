alter table public.game_runs
  alter column match_type set default 'numbers';

alter table public.game_runs drop constraint if exists game_runs_match_type_check;
alter table public.game_runs
  add constraint game_runs_match_type_check
  check (match_type in ('standard', 'numbers', 'icons'));
