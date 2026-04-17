# Auth Linking And Security Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make passkeys, linked providers, and owned emails account-scoped, and synchronize Supabase identity state into the app’s account tables.

**Architecture:** Build on the identity foundation by treating Supabase Auth as the source of truth for the current signed-in user and linked identities. Same-email verified provider linking remains delegated to Supabase Auth, while the app mirrors the current user’s identities and emails into `account_identities` and `account_emails`, updates passkey ownership to account scope, and exposes account-security data for the later UI overhaul.

**Tech Stack:** Supabase Auth, Supabase Edge Functions (Deno), Supabase Postgres migrations, React 19, TypeScript, Supabase JS v2, Vitest, local Supabase CLI smoke tests

---

## Implementation Note

This plan assumes Supabase manual linking remains enabled and that verified same-email provider identities resolve to one Supabase user, either automatically or through `linkIdentity()` behavior documented by Supabase. The app should mirror linked identities rather than attempting to create a second account-merge system on top of Supabase Auth.

## File Map

**Create**
- `supabase/migrations/20260410000003_add_account_security_sync.sql` — add SQL helpers for syncing account emails/identities, move passkeys and email-merge tokens to account scope
- `scripts/sql/verify_account_security_sync.sql` — verification script for account-email/account-identity sync helpers and passkey ownership
- `supabase/functions/_shared/accountSecurity.ts` — shared Edge Function helpers for current-user/account sync and account-security reads
- `supabase/functions/account-sync-session/index.ts` — sync the currently authenticated user’s provider identities and verified emails into app tables
- `supabase/functions/account-security-summary/index.ts` — return passkeys, linked providers, and owned emails for the current account
- `src/features/auth/accountSecurityApi.ts` — browser API helpers for account-security endpoints
- `src/features/auth/accountSecurityApi.test.ts` — Vitest coverage for the new client API helpers

**Modify**
- `supabase/functions/_shared/auth.ts` — expose canonical account helpers alongside bearer-token user lookup
- `supabase/functions/passkey-auth-options/index.ts`
- `supabase/functions/passkey-auth-verify/index.ts`
- `supabase/functions/passkey-register-options/index.ts`
- `supabase/functions/passkey-register-verify/index.ts`
- `supabase/functions/passkey-list/index.ts`
- `supabase/functions/passkey-delete/index.ts`
- `supabase/functions/email-merge-request/index.ts`
- `supabase/functions/email-merge-verify/index.ts`
- `src/pages/AuthCallbackPage.tsx`
- `src/pages/AuthCallbackPage.test.tsx`
- `src/features/auth/SignInForm.tsx`
- `src/features/auth/SignInForm.test.tsx`
- `src/pages/AccountSettingsPage.tsx` — keep current page behavior working against account-scoped endpoints before the UI overhaul
- `src/pages/AccountSettingsPage.test.tsx`
- `src/types/database.ts`

## Task 1: Add SQL Helpers For Account Security Sync

**Files:**
- Create: `scripts/sql/verify_account_security_sync.sql`
- Create: `supabase/migrations/20260410000003_add_account_security_sync.sql`

- [ ] **Step 1: Write the failing SQL verifier**

```sql
do $$
begin
  if not exists (
    select 1 from pg_proc where proname = 'sync_account_email'
  ) then
    raise exception 'sync_account_email() missing';
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
end
$$;
```

- [ ] **Step 2: Run the verifier before the migration**

Run:

```bash
supabase db reset
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -f scripts/sql/verify_account_security_sync.sql
```

Expected: FAIL with a missing-function or missing-column error.

- [ ] **Step 3: Write the migration**

Include helpers that let Edge Functions upsert account security metadata safely:

```sql
alter table public.passkeys rename column user_id to account_id;
alter table public.passkey_challenges rename column user_id to account_id;
alter table public.email_merge_tokens rename column from_user_id to from_account_id;

create or replace function public.sync_account_email(
  p_account_id uuid,
  p_email text,
  p_is_primary boolean default false
) returns void
language plpgsql
security definer
as $$
begin
  if p_email is null or btrim(p_email) = '' then
    return;
  end if;

  insert into public.account_emails (
    account_id, email_original, email_normalized, is_primary
  )
  values (
    p_account_id, p_email, lower(btrim(p_email)), p_is_primary
  )
  on conflict (email_normalized) do update
    set account_id = excluded.account_id;
end;
$$;
```

Also add:

- `sync_account_identity(...)`
- `get_account_security_summary(p_account_id uuid)` returning passkeys + emails + linked identities
- any missing indexes/uniqueness needed for `auth_identity_id`, `provider`, and normalized email lookups

