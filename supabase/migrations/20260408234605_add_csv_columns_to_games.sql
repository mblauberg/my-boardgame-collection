-- 1. Add extra columns from the CSV dataset
alter table public.games
  add column if not exists bgg_rank integer,
  add column if not exists bgg_bayesaverage numeric(5,2),
  add column if not exists bgg_usersrated integer,
  add column if not exists abstracts_rank integer,
  add column if not exists cgs_rank integer,
  add column if not exists childrensgames_rank integer,
  add column if not exists familygames_rank integer,
  add column if not exists partygames_rank integer,
  add column if not exists strategygames_rank integer,
  add column if not exists thematic_rank integer,
  add column if not exists wargames_rank integer,
  add column if not exists search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A')
  ) stored;

-- 2. Create search index for offline lookups
create index if not exists idx_games_search_vector on public.games using gin(search_vector);

-- 3. Safely update save_bgg_game_for_user to preserve existing metadata
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
        bgg_rating = coalesce(excluded.bgg_rating, games.bgg_rating),
        bgg_weight = coalesce(excluded.bgg_weight, games.bgg_weight),
        players_min = coalesce(excluded.players_min, games.players_min),
        players_max = coalesce(excluded.players_max, games.players_max),
        play_time_min = coalesce(excluded.play_time_min, games.play_time_min),
        play_time_max = coalesce(excluded.play_time_max, games.play_time_max),
        summary = coalesce(excluded.summary, games.summary),
        image_url = coalesce(excluded.image_url, games.image_url),
        published_year = coalesce(excluded.published_year, games.published_year),
        updated_at = now()
  returning * into v_game;

  insert into public.library_entries (
    user_id,
    game_id,
    list_type,
    sentiment,
    notes
  )
  values (
    p_user_id,
    v_game.id,
    p_list_type,
    p_sentiment,
    p_notes
  )
  on conflict (user_id, game_id)
  do update
    set list_type = excluded.list_type,
        sentiment = excluded.sentiment,
        notes = excluded.notes,
        updated_at = now()
  returning * into v_library_entry;

  return v_library_entry;
end;
$$;
