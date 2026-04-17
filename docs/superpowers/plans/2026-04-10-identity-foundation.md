# Identity Foundation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce first-class account tables and account-oriented ownership without breaking existing single-user semantics.

**Architecture:** Keep the initial rollout low-risk by seeding `accounts.id` to match the canonical `auth.users.id` for every existing user. Add `account_emails` and `account_identities`, convert app-owned tables and RPCs to account-oriented names, and add a thin account-resolution layer in the frontend so later auth/UI phases no longer depend on `auth.users` directly.

**Tech Stack:** Supabase Postgres migrations, PL/pgSQL, RLS, React 19, TypeScript, TanStack Query, Supabase JS v2, Vitest

---

## File Map

**Create**
- `supabase/migrations/20260410000002_add_account_identity_foundation.sql` — create `accounts`, `account_emails`, `account_identities`; rename/backfill app-owned foreign keys to account-oriented columns; update bootstrap trigger and public SQL functions
- `scripts/sql/verify_identity_foundation.sql` — post-migration assertions for tables, columns, helper functions, and seed/backfill invariants
- `src/features/accounts/account.types.ts` — app-level account context types
- `src/features/accounts/accountKeys.ts` — TanStack Query keys for account context
- `src/features/accounts/useAccount.ts` — authenticated account-resolution hook
- `src/features/accounts/useAccount.test.tsx` — Vitest coverage for account-resolution behavior

**Modify**
- `src/types/database.ts` — add `accounts`, `account_emails`, `account_identities`, account-oriented foreign keys, and renamed RPC params/returns
- `src/features/auth/auth.types.ts` — separate account context from auth session types
- `src/features/auth/authKeys.ts` — add account-aware cache keys or delegate to `accountKeys`
- `src/features/auth/useProfile.ts` — resolve the profile through account context instead of treating `user.id` as the only owner key
- `src/features/auth/useProfile.test.tsx` — update mocked data and expectations for account-aware profile loading
- `src/features/profiles/useUpdateProfileMutation.ts` — update profile writes and invalidation to use account IDs
- `src/features/library/useLibraryQuery.ts` — query `library_entries.account_id`
- `src/features/library/useLibraryEntryMutations.ts` — write and invalidate by `accountId`, rename RPC payloads to `p_account_id`
- `src/features/library/useLibraryEntryMutations.test.tsx` — update on-conflict keys and RPC payload expectations
- `src/features/library/useGuestLibrarySync.ts` — sync guest entries into `account_id`
- `src/features/library/useGuestLibrarySync.test.tsx` — update sync expectations
- `src/features/library/usePublicLibraryQuery.ts` — keep public-library RPC usage aligned with renamed SQL outputs
- `src/features/profiles/usePublicProfileQuery.ts` — keep public-profile lookups aligned with account-backed profile ownership
- `src/features/library/useProfileSearchQuery.ts` — keep public-profile search aligned with account-backed profiles
- `src/components/games/GameDetailPanel.tsx` — pass `accountId` instead of `userId`
- `src/components/library/ExploreShelf.tsx` — pass `accountId` instead of `userId`
- `src/components/library/HorizontalShelf.tsx` — pass `accountId` instead of `userId`
- `src/components/library/AddGameWizardOverlay.tsx` — use account context instead of raw `session.user.id`

## Task 1: Database Foundation Migration

**Files:**
- Create: `scripts/sql/verify_identity_foundation.sql`
- Create: `supabase/migrations/20260410000002_add_account_identity_foundation.sql`

- [ ] **Step 1: Write the failing verification script**

```sql
do $$
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
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'library_entries'
      and column_name = 'account_id'
  ) then
    raise exception 'library_entries.account_id missing';
  end if;

  if not exists (
    select 1
    from pg_proc
    where proname = 'current_account_id'
  ) then
    raise exception 'current_account_id() missing';
  end if;
end
$$;
```

