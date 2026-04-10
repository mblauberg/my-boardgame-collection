do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'passkeys'
      and column_name = 'user_id'
  ) then
    alter table public.passkeys rename column user_id to account_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'passkey_challenges'
      and column_name = 'user_id'
  ) then
    alter table public.passkey_challenges rename column user_id to account_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'email_merge_tokens'
      and column_name = 'from_user_id'
  ) then
    alter table public.email_merge_tokens rename column from_user_id to from_account_id;
  end if;
end
$$;

update public.passkeys p
set account_id = ai.account_id
from public.account_identities ai
where p.account_id = ai.auth_user_id
  and p.account_id is distinct from ai.account_id;

update public.passkey_challenges pc
set account_id = ai.account_id
from public.account_identities ai
where pc.account_id = ai.auth_user_id
  and pc.account_id is distinct from ai.account_id;

update public.email_merge_tokens emt
set from_account_id = ai.account_id
from public.account_identities ai
where emt.from_account_id = ai.auth_user_id
  and emt.from_account_id is distinct from ai.account_id;

alter table public.passkeys
  drop constraint if exists passkeys_user_id_fkey,
  drop constraint if exists passkeys_account_id_fkey,
  add constraint passkeys_account_id_fkey
    foreign key (account_id) references public.accounts(id) on delete cascade;

alter table public.passkey_challenges
  drop constraint if exists passkey_challenges_user_id_fkey,
  drop constraint if exists passkey_challenges_account_id_fkey,
  add constraint passkey_challenges_account_id_fkey
    foreign key (account_id) references public.accounts(id) on delete cascade;

alter table public.email_merge_tokens
  drop constraint if exists email_merge_tokens_from_user_id_fkey,
  drop constraint if exists email_merge_tokens_from_account_id_fkey,
  add constraint email_merge_tokens_from_account_id_fkey
    foreign key (from_account_id) references public.accounts(id) on delete cascade;

create index if not exists passkeys_account_id_idx on public.passkeys (account_id);
create index if not exists passkey_challenges_account_id_idx on public.passkey_challenges (account_id);
create index if not exists email_merge_tokens_from_account_id_idx on public.email_merge_tokens (from_account_id);

alter table public.account_identities
  drop constraint if exists account_identities_auth_user_id_key;

create unique index if not exists idx_account_identities_auth_identity_id
on public.account_identities (auth_identity_id)
where auth_identity_id is not null;

create unique index if not exists idx_account_identities_provider_subject
on public.account_identities (provider, provider_subject)
where provider is not null
  and provider_subject is not null;

create index if not exists idx_account_identities_provider_email_normalized
on public.account_identities (lower(btrim(provider_email)))
where provider_email is not null;