- [ ] **Step 4: Run reset plus verifier**

Run:

```bash
supabase db reset
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -f scripts/sql/verify_account_security_sync.sql
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/sql/verify_account_security_sync.sql \
  supabase/migrations/20260410000003_add_account_security_sync.sql
git commit -m "feat: add account security sync sql helpers"
```

## Task 2: Add Shared Edge Function Account-Security Helpers

**Files:**
- Create: `supabase/functions/_shared/accountSecurity.ts`
- Create: `supabase/functions/account-sync-session/index.ts`

- [ ] **Step 1: Write the failing client API test for session sync**

```ts
it("invokes account-sync-session for the signed-in user", async () => {
  mockInvoke.mockResolvedValue({ data: { ok: true }, error: null });

  await syncAccountSession();

  expect(mockInvoke).toHaveBeenCalledWith("account-sync-session", undefined);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test:run -- src/features/auth/accountSecurityApi.test.ts
```

Expected: FAIL because the helper module does not exist yet.

- [ ] **Step 3: Implement the shared helper and sync function**

In `_shared/accountSecurity.ts`, add helpers that:

- authenticate the request
- fetch the current Supabase user and linked identities
- resolve the current account ID
- call SQL helpers such as `sync_account_email(...)` and `sync_account_identity(...)`

Minimal shape:

```ts
export async function syncCurrentAccountSecurity(req: Request) {
  const authUser = await getAuthUserFromRequest(req);
  const accountId = authUser.id;

  for (const identity of authUser.identities ?? []) {
    await serviceClient.rpc("sync_account_identity", {
      p_account_id: accountId,
      p_auth_user_id: authUser.id,
      p_auth_identity_id: identity.identity_id,
      p_provider: identity.provider,
      p_provider_subject: identity.id,
      p_provider_email: identity.identity_data?.email ?? null,
      p_provider_email_verified: identity.identity_data?.email_verified ?? null,
    });
  }
}
```

- [ ] **Step 4: Smoke-test the function locally**

Run:

```bash
supabase functions serve account-sync-session --env-file .env.local
curl -i -X POST http://127.0.0.1:54321/functions/v1/account-sync-session \
  -H "Authorization: Bearer <LOCAL_ACCESS_TOKEN>"
```

Expected: `200 OK` with `{ "ok": true }`

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/accountSecurity.ts \
  supabase/functions/account-sync-session/index.ts \
  src/features/auth/accountSecurityApi.ts \
  src/features/auth/accountSecurityApi.test.ts
git commit -m "feat: add account security sync edge function"
```

## Task 3: Make Passkeys And Email Merge Account-Scoped

**Files:**
- Modify: `supabase/functions/_shared/auth.ts`
- Modify: `supabase/functions/passkey-auth-options/index.ts`
- Modify: `supabase/functions/passkey-auth-verify/index.ts`
- Modify: `supabase/functions/passkey-register-options/index.ts`
- Modify: `supabase/functions/passkey-register-verify/index.ts`
- Modify: `supabase/functions/passkey-list/index.ts`
- Modify: `supabase/functions/passkey-delete/index.ts`
- Modify: `supabase/functions/email-merge-request/index.ts`
- Modify: `supabase/functions/email-merge-verify/index.ts`

- [ ] **Step 1: Add failing browser tests that expect account-scoped passkey behavior**

Use the existing page tests as the browser-facing safety net:

```tsx
expect(mockInvoke).toHaveBeenCalledWith(
  "passkey-register-options",
  expect.objectContaining({
    headers: expect.objectContaining({ Authorization: "Bearer test-access-token" }),
  }),
);
```

Then add a new expectation that account-security sync runs before post-auth redirects are treated as complete.

- [ ] **Step 2: Run the targeted browser tests**

Run:

```bash
npm run test:run -- src/features/auth/SignInForm.test.tsx
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
```

Expected: FAIL once you add the new sync expectations.

- [ ] **Step 3: Update the Edge Functions**

Implement:

- all passkey rows and challenge rows resolve by `account_id`
- passkey verify issues the session for `accounts.primary_auth_user_id`
- email-merge flows read/write `from_account_id`
- shared auth helpers expose the current account ID and canonical auth user ID

Minimal direction:

```ts
const accountId = await getCurrentAccountId(req);
const primaryAuthUserId = await getPrimaryAuthUserId(accountId);
```

- [ ] **Step 4: Smoke-test the account-scoped functions**

Run:

```bash
supabase functions serve passkey-list --env-file .env.local
supabase functions serve passkey-register-options --env-file .env.local
supabase functions serve email-merge-request --env-file .env.local
```

Expected: each function responds successfully for an authenticated local account after the identity foundation migration is applied.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/_shared/auth.ts \
  supabase/functions/passkey-auth-options/index.ts \
  supabase/functions/passkey-auth-verify/index.ts \
  supabase/functions/passkey-register-options/index.ts \
  supabase/functions/passkey-register-verify/index.ts \
  supabase/functions/passkey-list/index.ts \
  supabase/functions/passkey-delete/index.ts \
  supabase/functions/email-merge-request/index.ts \
  supabase/functions/email-merge-verify/index.ts
git commit -m "refactor: scope passkeys and email merge to accounts"
```

