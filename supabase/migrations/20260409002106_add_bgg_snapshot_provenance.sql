alter table public.games
  add column if not exists bgg_data_source text,
  add column if not exists bgg_data_updated_at timestamptz,
  add column if not exists bgg_snapshot_payload jsonb;

create or replace function public.import_bgg_games_batch(
  batch jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.games (
    bgg_id,
    name,
    published_year,
    bgg_rank,
    bgg_bayesaverage,
    bgg_rating,
    bgg_usersrated,
    is_expansion,
    abstracts_rank,
    cgs_rank,
    childrensgames_rank,
    familygames_rank,
    partygames_rank,
    strategygames_rank,
    thematic_rank,
    wargames_rank,
    bgg_data_source,
    bgg_data_updated_at,
    bgg_snapshot_payload,
    status
  )
  select
    (item->>'bgg_id')::integer,
    item->>'name',
    (item->>'published_year')::integer,
    (item->>'bgg_rank')::integer,
    (item->>'bgg_bayesaverage')::numeric,
    (item->>'bgg_rating')::numeric,
    (item->>'bgg_usersrated')::integer,
    (item->>'is_expansion')::boolean,
    (item->>'abstracts_rank')::integer,
    (item->>'cgs_rank')::integer,
    (item->>'childrensgames_rank')::integer,
    (item->>'familygames_rank')::integer,
    (item->>'partygames_rank')::integer,
    (item->>'strategygames_rank')::integer,
    (item->>'thematic_rank')::integer,
    (item->>'wargames_rank')::integer,
    coalesce(item->>'bgg_data_source', 'bgg_csv'),
    (item->>'bgg_data_updated_at')::timestamptz,
    coalesce(item->'bgg_snapshot_payload', item),
    'archived'
  from jsonb_array_elements(batch) as item
  on conflict (bgg_id) where bgg_id is not null
  do update set
    name = coalesce(public.games.name, excluded.name),
    published_year = excluded.published_year,
    bgg_rank = excluded.bgg_rank,
    bgg_bayesaverage = excluded.bgg_bayesaverage,
    bgg_rating = coalesce(public.games.bgg_rating, excluded.bgg_rating),
    bgg_usersrated = excluded.bgg_usersrated,
    is_expansion = excluded.is_expansion,
    abstracts_rank = excluded.abstracts_rank,
    cgs_rank = excluded.cgs_rank,
    childrensgames_rank = excluded.childrensgames_rank,
    familygames_rank = excluded.familygames_rank,
    partygames_rank = excluded.partygames_rank,
    strategygames_rank = excluded.strategygames_rank,
    thematic_rank = excluded.thematic_rank,
    wargames_rank = excluded.wargames_rank,
    bgg_data_source = excluded.bgg_data_source,
    bgg_data_updated_at = excluded.bgg_data_updated_at,
    bgg_snapshot_payload = excluded.bgg_snapshot_payload,
    updated_at = now()
  where public.games.bgg_data_updated_at is null
    or excluded.bgg_data_updated_at is null
    or excluded.bgg_data_updated_at >= public.games.bgg_data_updated_at;
end;
$$;
