# Repository Hardening & Refactor Plan

## Goal

Harden the repository by fixing validated correctness/security risks, removing dead and stale code, reducing duplication, improving design consistency, and adding workflow guardrails so regressions are caught earlier.

## Approach

Use a phased rollout: implement low-risk/high-impact fixes first, then structural refactors, then platform guardrails and performance hardening. Each phase should be independently shippable.

## Phase 1 — Immediate Fixes (start now)

1. **Remove dead/stale modules and mocks**
   - Delete confirmed runtime-dead and test-only chains.
   - Remove stale `LibraryToolbar` mocks in `CollectionPage.test.tsx` and `SavedPage.test.tsx`.
   - Re-run tests to ensure behavior remains unchanged.
2. **Fix scenario mapper mismatch (critical correctness)**
   - Add failing tests for missing scenario fields.
   - Map `Game.bggRank` → `ScenarioGame.bgg_rank`, `Game.bggUsersRated` → `ScenarioGame.bgg_num_ratings`, and `Game.publishedYear` → `ScenarioGame.year_published`.
   - Verify scenario-related tests pass.

### Completed in this pass

- Removed confirmed dead/test-only module chains in:
  - `src/components/games/*` (`CollectionToolbar*`)
  - `src/components/library/*` (`FilterChip`, `LibraryToolbar`, `ProfileSearch`, `SegmentedControl`)
  - `src/features/games/*` (`collectionFilters*`, `useCollectionFilters`)
  - `src/features/library/*` (`exploreSelectors*`, `useProfileSearchQuery`, `useWishlistQuery`)
  - `src/components/admin/*` (`GameTagSelector*`, `TagManager*`)
  - `src/features/tags/*` (`useTagMutations`, `useTagsQuery`)
- Removed stale `LibraryToolbar` mocks in:
  - `src/pages/CollectionPage.test.tsx`
  - `src/pages/SavedPage.test.tsx`
- Applied critical mapper quick fix with test-first workflow in:
  - `src/features/scenarios/scenarioMappers.ts`
  - `src/features/scenarios/scenarioMappers.test.ts`
- Centralized live route metadata into a shared registry consumed by:
  - `src/app/router/routeRegistry.tsx`
  - `src/app/router/routes.tsx`
  - `src/app/router/AppRouter.tsx`
  - `src/components/layout/TopNavBar.tsx`
  - `src/components/layout/BottomTabBar.tsx`
- Replaced duplicated route-loading fallback logic with a shared router fallback.
- Added route-registry coverage in:
  - `src/app/router/routes.test.tsx`
- Replaced sign-in mount-time OAuth probing with explicit public env configuration in:
  - `src/lib/auth/oauthProviders.ts`
  - `src/lib/env.ts`
  - `src/features/auth/SignInForm.tsx`
- Added coverage and docs for the public OAuth capability contract in:
  - `src/lib/env.test.ts`
  - `src/features/auth/SignInForm.test.tsx`
  - `.env.example`
  - `README.md`
- Confirmed the shared Supabase edge-function guardrail layer is already in place:
  - request-method enforcement via `supabase/functions/_shared/cors.ts`
  - env-based origin allowlisting via `SITE_URL` and `CORS_ALLOWED_ORIGINS`
- Hardened email-merge verification sequencing in:
  - `supabase/functions/email-merge-verify/handler.ts`
  - `supabase/functions/email-merge-verify/handler.test.ts`
- Improved merge callback error handling so backend messages surface to the user in:
  - `src/pages/AuthCallbackPage.tsx`
  - `src/pages/AuthCallbackPage.test.tsx`
- Centralized collection/saved page copy and route-state defaults in:
  - `src/features/library/librarySurfaceConfigs.tsx`
  - `src/features/library/librarySurfaceConfigs.test.tsx`
- Replaced the duplicated owned collection/saved query wrappers with a single surface-aware hook in:
  - `src/features/library/useOwnedLibrarySurfaceQuery.ts`
  - `src/features/library/useOwnedLibrarySurfaceQuery.test.tsx`
- Migrated the owned/public library route wrappers to the shared surface config and removed legacy hook files:
  - `src/pages/CollectionPage.tsx`
  - `src/pages/SavedPage.tsx`
  - `src/pages/PublicCollectionPage.tsx`
  - `src/pages/PublicSavedPage.tsx`
  - removed `src/features/library/useCollectionQuery.ts`
  - removed `src/features/library/useSavedQuery.ts`
