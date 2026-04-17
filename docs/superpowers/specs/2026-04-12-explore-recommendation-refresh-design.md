# Explore Recommendation Refresh Design

## Goal

Improve the Explore page so it:

- shows stronger recommendations now, even with sparse game metadata
- rotates results daily without feeling random or unstable
- loads fast from a single catalog fetch
- avoids repetitive shelves where appropriate
- preserves strict ordering for canonical shelves such as "Top Rated All-Time"
- remains easy to extend later when richer game metadata or user behavior data becomes available

## Current Problems

- Explore shelves are defined editorially in `src/config/scenarioPresets.ts`, but the current selection model is effectively "top N per bucket".
- Stable thresholds plus stable sorting make the page show the same small subset repeatedly.
- Global deduplication would be wrong for canonical shelves that should preserve exact ranking order.
- Future user-signal or richer metadata inputs would currently require threading new logic directly through `useExploreQuery.ts`.

## Constraints

- Explore should continue using a single `games_catalog` fetch for performance.
- Shelf definitions can remain config-driven in code for now.
- The system must work without user-specific recommendation signals.
- Missing metadata should not eliminate otherwise useful games.
- Rotation should be deterministic and stable within a UTC day.
- Explore should not depend on legacy catalog `status` values by default.

## Proposed Architecture

### Data Source

- Continue using `games_catalog` as the only Explore data source.
- `games_catalog` remains a read model over the current games and tags data; shelf selections are not stored in SQL.

### Module Boundaries

Keep `src/features/library/useExploreQuery.ts` thin. Introduce a dedicated ranking module:

- `src/features/library/exploreRanking.ts`

This module owns:

- shelf candidate selection
- sparse-data-friendly scoring
- deterministic daily rotation
- selective cross-shelf deduplication

`useExploreQuery.ts` should only:

1. fetch `games_catalog`
2. map rows into runtime game objects
3. build the UTC day seed
4. include the UTC day seed in the React Query key so daily rotation naturally invalidates
5. call `buildExploreShelves(...)`
6. return the final shelf payload

## Shelf Configuration Model

Extend the preset config shape in `src/config/scenarioPresets.ts`.

Each shelf section should support:

- `displayLimit`: final number of games shown
- `candidatePoolSize`: broader eligible pool considered before trimming
- `rankingMode`: controls scoring behavior
- `dedupe`: `"none"` or `"avoid-previous"`
- `useStatusFilter`: optional explicit override, defaults to `false`

### Defaults

When a section does not explicitly provide the new fields:

- `displayLimit`: falls back to the current section `rule.limit`
- `candidatePoolSize`: defaults to `max(displayLimit * 3, 24)`
- `rankingMode`: defaults to `discovery`
- `dedupe`: defaults to `avoid-previous` for discovery shelves and `none` for canonical shelves
- `useStatusFilter`: defaults to `false` for both discovery and canonical shelves

### Dedupe Policy

- `dedupe: "none"`
  - canonical shelves
  - preserves strict ordering and never removes titles because they appear elsewhere
- `dedupe: "avoid-previous"`
  - discovery shelves
  - prefers variety by skipping already-selected games where possible
  - backfills from later eligible candidates

### Recommended Defaults

- `top-rated`: `rankingMode: "canonical"`, `dedupe: "none"`
- most discovery shelves such as `trending`, `quick-wins`, `hidden-gems`, `by-mechanic`, `by-player-count`: `dedupe: "avoid-previous"`

## Ranking Strategy

### Candidate Selection

For each section:

1. evaluate eligibility using the existing scenario-rule matcher
   - for Explore, matcher evaluation should ignore `status` by default for both discovery and canonical shelves
   - if `useStatusFilter` is `true`, then `rule.statuses` is respected for that section
2. build a candidate pool larger than the displayed count
3. score candidates
4. if the shelf is a discovery shelf, rotate the candidate pool deterministically for the current UTC day
5. apply dedupe policy
6. trim to `displayLimit`

This replaces "take the top 8/12/16 immediately" with "rank a broader pool, then select the day’s slice".

### Hard vs Soft Rule Handling

Not every current scenario rule should remain a hard filter for discovery shelves when metadata is missing.

Hard eligibility filters for all shelf types:

- hidden rules
- tag inclusion/exclusion rules
- player-count fit
- play-time fit
- category matching when category data is present

Status handling:

- `status` is not a default Explore eligibility filter
- legacy status values are treated as optional metadata only
- a shelf must explicitly opt in with `useStatusFilter: true` if it wants status-based filtering in the future
- canonical shelves do not preserve legacy status filtering; they preserve canonical ordering only

Discovery-shelf soft filters when the source field is missing:

- `minRating`
- `minRatingsCount`
- `minYear`
- `maxYear`
- `minWeight`
- `maxWeight`

Discovery behavior:

- if the field is present and fails the rule, the game is excluded
- if the field is missing, the game stays eligible and receives a confidence penalty during scoring

Canonical-shelf behavior:

- canonical shelves keep their current hard comparator/filter semantics
- if a canonical shelf depends on data that is missing, the existing rule behavior is preserved rather than softened

