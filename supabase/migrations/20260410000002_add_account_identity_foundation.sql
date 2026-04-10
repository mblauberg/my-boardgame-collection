create table if not exists public.accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  primary_auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_emails (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  email_original text not null,
  email_normalized text not null,
  is_primary boolean not null default false,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (email_normalized)
);

create table if not exists public.account_identities (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  auth_identity_id text,
  provider text,
  provider_subject text,
  provider_email text,
  provider_email_verified boolean,
  linked_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create unique index if not exists idx_account_emails_one_primary_per_account
on public.account_emails (account_id)
where is_primary = true;

create unique index if not exists idx_account_identities_auth_identity_id
on public.account_identities (auth_identity_id)
where auth_identity_id is not null;

drop trigger if exists trg_accounts_set_updated_at on public.accounts;
create trigger trg_accounts_set_updated_at
before update on public.accounts
for each row
execute function public.set_updated_at();

insert into public.accounts (id, primary_auth_user_id)
select p.id, p.id
from public.profiles p
on conflict (id) do nothing;

insert into public.accounts (id, primary_auth_user_id)
select u.id, u.id
from auth.users u
on conflict (id) do nothing;

insert into public.account_emails (account_id, email_original, email_normalized, is_primary, verified_at)
select
  p.id,
  p.email,
  lower(p.email),
  true,
  now()
from public.profiles p
where p.email is not null
  and btrim(p.email) <> ''
on conflict (email_normalized) do nothing;

insert into public.account_identities (
  account_id,
  auth_user_id,
  auth_identity_id,
  provider,
  provider_subject,
  provider_email,
  provider_email_verified
)
select
  a.id,
  a.primary_auth_user_id,
  a.primary_auth_user_id::text,
  coalesce(u.raw_app_meta_data ->> 'provider', 'email'),
  a.primary_auth_user_id::text,
  u.email,
  u.email_confirmed_at is not null
from public.accounts a
left join auth.users u on u.id = a.primary_auth_user_id
on conflict (auth_user_id) do nothing;

create or replace function public.current_account_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select ai.account_id
      from public.account_identities ai
      where ai.auth_user_id = auth.uid()
      limit 1
    ),
    (
      select a.id
      from public.accounts a
      where a.id = auth.uid()
      limit 1
    )
  );
$$;

create or replace function public.get_current_account_context()
returns table (
  account_id uuid,
  primary_auth_user_id uuid,
  primary_email text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id as account_id,
    a.primary_auth_user_id,
    ae.email_original as primary_email
  from public.accounts a
  left join public.account_emails ae
    on ae.account_id = a.id
   and ae.is_primary = true
  where a.id = public.current_account_id()
  limit 1;
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
    where p.id = public.current_account_id()
      and p.role = 'owner'
  );
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'library_entries'
      and column_name = 'user_id'
  ) then
    alter table public.library_entries rename column user_id to account_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_tags'
      and column_name = 'user_id'
  ) then
    alter table public.user_tags rename column user_id to account_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'game_metadata_requests'
      and column_name = 'requested_by'
  ) then
    alter table public.game_metadata_requests rename column requested_by to account_id;
  end if;
end
$$;

alter table public.library_entries
  drop constraint if exists library_entries_user_id_fkey,
  add constraint library_entries_account_id_fkey
    foreign key (account_id) references public.accounts(id) on delete cascade;

alter table public.user_tags
  drop constraint if exists user_tags_user_id_fkey,
  add constraint user_tags_account_id_fkey
    foreign key (account_id) references public.accounts(id) on delete cascade;

alter table public.game_metadata_requests
  drop constraint if exists game_metadata_requests_requested_by_fkey,
  add constraint game_metadata_requests_account_id_fkey
    foreign key (account_id) references public.accounts(id) on delete cascade;

alter index if exists public.idx_library_entries_user_id
rename to idx_library_entries_account_id;

alter index if exists public.idx_user_tags_user_id
rename to idx_user_tags_account_id;