create or replace function public.sync_account_email(
  p_account_id uuid,
  p_email text,
  p_is_primary boolean default false,
  p_verified_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email_normalized text;
begin
  if p_account_id is null then
    raise exception 'p_account_id is required';
  end if;

  if p_email is null or btrim(p_email) = '' then
    return;
  end if;

  v_email_normalized := lower(btrim(p_email));

  if p_is_primary then
    update public.account_emails
    set is_primary = false
    where account_id = p_account_id;
  end if;

  insert into public.account_emails (
    account_id,
    email_original,
    email_normalized,
    is_primary,
    verified_at
  )
  values (
    p_account_id,
    btrim(p_email),
    v_email_normalized,
    p_is_primary,
    coalesce(p_verified_at, now())
  )
  on conflict (email_normalized) do update
    set account_id = excluded.account_id,
        email_original = excluded.email_original,
        verified_at = greatest(excluded.verified_at, account_emails.verified_at),
        is_primary = case
          when excluded.is_primary then true
          else account_emails.is_primary
        end;

  if p_is_primary then
    update public.account_emails
    set is_primary = email_normalized = v_email_normalized
    where account_id = p_account_id;
  end if;
end;
$$;

create or replace function public.sync_account_identity(
  p_account_id uuid,
  p_auth_user_id uuid,
  p_auth_identity_id text,
  p_provider text,
  p_provider_subject text,
  p_provider_email text,
  p_provider_email_verified boolean default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_identity_id text;
  v_provider text;
  v_provider_subject text;
  v_provider_email text;
begin
  if p_account_id is null then
    raise exception 'p_account_id is required';
  end if;

  if p_auth_user_id is null then
    raise exception 'p_auth_user_id is required';
  end if;

  v_provider := nullif(lower(btrim(coalesce(p_provider, ''))), '');
  v_provider_subject := nullif(btrim(coalesce(p_provider_subject, '')), '');
  v_provider_email := nullif(lower(btrim(coalesce(p_provider_email, ''))), '');
  v_auth_identity_id := nullif(btrim(coalesce(p_auth_identity_id, '')), '');

  if v_auth_identity_id is null then
    if v_provider is not null and v_provider_subject is not null then
      v_auth_identity_id := v_provider || ':' || v_provider_subject;
    else
      v_auth_identity_id := p_auth_user_id::text;
    end if;
  end if;

  insert into public.account_identities (
    account_id,
    auth_user_id,
    auth_identity_id,
    provider,
    provider_subject,
    provider_email,
    provider_email_verified,
    linked_at,
    last_seen_at
  )
  values (
    p_account_id,
    p_auth_user_id,
    v_auth_identity_id,
    v_provider,
    v_provider_subject,
    v_provider_email,
    p_provider_email_verified,
    now(),
    now()
  )
  on conflict (auth_identity_id) do update
    set account_id = excluded.account_id,
        auth_user_id = excluded.auth_user_id,
        provider = coalesce(excluded.provider, account_identities.provider),
        provider_subject = coalesce(excluded.provider_subject, account_identities.provider_subject),
        provider_email = coalesce(excluded.provider_email, account_identities.provider_email),
        provider_email_verified = coalesce(
          excluded.provider_email_verified,
          account_identities.provider_email_verified
        ),
        last_seen_at = now();

  if coalesce(p_provider_email_verified, false) and v_provider_email is not null then
    perform public.sync_account_email(
      p_account_id,
      v_provider_email,
      false,
      now()
    );
  end if;
end;
$$;

create or replace function public.get_account_security_summary(p_account_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_primary_email text;
  v_secondary_emails jsonb := '[]'::jsonb;
  v_identities jsonb := '[]'::jsonb;
  v_passkeys jsonb := '[]'::jsonb;
begin
  select ae.email_original
  into v_primary_email
  from public.account_emails ae
  where ae.account_id = p_account_id
    and ae.is_primary = true
  order by ae.created_at asc
  limit 1;

  select coalesce(
    jsonb_agg(
      jsonb_build_object('email', ae.email_original)
      order by ae.created_at asc
    ),
    '[]'::jsonb
  )
  into v_secondary_emails
  from public.account_emails ae
  where ae.account_id = p_account_id
    and (v_primary_email is null or ae.email_normalized <> lower(btrim(v_primary_email)));

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'provider', identity_row.provider,
        'email', identity_row.provider_email
      )
      order by identity_row.provider
    ),
    '[]'::jsonb
  )
  into v_identities
  from (
    select distinct on (ai.provider)
      ai.provider,
      ai.provider_email
    from public.account_identities ai
    where ai.account_id = p_account_id
      and ai.provider is not null
    order by ai.provider, ai.last_seen_at desc
  ) as identity_row;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'device_name', p.device_name,
        'last_used_at', p.last_used_at,
        'created_at', p.created_at
      )
      order by p.created_at desc
    ),
    '[]'::jsonb
  )
  into v_passkeys
  from public.passkeys p
  where p.account_id = p_account_id;

  return jsonb_build_object(
    'primaryEmail', v_primary_email,
    'secondaryEmails', v_secondary_emails,
    'identities', v_identities,
    'passkeys', v_passkeys
  );
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do nothing;

  insert into public.accounts (id, primary_auth_user_id)
  values (new.id, new.id)
  on conflict (id) do nothing;

  if new.email is not null and btrim(new.email) <> '' then
    perform public.sync_account_email(
      new.id,
      new.email,
      true,
      coalesce(new.email_confirmed_at, now())
    );
  end if;

  perform public.sync_account_identity(
    new.id,
    new.id,
    new.id::text,
    coalesce(new.raw_app_meta_data ->> 'provider', 'email'),
    new.id::text,
    new.email,
    new.email_confirmed_at is not null
  );

  return new;
end;
$$;
