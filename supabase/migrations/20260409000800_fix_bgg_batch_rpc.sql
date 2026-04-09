create or replace function public.import_bgg_games_batch(
  batch jsonb
)
returns void
language plpgsql
security definer
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
    wargames_rank = excluded.wargames_rank;
end;
$$;