alter index if exists public.idx_game_metadata_requests_requested_by
rename to idx_game_metadata_requests_account_id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do nothing;

  insert into public.accounts (id, primary_auth_user_id)
  values (new.id, new.id)
  on conflict (id) do nothing;

  if new.email is not null and btrim(new.email) <> '' then
    insert into public.account_emails (
      account_id,
      email_original,
      email_normalized,
      is_primary,
      verified_at
    )
    values (
      new.id,
      new.email,
      lower(new.email),
      true,
      coalesce(new.email_confirmed_at, now())
    )
    on conflict (email_normalized) do nothing;
  end if;

  insert into public.account_identities (
    account_id,
    auth_user_id,
    auth_identity_id,
    provider,
    provider_subject,
    provider_email,
    provider_email_verified
  )
  values (
    new.id,
    new.id,
    new.id::text,
    coalesce(new.raw_app_meta_data ->> 'provider', 'email'),
    new.id::text,
    new.email,
    new.email_confirmed_at is not null
  )
  on conflict (auth_user_id) do update
    set
      account_id = excluded.account_id,
      auth_identity_id = coalesce(excluded.auth_identity_id, account_identities.auth_identity_id),
      provider = coalesce(excluded.provider, account_identities.provider),
      provider_subject = coalesce(excluded.provider_subject, account_identities.provider_subject),
      provider_email = coalesce(excluded.provider_email, account_identities.provider_email),
      provider_email_verified = coalesce(excluded.provider_email_verified, account_identities.provider_email_verified),
      last_seen_at = now();

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
  join public.accounts a on a.id = p.id
  where p.is_profile_public = true
    and p.username is not null
    and lower(p.username) like lower(coalesce(prefix, '')) || '%'
  order by p.username asc
  limit 10;
$$;

