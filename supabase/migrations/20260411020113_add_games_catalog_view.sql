create or replace view public.games_catalog
with (security_invoker = true) as
select
  g.abstracts_rank,
  g.bgg_bayesaverage,
  g.bgg_data_source,
  g.bgg_data_updated_at,
  g.bgg_id,
  g.bgg_rank,
  g.bgg_rating,
  g.bgg_snapshot_payload,
  g.bgg_url,
  g.bgg_usersrated,
  g.bgg_weight,
  g.buy_priority,
  g.category,
  g.cgs_rank,
  g.childrensgames_rank,
  g.created_at,
  g.familygames_rank,
  g.gap_reason,
  g.hidden,
  g.id,
  g.image_url,
  g.is_expansion,
  g.is_expansion_included,
  g.name,
  g.notes,
  g.partygames_rank,
  g.play_time_max,
  g.play_time_min,
  g.players_max,
  g.players_min,
  g.published_year,
  g.recommendation_colour,
  g.recommendation_verdict,
  g.search_vector,
  g.slug,
  g.status,
  g.strategygames_rank,
  g.summary,
  g.thematic_rank,
  g.updated_at,
  g.wargames_rank,
  coalesce(
    jsonb_agg(
      distinct jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug,
        'tag_type', t.tag_type,
        'colour', t.colour,
        'created_at', t.created_at,
        'updated_at', t.updated_at
      )
    ) filter (where t.id is not null),
    '[]'::jsonb
  ) as tags,
  coalesce(
    array_agg(distinct t.slug) filter (where t.slug is not null),
    '{}'::text[]
  ) as tag_slugs
from public.games g
left join public.game_tags gt on gt.game_id = g.id
left join public.tags t on t.id = gt.tag_id
group by g.id;
grant select on public.games_catalog to anon;
grant select on public.games_catalog to authenticated;
grant select on public.games_catalog to service_role;