This keeps discovery shelves broad under sparse data while preserving strict canonical shelves.

### Scoring

Scoring should be tolerant of missing fields.

Use available fields when present:

- `bgg_rank`
- `bgg_rating`
- `bgg_usersrated`
- `published_year`
- `bgg_weight`
- tag matches
- time/player fit where applicable

Scoring principles:

- stronger known metadata should help
- missing metadata should reduce confidence slightly, not eliminate the game
- no dependence on user activity data yet
- future metadata or user-signal boosts should be additive score terms, not a redesign

### Discovery Scoring Contract

Discovery shelves should use a fixed ordered scoring contract so implementations do not drift.

Recommended precedence:

1. rule fit and tag relevance
2. quality signals: `bgg_rating`, then `bgg_rank`
3. confidence signals: `bgg_usersrated`
4. freshness/context signals: `published_year`, time/player fit, weight fit when relevant
5. completeness/confidence adjustment for missing fields
6. deterministic seeded tie-break

Implementation contract:

- tag/rule relevance is the strongest discovery input when present
- quality signals should outweigh freshness
- confidence signals should stop tiny-sample games from dominating purely on rating
- missing-field penalties should be lighter than actual rule failures
- final ties must resolve deterministically using the UTC-day seed plus a stable game identifier

### Ranking Modes

Support at least two ranking modes:

- `canonical`
  - preserves exact existing comparator semantics
  - intended for shelves like top-rated / rank-based lists
  - bypasses daily rotation entirely
  - uses the existing canonical sort order exactly; scoring does not reorder canonical results
- `discovery`
  - prioritizes quality and fit, then allows daily rotation within a broader candidate pool
  - intended for most Explore shelves

## Daily Rotation

Use deterministic UTC daily rotation.

Properties:

- stable throughout a UTC day
- changes automatically on the next UTC day
- shared across users, which keeps caching and debugging simple

Implementation direction:

- derive a day seed from the UTC date
- rank candidates by base score
- normalize scores into fixed deterministic bands before rotation:
  - example implementation target: bucket by score rounded to 0.05 increments
  - all games in the same band are considered interchangeable for freshness rotation
- sort bands by descending band score
- apply a deterministic seeded shuffle only within each band
- flatten bands back into a ranked candidate pool

Canonical shelves do not use this rotation step.

This preserves quality while still creating visible day-to-day variation.

## Selective Cross-Shelf Dedupe

Apply dedupe in final shelf-build order, not globally up front.

Dedupe scope is section-level as well as shelf-level:

- once a game is selected into an earlier section, later sections on the page may treat it as already selected if their dedupe policy is `avoid-previous`
- this applies across sections inside multi-section presets such as `by-player-count` and `by-mechanic`
- canonical sections still ignore previous selections if their dedupe policy is `none`

Behavior:

- canonical shelves ignore previous shelf selections
- discovery shelves may skip games already selected by earlier discovery/canonical shelves if configured with `avoid-previous`
- when a game is skipped, selection continues through the ranked candidate pool until the shelf fills or the pool is exhausted
- if a discovery shelf still cannot fill `displayLimit` after exhausting dedupe-safe candidates, it relaxes dedupe and backfills from its remaining ranked candidates
- if a section still cannot fill `displayLimit` because the eligible pool is genuinely too small, it returns the smaller result set rather than inventing fallback games outside the section rules

This allows:

- "Top Rated All-Time" to remain a strict BGG-rank shelf
- other shelves to show broader variety without banning strong games from all shelves

## Performance

- one `games_catalog` query per Explore page load
- all ranking and dedupe logic stays in-memory
- no extra per-shelf network calls
- deterministic UTC-day rotation remains cache-friendly compared with per-request randomness

If performance becomes a problem later, the ranking module can be optimized independently of the page/query layer.

## Testing Plan

Add unit tests for the ranking module covering:

- sparse-metadata games remain eligible and can rank
- canonical shelves preserve exact ordering
- discovery shelves rotate daily but remain stable within a day
- different UTC days produce different slices from the same candidate pool
- `dedupe: "avoid-previous"` skips prior shelf selections and backfills correctly
- `dedupe: "none"` does not omit games due to earlier shelves

Keep integration coverage in `useExploreQuery` / Explore page tests for:

- one catalog fetch
- correct shelf assembly
- canonical and discovery behavior wiring

## Non-Goals

- no move to DB-managed shelf configuration yet
- no user-personalized recommendations yet
- no extra Explore API endpoints
- no change to the core page layout in this design

## Recommended Implementation Sequence

1. Add ranking-related config fields to `scenarioPresets.ts`
2. Create `exploreRanking.ts` with pure ranking/rotation/dedupe helpers
3. Add tests for the new ranking module
4. Refactor `useExploreQuery.ts` to orchestrate fetch + ranking only
5. Update integration tests for Explore shelf behavior
6. Verify shelf output manually and with existing automated checks

## Outcome

This design keeps the current one-fetch architecture, improves recommendation quality under sparse data, introduces stable daily freshness, preserves canonical shelves, and creates a clear path to richer future recommendation signals without forcing another Explore rewrite.