- Unified the expanding-search state plumbing used by FilterBar and ExplorePage in:
  - `src/lib/utils/useDebouncedTextInput.ts`
  - `src/lib/utils/useDebouncedTextInput.test.tsx`
- Extracted the shared expanding-search wrapper component in:
  - `src/components/library/ExpandableSearchSection.tsx`
  - `src/components/library/ExpandableSearchSection.test.tsx`
- Migrated callers and removed dead legacy search state from:
  - `src/components/library/FilterBar.tsx`
  - `src/pages/ExplorePage.tsx`
  - `src/components/library/ExpandingSearchInput.tsx`
- Added a reusable state/status surface primitive in:
  - `src/components/ui/StateMessagePanel.tsx`
  - `src/components/ui/StateMessagePanel.test.tsx`
- Rebased the legacy error wrapper onto the shared state panel in:
  - `src/components/ui/ErrorStatePanel.tsx`
- Normalized repeated auth/settings/scenario state treatments onto the shared panel in:
  - `src/pages/AuthCallbackPage.tsx`
  - `src/pages/AccountSettingsPage.tsx`
  - `src/pages/SignInMethodsPage.tsx`
  - `src/pages/ScenariosPage.tsx`
- Added page coverage for the shared signed-out sign-in-methods state in:
  - `src/pages/SignInMethodsPage.test.tsx`
- Added a server-side game catalog read model with pre-aggregated shared tags in:
  - `supabase/migrations/20260411020113_add_games_catalog_view.sql`
  - `src/types/database.ts`
- Added shared catalog mapping/fetch helpers in:
  - `src/features/games/gamesCatalog.ts`
- Replaced the ExplorePage multi-query shelf assembly with a single catalog fetch plus shared scenario-rule evaluation in:
  - `src/features/library/useExploreQuery.ts`
  - `src/features/library/useExploreQuery.test.ts`
- Replaced explore search tag re-hydration with the shared catalog read model in:
  - `src/features/library/useExploreSearch.ts`
  - `src/features/library/useExploreSearch.test.ts`

## Phase 2 — Supabase Edge Reliability & Security Hardening

1. Add explicit request-method guards per edge function (at minimum all mutation endpoints).
2. Replace wildcard CORS with environment-based allowlist.
3. Harden email merge flow:
   - Do not return success when confirmation email link generation fails.
   - Handle target-account lookup without single-page user-list assumptions.
   - Re-sequence token consumption and merge operations to reduce partial-failure lockouts.
4. Add/expand tests for merge flow and edge handler request validation.

## Phase 3 — Structural Dedup Refactors

1. Consolidate `CollectionPage` + `SavedPage` into a shared scaffold with mode/config props.
2. Consolidate `PublicCollectionPage` + `PublicSavedPage` similarly.
3. Extract reusable expanding search input used by `FilterBar` and `ExplorePage`.
4. Keep route/API contracts stable while reducing duplicated UI logic.

## Phase 4 — Tooling Guardrails

1. Add ESLint config and `lint` script aligned to current TypeScript/React patterns.
2. Expand typecheck coverage to include `api/`, `scripts/`, and Supabase function surfaces (or add equivalent checks per surface).
3. Add CI workflow to enforce `typecheck`, `test:run`, `build` (and lint once enabled).

## Phase 5 — Design & Performance Consistency

1. Normalize error surfaces to tokenized theme classes (remove hardcoded color divergences).
2. Standardize repeated shadow/gradient primitives.
3. Optimize `useExploreQuery` query fanout strategy (fewer repeated tag/join lookups; consider server-side rule execution).

## Phase 6 — Legacy Pipeline Decision

1. Decide whether migration pipeline artifacts are still required:
   - `board-game-collection.jsx`
   - `scripts/legacy/*`
   - `scripts/generateSeedData.ts`
   - `scripts/importLegacyData.ts`
   - `scripts/output/seed-data.json`
2. If migration complete, archive/remove and update docs/scripts accordingly.

## Risks / Notes

- Dead-code removal must avoid deleting anything still used by routes or lazy imports.
- Supabase hardening changes should be rolled out behind clear tests due account/auth sensitivity.
- Dedup refactors should be done incrementally to keep review diff sizes manageable.
