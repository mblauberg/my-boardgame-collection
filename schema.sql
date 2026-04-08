-- schema.sql — Supabase schema for Board Game Collection
-- Purpose: shared catalog + user-owned library entries
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

create or replace function public.normalize_profile_username()
returns trigger
language plpgsql
as $$
begin
  if new.username is null or btrim(new.username) = '' then
    new.username := null;
  else
    new.username := lower(btrim(new.username));
  end if;

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
  username text,
  is_profile_public boolean not null default false,
  is_collection_public boolean not null default false,
  is_wishlist_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_lowercase_check check (
    username is null or username = lower(username)
  ),
  constraint profiles_public_profile_requires_username_check check (
    not is_profile_public or username is not null
  ),
  constraint profiles_public_collection_requires_username_check check (
    not is_collection_public or username is not null
  ),
  constraint profiles_public_wishlist_requires_username_check check (
    not is_wishlist_public or username is not null
  )
);

alter table public.profiles
  add column if not exists username text,
  add column if not exists is_profile_public boolean not null default false,
  add column if not exists is_collection_public boolean not null default false,
  add column if not exists is_wishlist_public boolean not null default false;

alter table public.profiles
  drop constraint if exists profiles_username_lowercase_check,
  add constraint profiles_username_lowercase_check check (
    username is null or username = lower(username)
  ),
  drop constraint if exists profiles_public_profile_requires_username_check,
  add constraint profiles_public_profile_requires_username_check check (
    not is_profile_public or username is not null
  ),
  drop constraint if exists profiles_public_collection_requires_username_check,
  add constraint profiles_public_collection_requires_username_check check (
    not is_collection_public or username is not null
  ),
  drop constraint if exists profiles_public_wishlist_requires_username_check,
  add constraint profiles_public_wishlist_requires_username_check check (
    not is_wishlist_public or username is not null
  );

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  bgg_id integer,
  bgg_url text,
  status text not null default 'archived' check (status in ('owned', 'buy', 'new_rec', 'cut', 'archived')),
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

create table if not exists public.library_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  list_type text not null check (list_type in ('collection', 'wishlist')),
  sentiment text check (sentiment in ('like', 'dislike', 'neutral')),
  notes text,
  priority integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, game_id),
  constraint library_entries_priority_check check (priority is null or priority >= 1)
);

create table if not exists public.user_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null,
  colour text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create table if not exists public.user_game_tags (
  library_entry_id uuid not null references public.library_entries(id) on delete cascade,
  user_tag_id uuid not null references public.user_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (library_entry_id, user_tag_id)
);

-- -----------------------------------------------------------------------------
-- Auth-aware functions
-- -----------------------------------------------------------------------------

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

create or replace function public.search_public_profiles(prefix text default '')
returns table (username text)
language sql
stable
security definer
set search_path = public
as $$
  select p.username
  from public.profiles p
  where p.is_profile_public = true
    and p.username is not null
    and p.username like lower(coalesce(prefix, '')) || '%'
  order by p.username asc
  limit 10;
$$;

