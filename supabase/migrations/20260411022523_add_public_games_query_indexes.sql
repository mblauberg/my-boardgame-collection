create index if not exists idx_games_public_name_id on public.games (name asc, id asc) where hidden = false;
create index if not exists idx_games_public_rating_usersrated_name on public.games (bgg_rating desc nulls last, bgg_usersrated desc, name asc) where hidden = false;
create index if not exists idx_games_public_usersrated_rating_rank_name on public.games (bgg_usersrated desc, bgg_rating desc nulls last, bgg_rank asc nulls last, name asc) where hidden = false;
create index if not exists idx_games_public_rank_usersrated_name on public.games (bgg_rank asc nulls last, bgg_usersrated desc, name asc) where hidden = false;
create index if not exists idx_games_public_year_rank_usersrated_rating_name on public.games (published_year desc nulls last, bgg_rank asc nulls last, bgg_usersrated desc, bgg_rating desc nulls last, name asc) where hidden = false;
