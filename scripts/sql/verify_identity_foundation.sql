do $$
declare
  profile_count bigint;
  account_count bigint;
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'accounts'
  ) then
    raise exception 'accounts table missing';
  end if;

  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'account_emails'
  ) then
    raise exception 'account_emails table missing';
  end if;

  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'account_identities'
  ) then
    raise exception 'account_identities table missing';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'library_entries'
      and column_name = 'account_id'
  ) then
    raise exception 'library_entries.account_id missing';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'library_entries'
      and column_name = 'user_id'
  ) then
    raise exception 'library_entries.user_id should be renamed';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_tags'
      and column_name = 'account_id'
  ) then
    raise exception 'user_tags.account_id missing';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'game_metadata_requests'
      and column_name = 'account_id'
  ) then
    raise exception 'game_metadata_requests.account_id missing';
  end if;

  if not exists (
    select 1
    from pg_proc
    where proname = 'current_account_id'
  ) then
    raise exception 'current_account_id() missing';
  end if;

  if not exists (
    select 1
    from pg_proc
    where proname = 'get_current_account_context'
  ) then
    raise exception 'get_current_account_context() missing';
  end if;

  if not exists (
    select 1
    from pg_proc
    where proname = 'save_bgg_game_for_account'
  ) then
    raise exception 'save_bgg_game_for_account() missing';
  end if;

  if exists (
    select 1
    from pg_proc
    where proname = 'save_bgg_game_for_user'
  ) then
    raise exception 'save_bgg_game_for_user() should be removed';
  end if;

  select count(*) into profile_count from public.profiles;
  select count(*) into account_count from public.accounts;

  if account_count < profile_count then
    raise exception 'accounts backfill incomplete: % accounts for % profiles', account_count, profile_count;
  end if;
end
$$;
