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
    user_id,
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
  where le.user_id = p_from_user_id
  on conflict do nothing;

  insert into public.user_tags (
    user_id,
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
  where ut.user_id = p_from_user_id
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
   and source_le.user_id = p_from_user_id
  join public.library_entries target_le
    on target_le.user_id = p_to_user_id
   and target_le.game_id = source_le.game_id
  join public.user_tags source_ut
    on source_ut.id = ugt.user_tag_id
   and source_ut.user_id = p_from_user_id
  join public.user_tags target_ut
    on target_ut.user_id = p_to_user_id
   and target_ut.slug = source_ut.slug
  on conflict do nothing;

  delete from public.library_entries where user_id = p_from_user_id;
  delete from public.user_tags where user_id = p_from_user_id;
end;
$$;
