create table if not exists public.event_editions (
  id text primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,48}$'),
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  config jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.event_editions
  add column if not exists slug text,
  add column if not exists title text,
  add column if not exists status text default 'draft',
  add column if not exists config jsonb default '{}'::jsonb,
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now());

create unique index if not exists idx_event_editions_slug on public.event_editions (slug);
create index if not exists idx_event_editions_status_updated on public.event_editions (status, updated_at desc);

alter table public.event_editions enable row level security;

drop policy if exists "event_editions_select_published" on public.event_editions;
create policy "event_editions_select_published"
on public.event_editions
for select
to anon, authenticated
using (status in ('published', 'closed'));

drop policy if exists "event_editions_select_admin" on public.event_editions;
create policy "event_editions_select_admin"
on public.event_editions
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.user_id = auth.uid()
  )
);

drop policy if exists "event_editions_insert_admin" on public.event_editions;
create policy "event_editions_insert_admin"
on public.event_editions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.user_id = auth.uid()
  )
);

drop policy if exists "event_editions_update_admin" on public.event_editions;
create policy "event_editions_update_admin"
on public.event_editions
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

drop policy if exists "event_editions_delete_admin" on public.event_editions;
create policy "event_editions_delete_admin"
on public.event_editions
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where public.admin_users.user_id = auth.uid()
  )
);

grant select on public.event_editions to anon, authenticated;
grant insert, update, delete on public.event_editions to authenticated;
