-- sync_account_identity uses `ON CONFLICT (auth_identity_id)`, which cannot
-- target a partial unique index. Use a non-partial unique index instead.
drop index if exists public.idx_account_identities_auth_identity_id;

create unique index if not exists idx_account_identities_auth_identity_id
on public.account_identities (auth_identity_id);
