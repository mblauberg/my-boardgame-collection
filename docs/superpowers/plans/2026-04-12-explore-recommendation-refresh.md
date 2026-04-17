# Explore Recommendation Refresh Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework Explore shelf selection so it uses one catalog fetch, ignores legacy status by default, rotates discovery shelves daily, preserves canonical shelves, and yields broader, less repetitive recommendations under sparse metadata.

**Architecture:** Keep `games_catalog` as the single Explore data source and move ranking, daily rotation, and selective dedupe into a dedicated pure ranking module. `useExploreQuery.ts` becomes orchestration-only, while `scenarioPresets.ts` gains explicit shelf-selection metadata and `libraryKeys.explore(...)` becomes UTC-day-aware for cache invalidation.

**Tech Stack:** React, TypeScript, TanStack Query, Vitest, Testing Library

---

### Task 1: Extend Explore Shelf Configuration

**Files:**
- Modify: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/config/scenarioPresets.ts`
- Test: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/exploreRanking.test.ts`

- [ ] **Step 1: Write the failing test for preset metadata defaults**

```ts
it("treats top-rated as canonical and discovery shelves as deduped by default", () => {
  expect(resolveExplorePresets(["top-rated"])[0]?.sections[0]).toEqual(
    expect.objectContaining({
      rankingMode: "canonical",
      dedupe: "none",
      useStatusFilter: false,
    }),
  );

  expect(resolveExplorePresets(["trending"])[0]?.sections[0]).toEqual(
    expect.objectContaining({
      rankingMode: "discovery",
      dedupe: "avoid-previous",
      useStatusFilter: false,
    }),
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:run -- src/features/library/exploreRanking.test.ts`
Expected: FAIL because the new section metadata and defaults do not exist yet.

- [ ] **Step 3: Add explicit shelf-selection metadata to the preset model**

Update `scenarioPresets.ts` to:
- extend `ScenarioSection` with `displayLimit`, `candidatePoolSize`, `rankingMode`, `dedupe`, and `useStatusFilter`
- preserve current rule definitions, but stop relying on `rule.limit` alone for Explore selection
- mark `top-rated` explicitly as canonical with `dedupe: "none"` and `useStatusFilter: false`
- leave discovery shelves on `useStatusFilter: false`

Example target shape:

```ts
type ShelfRankingMode = "canonical" | "discovery";
type ShelfDedupeMode = "none" | "avoid-previous";

type ScenarioSection = {
  id: string;
  label: string;
  description: string;
  rule: Rule;
  displayLimit?: number;
  candidatePoolSize?: number;
  rankingMode?: ShelfRankingMode;
  dedupe?: ShelfDedupeMode;
  useStatusFilter?: boolean;
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test:run -- src/features/library/exploreRanking.test.ts`
Expected: PASS for the new config-default behavior.

- [ ] **Step 5: Commit**

```bash
git add /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/config/scenarioPresets.ts /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/exploreRanking.test.ts
git commit -m "feat: add explore shelf configuration metadata"
```

### Task 2: Build Ranking Module with Pure Discovery and Canonical Selection