- [ ] **Step 2: Run the verifier before the migration exists**

Run:

```bash
supabase db reset
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -f scripts/sql/verify_identity_foundation.sql
```

Expected: FAIL with a missing-table or missing-column error such as `accounts table missing`.

- [ ] **Step 3: Write the migration**

Include these critical changes in `supabase/migrations/20260410000002_add_account_identity_foundation.sql`:

```sql
create table public.accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  primary_auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.account_emails (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  email_original text not null,
  email_normalized text not null,
  is_primary boolean not null default false,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (email_normalized)
);

create table public.account_identities (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  auth_identity_id text,
  provider text,
  provider_subject text,
  provider_email text,
  provider_email_verified boolean,
  linked_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create unique index idx_account_emails_one_primary_per_account
on public.account_emails (account_id)
where is_primary = true;

create unique index idx_account_identities_auth_identity_id
on public.account_identities (auth_identity_id)
where auth_identity_id is not null;

create or replace function public.current_account_id()
returns uuid
language sql
stable
as $$
  select a.id
  from public.accounts a
  where a.id = auth.uid()
  limit 1;
$$;

create or replace function public.get_current_account_context()
returns table (
  account_id uuid,
  primary_auth_user_id uuid,
  primary_email text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id,
    a.primary_auth_user_id,
    ae.email_original
  from public.accounts a
  left join public.account_emails ae
    on ae.account_id = a.id
   and ae.is_primary = true
  where a.id = public.current_account_id()
  limit 1;
$$;

alter table public.library_entries rename column user_id to account_id;
alter table public.user_tags rename column user_id to account_id;
alter table public.game_metadata_requests rename column requested_by to account_id;

insert into public.accounts (id, primary_auth_user_id)
select p.id, p.id
from public.profiles p
on conflict (id) do nothing;

insert into public.account_emails (account_id, email_original, email_normalized, is_primary)
select p.id, p.email, lower(p.email), true
from public.profiles p
where p.email is not null
on conflict (email_normalized) do nothing;
```

Also update:

- `public.handle_new_user()` so every new auth user gets an `accounts` row plus a primary `account_emails` row
- `public.get_public_profile`, `public.get_public_library`, and `public.search_public_profiles` so they join against account-oriented columns
- `public.save_bgg_game_for_user(...)` to `public.save_bgg_game_for_account(...)` with `p_account_id`
- RLS policies that currently compare `auth.uid()` to profile/library ownership so they compare against account-backed keys

- [ ] **Step 4: Run the migration and verifier again**

Run:

```bash
supabase db reset
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -f scripts/sql/verify_identity_foundation.sql
```

Expected: PASS with no SQL errors.

- [ ] **Step 5: Commit**

```bash
git add scripts/sql/verify_identity_foundation.sql \
  supabase/migrations/20260410000002_add_account_identity_foundation.sql
git commit -m "feat: add account identity foundation schema"
```

## Task 2: Account Context Hook And Types

**Files:**
- Create: `src/features/accounts/account.types.ts`
- Create: `src/features/accounts/accountKeys.ts`
- Create: `src/features/accounts/useAccount.ts`
- Test: `src/features/accounts/useAccount.test.tsx`
- Modify: `src/features/auth/auth.types.ts`
- Modify: `src/features/auth/authKeys.ts`
- Modify: `src/types/database.ts`

- [ ] **Step 1: Write the failing hook test**

```tsx
it("loads the current account context for the signed-in user", async () => {
  mockRpc.mockResolvedValue({
    data: [{ account_id: "account-1", primary_email: "alice@example.com" }],
    error: null,
  });

  const { result } = renderHook(() => useAccount(), { wrapper: TestWrapper });

  await waitFor(() => {
    expect(result.current.account?.id).toBe("account-1");
    expect(result.current.account?.primaryEmail).toBe("alice@example.com");
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test:run -- src/features/accounts/useAccount.test.tsx
```