## Task 4: Sync Account Security On Auth Callback And Link Flows

**Files:**
- Modify: `src/pages/AuthCallbackPage.tsx`
- Modify: `src/pages/AuthCallbackPage.test.tsx`
- Modify: `src/features/auth/SignInForm.tsx`
- Modify: `src/features/auth/SignInForm.test.tsx`

- [ ] **Step 1: Write the failing callback test**

```tsx
it("syncs account security before redirecting after sign-in", async () => {
  mockGetSession.mockResolvedValue({
    data: { session: { access_token: "token", user: { id: "user-1" } } },
    error: null,
  });
  mockInvoke.mockResolvedValue({ data: { ok: true }, error: null });

  renderPage();

  await waitFor(() => {
    expect(mockInvoke).toHaveBeenCalledWith("account-sync-session", undefined);
    expect(mockNavigate).toHaveBeenCalledWith("/signin", { replace: true });
  });
});
```

- [ ] **Step 2: Run the auth orchestration tests**

Run:

```bash
npm run test:run -- src/pages/AuthCallbackPage.test.tsx
npm run test:run -- src/features/auth/SignInForm.test.tsx
```

Expected: FAIL until the sync call is added.

- [ ] **Step 3: Implement the client orchestration**

Add a dedicated browser helper in `src/features/auth/accountSecurityApi.ts`:

```ts
export async function syncAccountSession() {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.functions.invoke("account-sync-session");
  if (error) throw error;
}
```

Then:

- `AuthCallbackPage` calls `syncAccountSession()` after a session exists and before redirecting
- any explicit provider-link flow that returns to the app also calls it before showing success state

- [ ] **Step 4: Run the focused tests again**

Run:

```bash
npm run test:run -- src/pages/AuthCallbackPage.test.tsx
npm run test:run -- src/features/auth/SignInForm.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/AuthCallbackPage.tsx \
  src/pages/AuthCallbackPage.test.tsx \
  src/features/auth/SignInForm.tsx \
  src/features/auth/SignInForm.test.tsx
git commit -m "feat: sync account security after auth events"
```

## Task 5: Expose Account Security Summary And Keep Current Settings Functional

**Files:**
- Create: `supabase/functions/account-security-summary/index.ts`
- Modify: `src/pages/AccountSettingsPage.tsx`
- Modify: `src/pages/AccountSettingsPage.test.tsx`
- Modify: `src/types/database.ts`

- [ ] **Step 1: Add a failing settings test for account security summary loading**

```tsx
it("loads account security summary from the new edge function", async () => {
  renderAccountSettingsPage();

  await waitFor(() => {
    expect(mockInvoke).toHaveBeenCalledWith(
      "account-security-summary",
      expect.any(Object),
    );
  });
});
```

- [ ] **Step 2: Run the focused settings tests**

Run:

```bash
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
```

Expected: FAIL because the new endpoint is not wired up yet.

- [ ] **Step 3: Implement the summary endpoint and minimal page wiring**

Return a compact payload such as:

```ts
type AccountSecuritySummary = {
  primaryEmail: string | null;
  secondaryEmails: Array<{ email: string }>;
  identities: Array<{ provider: string; email: string | null }>;
  passkeys: Array<{ id: string; device_name: string | null; last_used_at: string | null }>;
};
```

Update `AccountSettingsPage` so the current page continues to work against account-scoped passkeys/emails/providers, without yet doing the major visual redesign from the UI phase.

- [ ] **Step 4: Run the focused tests and a local smoke check**

Run:

```bash
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
supabase functions serve account-security-summary --env-file .env.local
```

Expected: PASS for tests, and `account-security-summary` should respond successfully for an authenticated local account.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/account-security-summary/index.ts \
  src/pages/AccountSettingsPage.tsx \
  src/pages/AccountSettingsPage.test.tsx \
  src/types/database.ts
git commit -m "feat: expose account security summary"
```
