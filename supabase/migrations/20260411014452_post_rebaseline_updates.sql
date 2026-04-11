-- Post-rebaseline hardening, views, and optimizations.

-- 1. Resolve Supabase advisor warnings for mutable function search_path and 
--    auth-related RLS initplan evaluations.
alter function public.set_updated_at() set search_path = public;
alter function public.slugify(text) set search_path = public;
alter function public.ensure_slug() set search_path = public;
alter function public.normalize_profile_username() set search_path = public;

drop policy if exists accounts_select_own on public.accounts;
drop policy if exists accounts_select_own_or_owner on public.accounts;
create policy accounts_select_own_or_owner
on public.accounts
for select
to authenticated
using (
  id = (select public.current_account_id())
  or (select public.is_owner())
);

drop policy if exists account_emails_select_own on public.account_emails;
drop policy if exists account_emails_select_own_or_owner on public.account_emails;
create policy account_emails_select_own_or_owner
on public.account_emails
for select
to authenticated
using (
  account_id = (select public.current_account_id())
  or (select public.is_owner())
);

drop policy if exists account_identities_select_own on public.account_identities;
drop policy if exists account_identities_select_own_or_owner on public.account_identities;
create policy account_identities_select_own_or_owner
on public.account_identities
for select
to authenticated
using (
  account_id = (select public.current_account_id())
  or (select public.is_owner())
);

-- 2. Add games_catalog view for unified game + tags querying.
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

-- 3. Add public games query indexes for performance.
create index if not exists idx_games_public_name_id
on public.games (name asc, id asc)
where hidden = false;

create index if not exists idx_games_public_rating_usersrated_name
on public.games (bgg_rating desc nulls last, bgg_usersrated desc, name asc)
where hidden = false;

create index if not exists idx_games_public_usersrated_rating_rank_name
on public.games (bgg_usersrated desc, bgg_rating desc nulls last, bgg_rank asc nulls last, name asc)
where hidden = false;

create index if not exists idx_games_public_rank_usersrated_name
on public.games (bgg_rank asc nulls last, bgg_usersrated desc, name asc)
where hidden = false;

create index if not exists idx_games_public_year_rank_usersrated_rating_name
on public.games (published_year desc nulls last, bgg_rank asc nulls last, bgg_usersrated desc, bgg_rating desc nulls last, name asc)
where hidden = false;
