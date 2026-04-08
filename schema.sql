-- schema.sql — Supabase schema for Personal Board Game Web App
-- Purpose: public read, private edit
-- Apply in the Supabase SQL editor or via migrations.

begin;

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Utility functions
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.ensure_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or btrim(new.slug) = '' then
    new.slug := public.slugify(new.name);
  else
    new.slug := public.slugify(new.slug);
  end if;
  return new;
end;
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'owner'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'viewer' check (role in ('owner', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  bgg_id integer,
  bgg_url text,
  status text not null check (status in ('owned', 'buy', 'new_rec', 'cut', 'archived')),
  buy_priority integer,
  bgg_rating numeric(3,1),
  bgg_weight numeric(3,1),
  players_min integer,
  players_max integer,
  play_time_min integer,
  play_time_max integer,
  category text,
  summary text,
  notes text,
  recommendation_verdict text,
  recommendation_colour text,
  gap_reason text,
  is_expansion_included boolean not null default false,
  image_url text,
  published_year integer,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint games_players_check check (
    players_min is null or players_max is null or players_min <= players_max
  ),
  constraint games_play_time_check check (
    play_time_min is null or play_time_max is null or play_time_min <= play_time_max
  ),
  constraint games_buy_priority_check check (
    buy_priority is null or buy_priority >= 1
  ),
  constraint games_bgg_rating_check check (
    bgg_rating is null or (bgg_rating >= 0.0 and bgg_rating <= 10.0)
  ),
  constraint games_bgg_weight_check check (
    bgg_weight is null or (bgg_weight >= 0.0 and bgg_weight <= 5.0)
  )
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  tag_type text,
  colour text,
  created_at timestamptz not null default now()
);

create table if not exists public.game_tags (
  game_id uuid not null references public.games(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (game_id, tag_id)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index if not exists idx_games_status on public.games(status);
create index if not exists idx_games_hidden on public.games(hidden);
create index if not exists idx_games_buy_priority on public.games(buy_priority);
create index if not exists idx_games_name on public.games(name);
create index if not exists idx_games_bgg_id on public.games(bgg_id);
create index if not exists idx_tags_tag_type on public.tags(tag_type);
create index if not exists idx_game_tags_tag_id on public.game_tags(tag_id);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_games_set_updated_at on public.games;
create trigger trg_games_set_updated_at
before update on public.games
for each row
execute function public.set_updated_at();

drop trigger if exists trg_games_ensure_slug on public.games;
create trigger trg_games_ensure_slug
before insert or update on public.games
for each row
execute function public.ensure_slug();

drop trigger if exists trg_tags_ensure_slug on public.tags;
create trigger trg_tags_ensure_slug
before insert or update on public.tags
for each row
execute function public.ensure_slug();

-- Trigger on auth.users for profile bootstrap
-- Safe in Supabase projects.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.tags enable row level security;
alter table public.game_tags enable row level security;

-- Profiles: only the signed-in user can read/update their own profile.
-- Owner-only write access to profiles is intentionally not broad.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Optional: allow a signed-in user to insert their own row if needed,
-- though the auth.users trigger should handle it.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- Games: public read, owner write.
drop policy if exists "games_public_read" on public.games;
create policy "games_public_read"
on public.games
for select
using (true);

drop policy if exists "games_owner_insert" on public.games;
create policy "games_owner_insert"
on public.games
for insert
to authenticated
with check (public.is_owner());

drop policy if exists "games_owner_update" on public.games;
create policy "games_owner_update"
on public.games
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "games_owner_delete" on public.games;
create policy "games_owner_delete"
on public.games
for delete
to authenticated
using (public.is_owner());

-- Tags: public read, owner write.
drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read"
on public.tags
for select
using (true);

drop policy if exists "tags_owner_insert" on public.tags;
create policy "tags_owner_insert"
on public.tags
for insert
to authenticated
with check (public.is_owner());

drop policy if exists "tags_owner_update" on public.tags;
create policy "tags_owner_update"
on public.tags
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "tags_owner_delete" on public.tags;
create policy "tags_owner_delete"
on public.tags
for delete
to authenticated
using (public.is_owner());

-- Game tags: public read, owner write.
drop policy if exists "game_tags_public_read" on public.game_tags;
create policy "game_tags_public_read"
on public.game_tags
for select
using (true);

drop policy if exists "game_tags_owner_insert" on public.game_tags;
create policy "game_tags_owner_insert"
on public.game_tags
for insert
to authenticated
with check (public.is_owner());

drop policy if exists "game_tags_owner_update" on public.game_tags;
create policy "game_tags_owner_update"
on public.game_tags
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "game_tags_owner_delete" on public.game_tags;
create policy "game_tags_owner_delete"
on public.game_tags
for delete
to authenticated
using (public.is_owner());

commit;

-- -----------------------------------------------------------------------------
-- Post-setup note
-- -----------------------------------------------------------------------------
-- After the owner signs in for the first time, elevate the owner account manually:
--
--   update public.profiles
--   set role = 'owner'
--   where email = 'your-email@example.com';
--
-- Public visitors will still be able to read games/tags/game_tags because of RLS.
