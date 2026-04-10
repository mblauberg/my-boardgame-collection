do $$
begin
  if not exists (
    select 1
    from pg_proc
    where proname = 'sync_account_email'
  ) then
    raise exception 'sync_account_email() missing';
  end if;

  if not exists (
    select 1
    from pg_proc
    where proname = 'sync_account_identity'
  ) then
    raise exception 'sync_account_identity() missing';
  end if;

  if not exists (
    select 1
    from pg_proc
    where proname = 'get_account_security_summary'
  ) then
    raise exception 'get_account_security_summary() missing';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'passkeys'
      and column_name = 'account_id'
  ) then
    raise exception 'passkeys.account_id missing';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'passkeys'
      and column_name = 'user_id'
  ) then
    raise exception 'passkeys.user_id should be renamed';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'passkey_challenges'
      and column_name = 'account_id'
  ) then
    raise exception 'passkey_challenges.account_id missing';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'passkey_challenges'
      and column_name = 'user_id'
  ) then
    raise exception 'passkey_challenges.user_id should be renamed';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'email_merge_tokens'
      and column_name = 'from_account_id'
  ) then
    raise exception 'email_merge_tokens.from_account_id missing';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'email_merge_tokens'
      and column_name = 'from_user_id'
  ) then
    raise exception 'email_merge_tokens.from_user_id should be renamed';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'idx_account_identities_provider_subject'
  ) then
    raise exception 'idx_account_identities_provider_subject missing';
  end if;
end
$$;
