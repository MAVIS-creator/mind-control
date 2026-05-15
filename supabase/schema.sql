create table if not exists public.profiles (
  id uuid primary key,
  username text not null unique,
  avatar_id text not null,
  xp integer not null default 0,
  rank text not null default 'Neural Rookie',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_users (
  user_id uuid primary key references public.profiles(id) on delete cascade,
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
  played_at timestamptz not null default timezone('utc', now()),
  suspicion_score integer not null default 0,
  suspicion_reasons text[] not null default '{}',
  automation_flag boolean not null default false,
  fast_input_flag boolean not null default false,
  hidden_tab_flag boolean not null default false,
  rapid_sequence_count integer not null default 0,
  reviewed_status text not null default 'pending',
  reviewed_note text not null default ''
);

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
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

create policy "admin_users_select_own"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

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

create policy "game_runs_update_admin"
on public.game_runs
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where public.admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where public.admin_users.user_id = auth.uid()
  )
);

create policy "game_runs_delete_admin"
on public.game_runs
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where public.admin_users.user_id = auth.uid()
  )
);
