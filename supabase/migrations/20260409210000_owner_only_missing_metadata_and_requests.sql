create table if not exists public.game_metadata_requests (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  image_url text,
  summary text,
  published_year integer,
  players_min integer,
  players_max integer,
  play_time_min integer,
  play_time_max integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_metadata_requests_has_payload check (
    image_url is not null
    or summary is not null
    or published_year is not null
    or players_min is not null
    or players_max is not null
    or play_time_min is not null
    or play_time_max is not null
  ),
  constraint game_metadata_requests_players_check check (
    players_min is null or players_max is null or players_min <= players_max
  ),
  constraint game_metadata_requests_play_time_check check (
    play_time_min is null or play_time_max is null or play_time_min <= play_time_max
  ),
  constraint game_metadata_requests_published_year_range_check check (
    published_year is null or published_year <= 2100
  ),
  constraint game_metadata_requests_image_url_https_check check (
    image_url is null or image_url like 'https://%'
  )
);

create index if not exists idx_game_metadata_requests_game_id
on public.game_metadata_requests (game_id);

create index if not exists idx_game_metadata_requests_requested_by
on public.game_metadata_requests (requested_by);

create index if not exists idx_game_metadata_requests_status
on public.game_metadata_requests (status);

drop trigger if exists trg_game_metadata_requests_set_updated_at on public.game_metadata_requests;
create trigger trg_game_metadata_requests_set_updated_at
before update on public.game_metadata_requests
for each row
execute function public.set_updated_at();

alter table public.game_metadata_requests enable row level security;

drop policy if exists "game_metadata_requests_select_own_or_owner" on public.game_metadata_requests;
create policy "game_metadata_requests_select_own_or_owner"
on public.game_metadata_requests
for select
to authenticated
using (auth.uid() = requested_by or public.is_owner());

drop policy if exists "game_metadata_requests_insert_own" on public.game_metadata_requests;
create policy "game_metadata_requests_insert_own"
on public.game_metadata_requests
for insert
to authenticated
with check (auth.uid() = requested_by and status = 'pending');

drop policy if exists "game_metadata_requests_owner_update" on public.game_metadata_requests;
create policy "game_metadata_requests_owner_update"
on public.game_metadata_requests
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "game_metadata_requests_owner_delete" on public.game_metadata_requests;
create policy "game_metadata_requests_owner_delete"
on public.game_metadata_requests
for delete
to authenticated
using (public.is_owner());

create or replace function public.update_game_missing_metadata(
  p_game_id uuid,
  p_image_url text default null,
  p_summary text default null,
  p_published_year integer default null,
  p_players_min integer default null,
  p_players_max integer default null,
  p_play_time_min integer default null,
  p_play_time_max integer default null
)
returns public.games
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game public.games%rowtype;
  v_image_url text;
  v_summary text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_owner() and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Owner role required';
  end if;

  if p_game_id is null then
    raise exception 'Game ID is required';
  end if;

  v_image_url := nullif(btrim(p_image_url), '');
  v_summary := nullif(btrim(p_summary), '');

  update public.games
  set
    image_url = coalesce(image_url, v_image_url),
    summary = coalesce(summary, v_summary),
    published_year = coalesce(published_year, p_published_year),
    players_min = coalesce(players_min, p_players_min),
    players_max = coalesce(players_max, p_players_max),
    play_time_min = coalesce(play_time_min, p_play_time_min),
    play_time_max = coalesce(play_time_max, p_play_time_max),
    updated_at =
      case
        when coalesce(image_url, v_image_url) is distinct from image_url
          or coalesce(summary, v_summary) is distinct from summary
          or coalesce(published_year, p_published_year) is distinct from published_year
          or coalesce(players_min, p_players_min) is distinct from players_min
          or coalesce(players_max, p_players_max) is distinct from players_max
          or coalesce(play_time_min, p_play_time_min) is distinct from play_time_min
          or coalesce(play_time_max, p_play_time_max) is distinct from play_time_max
        then now()
        else updated_at
      end
  where id = p_game_id
  returning * into v_game;

  if v_game.id is null then
    raise exception 'Game not found';
  end if;

  return v_game;
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
    requested_by,
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
    auth.uid(),
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
