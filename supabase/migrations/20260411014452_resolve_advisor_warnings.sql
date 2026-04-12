-- Resolve Supabase advisor warnings for mutable function search_path and
-- auth-related RLS initplan evaluations.

alter function public.set_updated_at()
  set search_path = public;
alter function public.slugify(text)
  set search_path = public;
alter function public.ensure_slug()
  set search_path = public;
alter function public.normalize_profile_username()
  set search_path = public;
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
