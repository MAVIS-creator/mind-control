create table if not exists public.profiles (
  id uuid primary key,
  username text not null unique,
  avatar_id text not null,
  xp integer not null default 0,
  rank text not null default 'Neural Rookie',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.game_runs (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  username text not null,
  avatar_id text not null,
  mode text not null,
  score integer not null,
  accuracy numeric(5,2) not null,
  max_combo integer not null,
  duration integer not null,
  played_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.game_runs enable row level security;

create policy "profiles_select_own_or_public"
on public.profiles
for select
to authenticated
using (true);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "game_runs_select_public"
on public.game_runs
for select
to authenticated
using (true);

create policy "game_runs_insert_own"
on public.game_runs
for insert
to authenticated
with check (auth.uid() = user_id);
