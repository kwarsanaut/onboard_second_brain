-- OnboardKit Database Schema
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query

-- ── Tables ────────────────────────────────────────────────────────────────────

create table if not exists public.departments (
  id          text primary key,
  name        text not null,
  description text default '',
  created_at  timestamptz default now()
);

create table if not exists public.positions (
  id              text primary key,
  department_id   text not null references public.departments(id) on delete cascade,
  department_name text not null,
  name            text not null,
  created_at      timestamptz default now()
);

create table if not exists public.checklists (
  id                    text primary key,
  position_id           text not null references public.positions(id) on delete cascade,
  position_name         text not null,
  department_id         text not null,
  department_name       text not null,
  replacing_person      text,
  onboarding_type       text not null default 'replacement',
  additional_categories jsonb not null default '[]',
  items                 jsonb not null default '[]',
  generated_from        text,
  model                 text,
  wiki_revisions        int default 1,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create table if not exists public.onboarding_users (
  id              text primary key,
  name            text not null,
  position_id     text references public.positions(id) on delete set null,
  position_name   text,
  department_id   text,
  department_name text,
  replacing_person text,
  onboarding_type text default 'replacement',
  start_date      text,
  items           jsonb not null default '[]',
  created_at      timestamptz default now()
);

-- ── RLS (disable for service role access) ────────────────────────────────────
-- Service role key bypasses RLS automatically.
-- Untuk production tambahkan RLS policies sesuai kebutuhan.

alter table public.departments disable row level security;
alter table public.positions disable row level security;
alter table public.checklists disable row level security;
alter table public.onboarding_users disable row level security;

-- ── Auth: user profiles ───────────────────────────────────────────────────────

create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  role       text not null default 'hr' check (role in ('hr', 'employee')),
  full_name  text,
  created_at timestamptz default now()
);

alter table public.profiles disable row level security;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'hr'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