Expected: FAIL because `useAccount` and related types do not exist yet.

- [ ] **Step 3: Implement the account types and hook**

Create a focused account feature:

```ts
export interface AccountContext {
  id: string;
  primaryEmail: string | null;
  primaryAuthUserId: string;
}
```

Use a dedicated query key and fetch the current account via a new SQL helper or RPC exposed by Task 1, for example:

```ts
const { data, error } = await supabase.rpc("get_current_account_context");
```

Update `src/features/auth/auth.types.ts` so auth session state stays session-focused and account/profile state is not overloaded into the same types.

- [ ] **Step 4: Run the focused account tests**

Run:

```bash
npm run test:run -- src/features/accounts/useAccount.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/accounts/account.types.ts \
  src/features/accounts/accountKeys.ts \
  src/features/accounts/useAccount.ts \
  src/features/accounts/useAccount.test.tsx \
  src/features/auth/auth.types.ts \
  src/features/auth/authKeys.ts \
  src/types/database.ts
git commit -m "feat: add account context hook"
```

## Task 3: Make Profile Reads And Writes Account-Aware

**Files:**
- Modify: `src/features/auth/useProfile.ts`
- Modify: `src/features/auth/useProfile.test.tsx`
- Modify: `src/features/profiles/useUpdateProfileMutation.ts`

- [ ] **Step 1: Extend the profile tests to assert account-based loading**

```tsx
it("loads the current profile by account id instead of auth user id assumptions", async () => {
  mockRpc.mockResolvedValue({
    data: [{ account_id: "account-1", primary_email: "alice@example.com" }],
    error: null,
  });

  mockFromProfiles.maybeSingle.mockResolvedValue({
    data: { id: "account-1", username: "alice", email: "alice@example.com" },
    error: null,
  });

  const { result } = renderHook(() => useProfile(), { wrapper: TestWrapper });

  await waitFor(() => {
    expect(result.current.profile?.id).toBe("account-1");
  });
});
```

- [ ] **Step 2: Run the profile tests to verify they fail**

Run:

```bash
npm run test:run -- src/features/auth/useProfile.test.tsx
```

Expected: FAIL because `useProfile` still keys the query directly from `session.user.id`.

- [ ] **Step 3: Update `useProfile` and the profile mutation**

Implement:

- `useProfile()` consumes `useAccount()` first
- the profile query key scopes by `account.id`
- the profile read targets the account-owned profile row
- `useUpdateProfileMutation()` invalidates by account-aware keys

Minimal direction:

```ts
const { account } = useAccount();

queryKey: authKeys.profile(account?.id),
enabled: !!account?.id,
```

- [ ] **Step 4: Run the focused profile tests again**

Run:

```bash
npm run test:run -- src/features/auth/useProfile.test.tsx
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/useProfile.ts \
  src/features/auth/useProfile.test.tsx \
  src/features/profiles/useUpdateProfileMutation.ts
git commit -m "refactor: resolve profiles through account context"
```

## Task 4: Convert Library Reads, Writes, And Guest Sync To Account IDs

**Files:**
- Modify: `src/features/library/useLibraryQuery.ts`
- Modify: `src/features/library/useLibraryEntryMutations.ts`
- Modify: `src/features/library/useLibraryEntryMutations.test.tsx`
- Modify: `src/features/library/useGuestLibrarySync.ts`
- Modify: `src/features/library/useGuestLibrarySync.test.tsx`

- [ ] **Step 1: Write failing assertions for account-oriented writes**

```tsx
expect(mockUpsert).toHaveBeenCalledWith(
  expect.objectContaining({ account_id: "account-1", game_id: "game-1" }),
  expect.objectContaining({ onConflict: "account_id,game_id" }),
);

expect(mockRpc).toHaveBeenCalledWith(
  "save_bgg_game_for_account",
  expect.objectContaining({ p_account_id: "account-1" }),
);
```

