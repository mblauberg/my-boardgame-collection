# Repository Hardening Remediation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the repository audit findings by closing exposed Supabase function access, fixing auth navigation regressions, removing stale guardrail drift, and converging remaining outlier UI surfaces on the shared design system.

**Architecture:** Apply the security fix through additive migrations rather than rewriting the rebaseline schema, and add regression tests that enforce the intended access shape. Keep auth behavior changes localized to shared navigation helpers so sign-in flows preserve return targets consistently across modal and standalone entry points. Refactor UI outliers by reusing existing glass primitives instead of inventing new surface recipes.

**Tech Stack:** Supabase SQL migrations, Deno edge functions, React 19, React Router 7, Vitest, Testing Library, Tailwind CSS token classes.

---

### Task 1: Lock Down Privileged Supabase RPC Access

**Files:**
- Modify: `supabase/migrations/20260412042411_harden_security_definer_function_access.sql`
- Test: `src/test/supabaseFunctionAccess.test.ts`

- [ ] Write a failing regression test that asserts the migration layer revokes `anon` and `authenticated` execute access for `get_account_security_summary`, `merge_user_data`, `sync_account_email`, and `sync_account_identity`.
- [ ] Run the targeted test and confirm it fails against the current migration state.
- [ ] Add the minimal migration SQL to revoke public execute access and keep service-role execution explicit.
- [ ] Re-run the targeted test and confirm it passes.

### Task 2: Preserve Sign-In Return Paths

**Files:**
- Modify: `src/features/auth/signInNavigation.ts`
- Modify: `src/features/auth/RequireOwner.tsx`
- Modify: `src/features/auth/SignInForm.tsx`
- Modify: `src/pages/AuthCallbackPage.tsx`
- Modify: `src/pages/SignInPage.tsx`
- Test: `src/features/auth/RequireOwner.test.tsx`
- Test: `src/pages/AuthCallbackPage.test.tsx`

- [ ] Write failing tests for protected-route redirect state preservation and callback redirection back to the requested page.
- [ ] Run the targeted tests and confirm they fail for the expected reason.
- [ ] Implement a shared return-path helper and wire it through owner redirects, sign-in initiation, and callback completion.
- [ ] Re-run the targeted tests and confirm they pass.

### Task 3: Make The Sign-In Overlay Keyboard-Dismissible

**Files:**
- Modify: `src/components/auth/SignInOverlayFrame.tsx`
- Test: `src/components/auth/SignInOverlayFrame.test.tsx`

- [ ] Write a failing test for Escape-key dismissal.
- [ ] Run the targeted test and confirm it fails.
- [ ] Add the minimal Escape-key close behavior without changing existing click-dismiss behavior.
- [ ] Re-run the targeted test and confirm it passes.

### Task 4: Remove Stale Guardrail Drift And Doc Mismatch

**Files:**
- Modify: `eslint.config.js`
- Modify: `supabase/README.md`

- [ ] Remove the stale `routes 2.tsx` ignore entry.
- [ ] Correct the documented HTTP method for `account-security-summary`.
- [ ] Verify lint still passes after the config/doc changes.

### Task 5: Converge UI Outliers On Shared Glass Primitives

**Files:**
- Modify: `src/components/games/GameQuickEditForm.tsx`
- Modify: `src/components/settings/SignInMethodsSummaryCard.tsx`
- Modify: `src/components/settings/SignInMethodsSheet.tsx`
- Modify: `src/pages/AccountSettingsPage.tsx`
- Modify: `src/components/admin/GameForm.tsx`
- Modify: `src/components/admin/AdminGamesTable.tsx`
- Modify: `src/pages/AdminPage.tsx`
- Test: affected component tests where coverage exists

- [ ] Refactor quick-edit, sign-in methods, and admin surfaces to reuse `glass-*` and tokenized shared controls instead of local opaque recipes.
- [ ] Keep allowlisted arbitrary utilities stable unless a real new exception is required.
- [ ] Update or add tests that assert shared glass classes on key elements.
- [ ] Re-run the relevant component tests.

### Task 6: Legacy And Query Cleanup

**Files:**
- Modify: `src/features/library/useExploreQuery.ts`
- Modify: `src/features/library/libraryFilters.ts`
- Modify: `src/components/library/FilterBar.tsx`
- Test: `src/features/library/useExploreQuery.test.ts`

- [ ] Reduce the Explore data path to the existing `games_catalog` read model where practical.
- [ ] Remove legacy-only filter compatibility branches if they are no longer part of the supported URL contract.
- [ ] Re-run targeted explore/filter tests.

### Task 7: Final Verification

**Files:**
- No code changes expected

- [ ] Run `npm run lint`
- [ ] Run `npm run typecheck`
- [ ] Run `npm run test:run`
- [ ] Run `npm run build`
- [ ] Summarize any residual risk that remains after the hardening pass