create or replace function public.get_public_profile(p_username text)
returns table (
  id uuid,
  username text,
  is_profile_public boolean,
  is_collection_public boolean,
  is_saved_public boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id,
    p.username,
    p.is_profile_public,
    p.is_collection_public,
    p.is_saved_public
  from public.profiles p
  join public.accounts a on a.id = p.id
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
  if p_list_type not in ('collection', 'saved') then
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
  join public.accounts a on a.id = p.id
  join public.library_entries le on le.account_id = a.id
  join public.games g on g.id = le.game_id
  where p.is_profile_public = true
    and p.username = lower(btrim(p_username))
    and (
      (p_list_type = 'collection' and p.is_collection_public = true and le.is_in_collection = true)
      or (p_list_type = 'saved'      and p.is_saved_public = true and le.is_saved = true)
    )
  order by le.created_at desc, g.name asc;
end;
$$;

drop function if exists public.save_bgg_game_for_user(
  uuid,
  integer,
  text,
  text,
  text,
  text,
  integer,
  integer,
  integer,
  integer,
  integer,
  numeric,
  numeric,
  text,
  boolean,
  boolean,
  boolean,
  text,
  text
);

create or replace function public.save_bgg_game_for_account(
  p_account_id uuid,
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
  p_is_saved boolean default true,
  p_is_loved boolean default false,
  p_is_in_collection boolean default false,
  p_sentiment text default null,
  p_notes text default null
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

  if public.current_account_id() <> p_account_id and not public.is_owner() then
    raise exception 'Cannot save a game for another account';
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

  if p_sentiment is not null and p_sentiment not in ('like', 'dislike', 'neutral') then
    raise exception 'Invalid sentiment: %', p_sentiment;
  end if;

  v_slug := public.slugify(coalesce(nullif(btrim(p_slug), ''), p_name));
  if v_slug = '' then
    raise exception 'Slug cannot be empty';
  end if;

  if public.is_owner() then
    insert into public.games (
      name, slug, bgg_id, bgg_url, bgg_rating, bgg_weight,
      players_min, players_max, play_time_min, play_time_max,
      summary, image_url, published_year
    )
    values (
      p_name, v_slug, p_bgg_id, p_bgg_url, p_bgg_rating, p_bgg_weight,
      p_players_min, p_players_max, p_play_time_min, p_play_time_max,
      p_summary, p_image_url, p_published_year
    )
    on conflict (bgg_id) where bgg_id is not null
    do update set
      name           = excluded.name,
      slug           = excluded.slug,
      bgg_url        = excluded.bgg_url,
      bgg_rating     = coalesce(excluded.bgg_rating, games.bgg_rating),
      bgg_weight     = coalesce(excluded.bgg_weight, games.bgg_weight),
      players_min    = coalesce(excluded.players_min, games.players_min),
      players_max    = coalesce(excluded.players_max, games.players_max),
      play_time_min  = coalesce(excluded.play_time_min, games.play_time_min),
      play_time_max  = coalesce(excluded.play_time_max, games.play_time_max),
      summary        = coalesce(excluded.summary, games.summary),
      image_url      = coalesce(excluded.image_url, games.image_url),
      published_year = coalesce(excluded.published_year, games.published_year),
      updated_at     = now()
    returning * into v_game;
  else
    insert into public.games (
      name, slug, bgg_id, bgg_url, summary, image_url, published_year,
      players_min, players_max, play_time_min, play_time_max
    )
    values (
      p_name, v_slug, p_bgg_id, p_bgg_url, p_summary, p_image_url, p_published_year,
      p_players_min, p_players_max, p_play_time_min, p_play_time_max
    )
    on conflict (bgg_id) where bgg_id is not null
    do update set
      summary        = coalesce(excluded.summary, games.summary),
      image_url      = coalesce(games.image_url, excluded.image_url),
      published_year = coalesce(excluded.published_year, games.published_year),
      players_min    = coalesce(excluded.players_min, games.players_min),
      players_max    = coalesce(excluded.players_max, games.players_max),
      play_time_min  = coalesce(excluded.play_time_min, games.play_time_min),
      play_time_max  = coalesce(excluded.play_time_max, games.play_time_max),
      updated_at     = now()
    returning * into v_game;

    if v_game.id is null then
      select * into v_game from public.games where bgg_id = p_bgg_id;
    end if;
  end if;

  insert into public.library_entries (
    account_id, game_id, is_saved, is_loved, is_in_collection, sentiment, notes
  )
  values (
    p_account_id, v_game.id, p_is_saved, p_is_loved, p_is_in_collection, p_sentiment, p_notes
  )
  on conflict (account_id, game_id)
  do update
    set is_saved         = excluded.is_saved,
        is_loved         = excluded.is_loved,
        is_in_collection = excluded.is_in_collection,
        sentiment        = excluded.sentiment,
        notes            = excluded.notes,
        updated_at       = now()
  returning * into v_library_entry;

  return v_library_entry;
end;
$$;

create or replace function public.submit_game_metadata_request(
  p_game_id uuid,
  p_image_url text default null,
  p_summary text default null,
  p_published_year integer default null,
  p_players_min integer default null,
  p_players_max integer default null,
  p_play_time_min integer default null,
  p_play_time_max integer default null
)
returns public.game_metadata_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game public.games%rowtype;
  v_request public.game_metadata_requests%rowtype;
  v_image_url text;
  v_summary text;
  v_published_year integer;
  v_players_min integer;
  v_players_max integer;
  v_play_time_min integer;
  v_play_time_max integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_game_id is null then
    raise exception 'Game ID is required';
  end if;

  select *
  into v_game
  from public.games
  where id = p_game_id
    and (hidden = false or public.is_owner());

  if v_game.id is null then
    raise exception 'Game not found or not accessible';
  end if;

  if public.is_owner() then
    raise exception 'Owners should update metadata directly';
  end if;

  v_image_url := case when v_game.image_url is null then nullif(btrim(p_image_url), '') else null end;
  v_summary := case when v_game.summary is null then nullif(btrim(p_summary), '') else null end;
  v_published_year := case when v_game.published_year is null then p_published_year else null end;
  v_players_min := case when v_game.players_min is null then p_players_min else null end;
  v_players_max := case when v_game.players_max is null then p_players_max else null end;
  v_play_time_min := case when v_game.play_time_min is null then p_play_time_min else null end;
  v_play_time_max := case when v_game.play_time_max is null then p_play_time_max else null end;

  if v_image_url is null
    and v_summary is null
    and v_published_year is null
    and v_players_min is null
    and v_players_max is null
    and v_play_time_min is null
    and v_play_time_max is null then
    raise exception 'No missing fields available for request';
  end if;

  insert into public.game_metadata_requests (
    game_id,
    account_id,
    image_url,
    summary,
    published_year,
    players_min,
    players_max,
    play_time_min,
    play_time_max
  )
  values (
    p_game_id,
    public.current_account_id(),
    v_image_url,
    v_summary,
    v_published_year,
    v_players_min,
    v_players_max,
    v_play_time_min,
    v_play_time_max
  )
  returning * into v_request;

  return v_request;
end;
$$;

create or replace function public.merge_user_data(
  p_from_user_id uuid,
  p_to_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_from_user_id is null or p_to_user_id is null then
    raise exception 'Both user IDs are required';
  end if;

  if p_from_user_id = p_to_user_id then
    return;
  end if;

  insert into public.library_entries (
    account_id,
    game_id,
    is_saved,
    is_loved,
    is_in_collection,
    sentiment,
    notes,
    priority,
    created_at,
    updated_at
  )
  select
    p_to_user_id,
    le.game_id,
    le.is_saved,
    le.is_loved,
    le.is_in_collection,
    le.sentiment,
    le.notes,
    le.priority,
    le.created_at,
    le.updated_at
  from public.library_entries le
  where le.account_id = p_from_user_id
  on conflict do nothing;

  insert into public.user_tags (
    account_id,
    name,
    slug,
    colour,
    created_at,
    updated_at
  )
  select
    p_to_user_id,
    ut.name,
    ut.slug,
    ut.colour,
    ut.created_at,
    ut.updated_at
  from public.user_tags ut
  where ut.account_id = p_from_user_id
  on conflict do nothing;

  insert into public.user_game_tags (
    library_entry_id,
    user_tag_id,
    created_at
  )
  select
    target_le.id as library_entry_id,
    target_ut.id as user_tag_id,
    ugt.created_at
  from public.user_game_tags ugt
  join public.library_entries source_le
    on source_le.id = ugt.library_entry_id
   and source_le.account_id = p_from_user_id
  join public.library_entries target_le
    on target_le.account_id = p_to_user_id
   and target_le.game_id = source_le.game_id
  join public.user_tags source_ut
    on source_ut.id = ugt.user_tag_id
   and source_ut.account_id = p_from_user_id
  join public.user_tags target_ut
    on target_ut.account_id = p_to_user_id
   and target_ut.slug = source_ut.slug
  on conflict do nothing;

  delete from public.library_entries where account_id = p_from_user_id;
  delete from public.user_tags where account_id = p_from_user_id;
end;
$$;

alter table public.accounts enable row level security;
alter table public.account_emails enable row level security;
alter table public.account_identities enable row level security;

drop policy if exists "accounts_select_own_or_owner" on public.accounts;
create policy "accounts_select_own_or_owner"
on public.accounts
for select
to authenticated
using (id = public.current_account_id() or public.is_owner());

drop policy if exists "account_emails_select_own_or_owner" on public.account_emails;
create policy "account_emails_select_own_or_owner"
on public.account_emails
for select
to authenticated
using (account_id = public.current_account_id() or public.is_owner());

drop policy if exists "account_identities_select_own_or_owner" on public.account_identities;
create policy "account_identities_select_own_or_owner"
on public.account_identities
for select
to authenticated
using (account_id = public.current_account_id() or public.is_owner());

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (public.current_account_id() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (public.current_account_id() = id)
with check (public.current_account_id() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (public.current_account_id() = id);

drop policy if exists "library_entries_select_own" on public.library_entries;
create policy "library_entries_select_own"
on public.library_entries
for select
to authenticated
using (public.current_account_id() = account_id);

drop policy if exists "library_entries_insert_own" on public.library_entries;
create policy "library_entries_insert_own"
on public.library_entries
for insert
to authenticated
with check (public.current_account_id() = account_id);

drop policy if exists "library_entries_update_own" on public.library_entries;
create policy "library_entries_update_own"
on public.library_entries
for update
to authenticated
using (public.current_account_id() = account_id)
with check (public.current_account_id() = account_id);

drop policy if exists "library_entries_delete_own" on public.library_entries;
create policy "library_entries_delete_own"
on public.library_entries
for delete
to authenticated
using (public.current_account_id() = account_id);

drop policy if exists "user_tags_select_own" on public.user_tags;
create policy "user_tags_select_own"
on public.user_tags
for select
to authenticated
using (public.current_account_id() = account_id);

drop policy if exists "user_tags_insert_own" on public.user_tags;
create policy "user_tags_insert_own"
on public.user_tags
for insert
to authenticated
with check (public.current_account_id() = account_id);

drop policy if exists "user_tags_update_own" on public.user_tags;
create policy "user_tags_update_own"
on public.user_tags
for update
to authenticated
using (public.current_account_id() = account_id)
with check (public.current_account_id() = account_id);

drop policy if exists "user_tags_delete_own" on public.user_tags;
create policy "user_tags_delete_own"
on public.user_tags
for delete
to authenticated
using (public.current_account_id() = account_id);

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
      and le.account_id = public.current_account_id()
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
      and le.account_id = public.current_account_id()
  )
  and exists (
    select 1
    from public.user_tags ut
    where ut.id = user_game_tags.user_tag_id
      and ut.account_id = public.current_account_id()
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
      and le.account_id = public.current_account_id()
  )
);

drop policy if exists "game_metadata_requests_select_own_or_owner" on public.game_metadata_requests;
create policy "game_metadata_requests_select_own_or_owner"
on public.game_metadata_requests
for select
to authenticated
using (public.current_account_id() = account_id or public.is_owner());

drop policy if exists "game_metadata_requests_insert_own" on public.game_metadata_requests;
create policy "game_metadata_requests_insert_own"
on public.game_metadata_requests
for insert
to authenticated
with check (public.current_account_id() = account_id and status = 'pending');