- [ ] **Step 2: Run the focused library tests to verify they fail**

Run:

```bash
npm run test:run -- src/features/library/useLibraryEntryMutations.test.tsx
npm run test:run -- src/features/library/useGuestLibrarySync.test.tsx
```

Expected: FAIL because the current code still reads/writes `user_id` and calls `save_bgg_game_for_user`.

- [ ] **Step 3: Update the library feature layer**

Implement:

- query `library_entries.account_id`
- upsert with `account_id`
- rename payloads from `userId` to `accountId` through the library feature layer
- call the renamed RPC `save_bgg_game_for_account`
- sync guest entries into `account_id`

Minimal shape:

```ts
.eq("account_id", accountId)

{ onConflict: "account_id,game_id" }

supabase.rpc("save_bgg_game_for_account", {
  p_account_id: accountId,
  ...
})
```

- [ ] **Step 4: Run the focused library tests again**

Run:

```bash
npm run test:run -- src/features/library/useLibraryEntryMutations.test.tsx
npm run test:run -- src/features/library/useGuestLibrarySync.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/library/useLibraryQuery.ts \
  src/features/library/useLibraryEntryMutations.ts \
  src/features/library/useLibraryEntryMutations.test.tsx \
  src/features/library/useGuestLibrarySync.ts \
  src/features/library/useGuestLibrarySync.test.tsx
git commit -m "refactor: switch library state to account ids"
```

## Task 5: Update Public Queries And UI Call Sites, Then Run Regression

**Files:**
- Modify: `src/features/profiles/usePublicProfileQuery.ts`
- Modify: `src/features/library/usePublicLibraryQuery.ts`
- Modify: `src/features/library/useProfileSearchQuery.ts`
- Modify: `src/components/games/GameDetailPanel.tsx`
- Modify: `src/components/library/ExploreShelf.tsx`
- Modify: `src/components/library/HorizontalShelf.tsx`
- Modify: `src/components/library/AddGameWizardOverlay.tsx`

- [ ] **Step 1: Add failing tests for the renamed account-oriented call sites**

Extend the closest existing tests so they assert `accountId`-shaped props and the renamed RPC:

```tsx
expect(mockMutate).toHaveBeenCalledWith(
  expect.objectContaining({ accountId: "account-1" }),
);
```

- [ ] **Step 2: Run the focused component and public-query tests**

Run:

```bash
npm run test:run -- src/components/games/GameDetailPanel.test.tsx
npm run test:run -- src/components/library/AddGameWizardOverlay.test.tsx
npm run test:run -- src/features/library/usePublicLibraryQuery.test.tsx
```

Expected: FAIL until the account-oriented call sites are updated.

- [ ] **Step 3: Update the call sites and public query helpers**

Implement:

- components pass `accountId` to library mutations
- add-game wizard uses account context instead of raw `session.user.id`
- public profile/library query wrappers stay aligned with account-backed SQL return shapes

- [ ] **Step 4: Run the regression suite**

Run:

```bash
npm run test:run -- src/features/accounts/useAccount.test.tsx
npm run test:run -- src/features/auth/useProfile.test.tsx
npm run test:run -- src/features/library/useLibraryEntryMutations.test.tsx
npm run test:run -- src/features/library/useGuestLibrarySync.test.tsx
npm run test:run -- src/components/games/GameDetailPanel.test.tsx
npm run test:run -- src/components/library/AddGameWizardOverlay.test.tsx
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/profiles/usePublicProfileQuery.ts \
  src/features/library/usePublicLibraryQuery.ts \
  src/features/library/useProfileSearchQuery.ts \
  src/components/games/GameDetailPanel.tsx \
  src/components/library/ExploreShelf.tsx \
  src/components/library/HorizontalShelf.tsx \
  src/components/library/AddGameWizardOverlay.tsx
git commit -m "refactor: finish account-oriented client ownership"
```
