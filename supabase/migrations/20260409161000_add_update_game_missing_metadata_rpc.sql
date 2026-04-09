create or replace function public.update_game_missing_metadata(
  p_game_id uuid,
  p_image_url text default null,
  p_summary text default null
)
returns public.games
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game public.games%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_game_id is null then
    raise exception 'Game ID is required';
  end if;

  update public.games
  set
    image_url = coalesce(image_url, nullif(btrim(p_image_url), '')),
    summary = coalesce(summary, nullif(btrim(p_summary), '')),
    updated_at =
      case
        when coalesce(image_url, nullif(btrim(p_image_url), '')) is distinct from image_url
          or coalesce(summary, nullif(btrim(p_summary), '')) is distinct from summary
        then now()
        else updated_at
      end
  where id = p_game_id
    and (hidden = false or public.is_owner())
  returning * into v_game;

  if v_game.id is null then
    raise exception 'Game not found or not editable';
  end if;

  return v_game;
end;
$$;