**Files:**
- Create: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/exploreRanking.ts`
- Create: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/exploreRanking.test.ts`
- Modify: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/config/scenarioPresets.ts`

- [ ] **Step 1: Write failing tests for ranking, rotation, dedupe, and status-ignore behavior**

Write tests covering:
- canonical shelves preserve exact comparator ordering
- discovery shelves rotate deterministically within one UTC day
- different UTC days produce different discovery slices
- discovery shelves dedupe against earlier selected games
- dedupe does not remove games from canonical shelves
- missing metadata does not automatically exclude discovery candidates
- `rule.statuses` is ignored unless `useStatusFilter: true`

Example target:

```ts
it("ignores legacy status filters by default for discovery shelves", () => {
  const result = selectShelfGames({
    games: [ownedGame, archivedGame],
    section: { ...section, useStatusFilter: false, rule: { ...section.rule, statuses: ["owned"] } },
    selectedIds: new Set(),
    daySeed: "2026-04-12",
  });

  expect(result.map((game) => game.id)).toContain("archived-game");
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:run -- src/features/library/exploreRanking.test.ts`
Expected: FAIL because `exploreRanking.ts` and the new selection behavior do not exist yet.

- [ ] **Step 3: Implement the ranking module with pure functions**

Create `exploreRanking.ts` with focused helpers:
- `buildExploreDaySeed(date: Date): string`
- `getSectionSelectionConfig(section): Required<...>`
- `matchesExploreRule(game, section)` that ignores `status` unless `useStatusFilter: true`
- `scoreDiscoveryCandidate(game, section)`
- `rankCanonicalCandidates(games, section)`
- `rankDiscoveryCandidates(games, section, daySeed)`
- `selectShelfGames({ games, section, selectedIds, daySeed })`
- `buildExploreShelves({ games, presets, daySeed })`

Implementation constraints:
- use the existing rule/comparator logic where possible instead of duplicating business rules
- canonical shelves use exact existing comparator order
- discovery shelves use stable precedence:
  1. rule/tag fit
  2. quality (`bgg_rating`, `bgg_rank`)
  3. confidence (`bgg_usersrated`)
  4. freshness/context (`published_year`, time/player/weight fit)
  5. missing-field confidence penalty
  6. seeded tie-break
- discovery rotation should bucket rounded scores (0.05 increments), then seeded-shuffle only within equal-score bands

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:run -- src/features/library/exploreRanking.test.ts`
Expected: PASS for ranking, daily rotation, selective dedupe, and status-ignore behavior.

- [ ] **Step 5: Commit**

```bash
git add /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/exploreRanking.ts /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/exploreRanking.test.ts /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/config/scenarioPresets.ts
git commit -m "feat: add explore ranking engine"
```

### Task 3: Refactor Explore Query Orchestration and Cache Keying

**Files:**
- Modify: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/useExploreQuery.ts`
- Modify: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/useExploreQuery.test.ts`
- Modify: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/libraryKeys.ts`

- [ ] **Step 1: Write the failing tests for one-fetch orchestration and day-aware cache keys**

Add tests asserting:
- `fetchExploreData()` fetches `games_catalog` once
- Explore shelf assembly is delegated to the ranking module behavior
- `libraryKeys.explore(...)` includes the UTC day seed

Example:

```ts
it("scopes the explore query key by UTC day", () => {
  expect(libraryKeys.explore(["trending"], "2026-04-12")).toEqual([
    "library",
    "explore",
    ["trending"],
    "2026-04-12",
  ]);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:run -- src/features/library/useExploreQuery.test.ts`
Expected: FAIL because `useExploreQuery.ts` and `libraryKeys.ts` do not yet use the new ranking module or day-aware keys.

- [ ] **Step 3: Refactor `useExploreQuery.ts` into a thin orchestrator**

Implementation target:
- fetch catalog rows once with `fetchGamesCatalogRows()`
- map rows with `mapGamesCatalogRow()`
- build a UTC day seed once
- call `buildExploreShelves(...)`
- update `libraryKeys.explore(...)` to accept the day seed
- pass the day seed into the query key so TanStack Query refreshes daily

Keep `useExploreQuery.ts` focused on wiring, not ranking logic.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:run -- src/features/library/useExploreQuery.test.ts`
Expected: PASS with one-fetch shelf assembly and day-aware query key coverage.

- [ ] **Step 5: Commit**

```bash
git add /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/useExploreQuery.ts /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/useExploreQuery.test.ts /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/libraryKeys.ts
git commit -m "refactor: thin explore query orchestration"
```

### Task 4: Preserve Explore Page Contracts and Multi-Section Behavior

**Files:**
- Modify: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/pages/ExplorePage.tsx`
- Modify: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/pages/ExplorePage.test.tsx`

- [ ] **Step 1: Write the failing page-level test for canonical and discovery shelf wiring**

Add a page-level test asserting:
- canonical shelves still render when populated
- multi-section presets still map at least two sections correctly
- the page continues to request the same preset IDs

Example:

```tsx
it("renders canonical and discovery shelves without changing page structure", () => {
  vi.mocked(useExploreQuery).mockReturnValue({
    data: {
      shelves: [
        { id: "top-rated", title: "Top Rated All-Time", entries: [game], sections: [] },
        {
          id: "by-mechanic",
          title: "Discover by Mechanic",
          entries: [],
          sections: [
            { id: "engine-building", label: "Engine Building", description: "", games: [game] },
            { id: "deck-building", label: "Deck Building", description: "", games: [secondGame] },
          ],
        },
      ],
    },
    isLoading: false,
    error: null,
  } as never);
});
```

- [ ] **Step 2: Run the test to verify it fails if page contracts drift**

Run: `npm run test:run -- src/pages/ExplorePage.test.tsx`
Expected: FAIL if the page assumptions no longer align with the new shelf payload.

- [ ] **Step 3: Apply the minimal page adjustments**

Only change `ExplorePage.tsx` if needed to:
- keep hero shelves and discover sections rendering correctly
- keep search behavior unchanged
- avoid unnecessary UI structure changes

Do not redesign the page layout in this task.

- [ ] **Step 4: Run the page test to verify it passes**

Run: `npm run test:run -- src/pages/ExplorePage.test.tsx`
Expected: PASS with unchanged page structure and corrected shelf semantics.

- [ ] **Step 5: Commit**

```bash
git add /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/pages/ExplorePage.tsx /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/pages/ExplorePage.test.tsx
git commit -m "test: preserve explore page contracts"
```

### Task 5: End-to-End Verification

**Files:**
- Verify: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/exploreRanking.ts`
- Verify: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/useExploreQuery.ts`
- Verify: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/config/scenarioPresets.ts`
- Verify: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/pages/ExplorePage.tsx`

- [ ] **Step 1: Run focused Explore tests**

Run: `npm run test:run -- src/features/library/exploreRanking.test.ts src/features/library/useExploreQuery.test.ts src/pages/ExplorePage.test.tsx`
Expected: PASS

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: Run the full test suite**

Run: `npm run test:run`
Expected: PASS

- [ ] **Step 5: Run the production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit final verification-safe implementation**

```bash
git add /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/config/scenarioPresets.ts /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/exploreRanking.ts /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/exploreRanking.test.ts /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/useExploreQuery.ts /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/useExploreQuery.test.ts /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/features/library/libraryKeys.ts /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/pages/ExplorePage.tsx /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/pages/ExplorePage.test.tsx
git commit -m "feat: refresh explore recommendations"
```

### Task 6: Manual Sanity Check

**Files:**
- Verify: `/Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src/pages/ExplorePage.tsx`

- [ ] **Step 1: Start the app locally**

Run: `npm run dev`
Expected: dev server starts successfully

- [ ] **Step 2: Load `/explore` and verify shelf behavior**

Manual checks:
- canonical shelf order remains stable within the same day
- discovery shelves show broader variety than the old fixed top-N output
- discovery shelves do not feel duplicated across sections
- the page does not visibly reshuffle during a simple refresh inside the same UTC day

- [ ] **Step 3: Capture any follow-up tuning separately**

If ranking output still feels off, record tuning notes in a follow-up doc or issue. Do not expand scope inside this implementation.

- [ ] **Step 4: Commit only if manual-fix changes were required**

```bash
git add /Users/user/Documents/01_Active/Personal_Projects/my-boardgame-collection/src
git commit -m "chore: tune explore recommendation output"
```
