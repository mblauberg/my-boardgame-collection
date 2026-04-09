-- Enforce mutual exclusivity of is_saved and is_in_collection.
-- A game being added to the collection supersedes the saved state,
-- so clear is_saved on any rows where both flags are currently true.
update public.library_entries
  set is_saved = false
  where is_saved = true and is_in_collection = true;

alter table public.library_entries
  drop constraint if exists library_entries_saved_collection_exclusive,
  add constraint library_entries_saved_collection_exclusive check (not (is_saved and is_in_collection));