create or replace function public.get_public_profile(p_username text)
returns table (
  id uuid,
  username text,
  is_profile_public boolean,
  is_collection_public boolean,
  is_wishlist_public boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.username, p.is_profile_public, p.is_collection_public, p.is_wishlist_public
  from public.profiles p
  where p.is_profile_public = true
    and p.username = lower(btrim(p_username))
  limit 1;
$$;

create or replace function public.get_public_library(p_username text, p_list_type text)
returns table (
  profile_id uuid,
  username text,
  library_entry_id uuid,
  game_id uuid,
  game_name text,
  game_slug text,
  bgg_id integer,
  bgg_url text,
  bgg_rating numeric,
  bgg_weight numeric,
  players_min integer,
  players_max integer,
  play_time_min integer,
  play_time_max integer,
  category text,
  summary text,
  is_expansion_included boolean,
  image_url text,
  published_year integer,
  saved_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_list_type not in ('collection', 'wishlist') then
    raise exception 'Invalid list type: %', p_list_type;
  end if;

  return query
  select
    p.id as profile_id,
    p.username,
    le.id as library_entry_id,
    g.id as game_id,
    g.name as game_name,
    g.slug as game_slug,
    g.bgg_id,
    g.bgg_url,
    g.bgg_rating,
    g.bgg_weight,
    g.players_min,
    g.players_max,
    g.play_time_min,
    g.play_time_max,
    g.category,
    g.summary,
    g.is_expansion_included,
    g.image_url,
    g.published_year,
    le.created_at as saved_at
  from public.profiles p
  join public.library_entries le on le.user_id = p.id
  join public.games g on g.id = le.game_id
  where p.is_profile_public = true
    and p.username = lower(btrim(p_username))
    and le.list_type = p_list_type
    and (
      (p_list_type = 'collection' and p.is_collection_public = true)
      or (p_list_type = 'wishlist' and p.is_wishlist_public = true)
    )
  order by le.created_at desc, g.name asc;
end;
$$;

create or replace function public.save_bgg_game_for_user(
  p_user_id uuid,
  p_bgg_id integer,
  p_name text,
  p_slug text,
  p_bgg_url text,
  p_image_url text default null,
  p_published_year integer default null,
  p_players_min integer default null,
  p_players_max integer default null,
  p_play_time_min integer default null,
  p_play_time_max integer default null,
  p_bgg_rating numeric default null,
  p_bgg_weight numeric default null,
  p_summary text default null,
  p_list_type text default 'wishlist',
  p_sentiment text default null
)
returns public.library_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game public.games%rowtype;
  v_library_entry public.library_entries%rowtype;
  v_slug text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if auth.uid() <> p_user_id and not public.is_owner() then
    raise exception 'Cannot save a game for another user';
  end if;

  if p_bgg_id is null then
    raise exception 'BGG ID is required';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'Game name is required';
  end if;

  if p_bgg_url is null or btrim(p_bgg_url) = '' then
    raise exception 'BGG URL is required';
  end if;

  if p_list_type not in ('collection', 'wishlist') then
    raise exception 'Invalid list type: %', p_list_type;
  end if;

  if p_sentiment is not null and p_sentiment not in ('like', 'dislike', 'neutral') then
    raise exception 'Invalid sentiment: %', p_sentiment;
  end if;

  v_slug := public.slugify(coalesce(nullif(btrim(p_slug), ''), p_name));
  if v_slug = '' then
    raise exception 'Slug cannot be empty';
  end if;

  insert into public.games (
    name,
    slug,
    bgg_id,
    bgg_url,
    bgg_rating,
    bgg_weight,
    players_min,
    players_max,
    play_time_min,
    play_time_max,
    summary,
    image_url,
    published_year
  )
  values (
    p_name,
    v_slug,
    p_bgg_id,
    p_bgg_url,
    p_bgg_rating,
    p_bgg_weight,
    p_players_min,
    p_players_max,
    p_play_time_min,
    p_play_time_max,
    p_summary,
    p_image_url,
    p_published_year
  )
  on conflict (bgg_id) where bgg_id is not null
  do update
    set name = excluded.name,
        slug = excluded.slug,
        bgg_url = excluded.bgg_url,
        bgg_rating = excluded.bgg_rating,
        bgg_weight = excluded.bgg_weight,
        players_min = excluded.players_min,
        players_max = excluded.players_max,
        play_time_min = excluded.play_time_min,
        play_time_max = excluded.play_time_max,
        summary = excluded.summary,
        image_url = excluded.image_url,
        published_year = excluded.published_year,
        updated_at = now()
  returning * into v_game;

  insert into public.library_entries (
    user_id,
    game_id,
    list_type,
    sentiment
  )
  values (
    p_user_id,
    v_game.id,
    p_list_type,
    p_sentiment
  )
  on conflict (user_id, game_id)
  do update
    set list_type = excluded.list_type,
        sentiment = excluded.sentiment,
        updated_at = now()
  returning * into v_library_entry;

  return v_library_entry;
end;
$$;

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create unique index if not exists idx_profiles_username_normalized
on public.profiles (lower(username))
where username is not null and btrim(username) <> '';

create index if not exists idx_games_status on public.games(status);
create index if not exists idx_games_hidden on public.games(hidden);
create index if not exists idx_games_buy_priority on public.games(buy_priority);
create index if not exists idx_games_name on public.games(name);
create index if not exists idx_games_bgg_id on public.games(bgg_id);
create unique index if not exists idx_games_bgg_id_unique
on public.games (bgg_id)
where bgg_id is not null;
create index if not exists idx_tags_tag_type on public.tags(tag_type);
create index if not exists idx_game_tags_tag_id on public.game_tags(tag_id);
create index if not exists idx_library_entries_user_list_type
on public.library_entries (user_id, list_type);
create index if not exists idx_library_entries_game_id
on public.library_entries (game_id);
create index if not exists idx_user_tags_user_id
on public.user_tags (user_id);
create index if not exists idx_user_game_tags_user_tag_id
on public.user_game_tags (user_tag_id);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_profiles_normalize_username on public.profiles;
create trigger trg_profiles_normalize_username
before insert or update on public.profiles
for each row
execute function public.normalize_profile_username();

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

drop trigger if exists trg_library_entries_set_updated_at on public.library_entries;
create trigger trg_library_entries_set_updated_at
before update on public.library_entries
for each row
execute function public.set_updated_at();

drop trigger if exists trg_user_tags_set_updated_at on public.user_tags;
create trigger trg_user_tags_set_updated_at
before update on public.user_tags
for each row
execute function public.set_updated_at();

drop trigger if exists trg_user_tags_ensure_slug on public.user_tags;
create trigger trg_user_tags_ensure_slug
before insert or update on public.user_tags
for each row
execute function public.ensure_slug();

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
alter table public.library_entries enable row level security;
alter table public.user_tags enable row level security;
alter table public.user_game_tags enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

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

drop policy if exists "library_entries_select_own" on public.library_entries;
create policy "library_entries_select_own"
on public.library_entries
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "library_entries_insert_own" on public.library_entries;
create policy "library_entries_insert_own"
on public.library_entries
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "library_entries_update_own" on public.library_entries;
create policy "library_entries_update_own"
on public.library_entries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "library_entries_delete_own" on public.library_entries;
create policy "library_entries_delete_own"
on public.library_entries
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_tags_select_own" on public.user_tags;
create policy "user_tags_select_own"
on public.user_tags
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_tags_insert_own" on public.user_tags;
create policy "user_tags_insert_own"
on public.user_tags
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_tags_update_own" on public.user_tags;
create policy "user_tags_update_own"
on public.user_tags
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_tags_delete_own" on public.user_tags;
create policy "user_tags_delete_own"
on public.user_tags
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_game_tags_select_own" on public.user_game_tags;
create policy "user_game_tags_select_own"
on public.user_game_tags
for select
to authenticated
using (
  exists (
    select 1
    from public.library_entries le
    where le.id = user_game_tags.library_entry_id
      and le.user_id = auth.uid()
  )
);

drop policy if exists "user_game_tags_insert_own" on public.user_game_tags;
create policy "user_game_tags_insert_own"
on public.user_game_tags
for insert
to authenticated
with check (
  exists (
    select 1
    from public.library_entries le
    where le.id = user_game_tags.library_entry_id
      and le.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.user_tags ut
    where ut.id = user_game_tags.user_tag_id
      and ut.user_id = auth.uid()
  )
);

drop policy if exists "user_game_tags_delete_own" on public.user_game_tags;
create policy "user_game_tags_delete_own"
on public.user_game_tags
for delete
to authenticated
using (
  exists (
    select 1
    from public.library_entries le
    where le.id = user_game_tags.library_entry_id
      and le.user_id = auth.uid()
  )
);

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
-- Public visitors can read catalog data and the restricted public profile RPC
-- surfaces while personal library rows remain protected by RLS.
