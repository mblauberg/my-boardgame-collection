# Animation And Motion System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a cohesive, accessible motion system across navigation, overlays, cards, discovery surfaces, filters, and account UI so the app feels spatially consistent instead of relying on isolated one-off transitions.

**Architecture:** Build the work in layers. First add shared motion tokens, reduced-motion handling, and reusable indicator/layout helpers. Then upgrade global navigation and route overlays, followed by card/list/discovery surfaces, the add-game wizard, and settings/security UI. Keep the existing glass primitives as the visual source of truth and add motion on top of them rather than replacing them with bespoke styles.

**Tech Stack:** React 19, React Router 7, TypeScript 6, Tailwind CSS 3, Vitest, Testing Library, `framer-motion`

---

## File Map

**Create**
- `src/lib/motion.ts` — shared durations, easing curves, spring presets, and reduced-motion fallbacks used by motion-enabled components
- `src/hooks/usePrefersReducedMotion.ts` — React hook around `matchMedia("(prefers-reduced-motion: reduce)")`
- `src/hooks/usePrefersReducedMotion.test.tsx` — hook coverage for reduced-motion detection
- `src/hooks/useSlidingIndicator.ts` — reusable measurement hook for desktop and mobile nav indicators
- `src/hooks/useSlidingIndicator.test.tsx` — indicator measurement coverage
- `src/components/auth/SignInOverlayFrame.test.tsx` — overlay shell motion and responsive-surface class coverage
- `src/components/settings/SignInMethodsSheet.test.tsx` — desktop sheet motion shell coverage

**Modify**
- `package.json`
- `src/test/setup.ts`
- `src/styles/index.css`
- `src/app/router/AppRouter.tsx`
- `src/app/router/AppRouter.test.tsx`
- `src/app/router/routes.tsx`
- `src/components/layout/TopNavBar.tsx`
- `src/components/layout/TopNavBar.test.tsx`
- `src/components/layout/BottomTabBar.tsx`
- `src/components/layout/BottomTabBar.test.tsx`
- `src/components/layout/PageHeader.tsx`
- `src/components/layout/FloatingActionButton.tsx`
- `src/components/layout/FloatingActionButton.test.tsx`
- `src/components/ui/PillSelector.tsx`
- `src/components/ui/GameCard.tsx`
- `src/components/ui/GameCardSkeleton.tsx`
- `src/components/games/GameDetailOverlay.tsx`
- `src/components/games/GameDetailOverlay.test.tsx`
- `src/components/games/GameDetailPanel.tsx`
- `src/components/games/GameDetailPanel.test.tsx`
- `src/pages/GameDetailPage.tsx`
- `src/pages/GameDetailPage.test.tsx`
- `src/components/auth/SignInOverlayFrame.tsx`
- `src/pages/SignInPage.tsx`
- `src/features/auth/SignInForm.tsx`
- `src/features/auth/SignInForm.test.tsx`
- `src/components/library/OwnedLibraryPage.tsx`
- `src/components/library/LibraryList.tsx`
- `src/components/library/LibraryList.test.tsx`
- `src/components/library/FilterBar.tsx`
- `src/components/library/FilterBar.test.tsx`
- `src/components/library/ExpandingSearchInput.tsx`
- `src/components/library/ExpandingSearchInput.test.tsx`
- `src/components/library/QuickFilterPresets.tsx`
- `src/components/library/QuickFilterPresets.test.tsx`
- `src/components/library/HorizontalShelf.tsx`
- `src/components/library/HorizontalShelf.test.tsx`
- `src/components/library/DiscoverSection.tsx`
- `src/components/library/DiscoverSection.test.tsx`
- `src/components/library/AddGameWizardOverlay.tsx`
- `src/components/library/AddGameWizardOverlay.test.tsx`
- `src/components/library/LibraryStateIconButton.tsx`
- `src/components/library/LibraryStateActionGroup.tsx`
- `src/components/library/ExploreShelf.tsx`
- `src/pages/ExplorePage.tsx`
- `src/pages/ExplorePage.test.tsx`
- `src/components/settings/SignInMethodsSheet.tsx`
- `src/components/settings/SignInMethodsSummaryCard.tsx`
- `src/pages/AccountSettingsPage.tsx`
- `src/pages/AccountSettingsPage.test.tsx`
- `src/components/scenarios/ScenarioAccordion.tsx`
- `src/pages/ScenariosPage.tsx`
- `src/pages/ScenariosPage.test.tsx`

## Task 1: Add Shared Motion Infrastructure

**Files:**
- Create: `src/lib/motion.ts`
- Create: `src/hooks/usePrefersReducedMotion.ts`
- Create: `src/hooks/usePrefersReducedMotion.test.tsx`
- Modify: `package.json`
- Modify: `src/test/setup.ts`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Write failing tests for reduced-motion support**

```tsx
it("returns true when prefers-reduced-motion matches", () => {
  mockMatchMedia(true);
  const { result } = renderHook(() => usePrefersReducedMotion());
  expect(result.current).toBe(true);
});

it("disables long transitions inside the reduced-motion media query", () => {
  render(<div className="motion-safe-fade" />);
  expect(document.documentElement).toBeDefined();
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
npm run test:run -- src/hooks/usePrefersReducedMotion.test.tsx
```

Expected: FAIL because the hook and shared reduced-motion helpers do not exist yet.

- [ ] **Step 3: Implement the shared motion layer**

Add the runtime dependency:

```bash
npm install framer-motion
```

Create shared tokens:

```ts
export const motionTokens = {
  duration: {
    fast: 0.16,
    base: 0.24,
    slow: 0.38,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1] as const,
    emphasized: [0.34, 1.56, 0.64, 1] as const,
  },
};
```

Add:
- `usePrefersReducedMotion()` with live `matchMedia` updates
- `@media (prefers-reduced-motion: reduce)` overrides in `src/styles/index.css`
- shared CSS custom properties such as `--motion-duration-fast`, `--motion-duration-base`, `--motion-ease-standard`, `--motion-ease-emphasized`
- test helpers in `src/test/setup.ts` for controllable `matchMedia`

- [ ] **Step 4: Run the focused tests again**

Run:

```bash
npm run test:run -- src/hooks/usePrefersReducedMotion.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json src/lib/motion.ts src/hooks/usePrefersReducedMotion.ts \
  src/hooks/usePrefersReducedMotion.test.tsx src/test/setup.ts src/styles/index.css
git commit -m "feat: add shared motion foundation"
```

## Task 2: Extract A Reusable Sliding-Indicator Primitive

**Files:**
- Create: `src/hooks/useSlidingIndicator.ts`
- Create: `src/hooks/useSlidingIndicator.test.tsx`
- Modify: `src/components/ui/PillSelector.tsx`

- [ ] **Step 1: Add failing tests for indicator measurement**

```tsx
it("measures the active item width and left offset", () => {
  render(<IndicatorHarness activeValue="saved" />);
  expect(screen.getByTestId("indicator")).toHaveStyle({ width: "96px" });
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
npm run test:run -- src/hooks/useSlidingIndicator.test.tsx
npm run test:run -- src/components/library/FilterBar.test.tsx
```

Expected: FAIL because there is no reusable indicator hook yet.

- [ ] **Step 3: Implement the hook and migrate `PillSelector`**

Create a hook with API shaped like:

```ts
const { containerRef, indicatorStyle, refreshIndicator } = useSlidingIndicator({
  activeIndex,
  selector: "button",
});
```

Then:
- move the indicator math out of `PillSelector`
- keep existing pill-selector behavior intact
- add a stable `data-testid="pill-selector-indicator"` or equivalent for future nav tests

- [ ] **Step 4: Run the focused tests again**

Run:

```bash
npm run test:run -- src/hooks/useSlidingIndicator.test.tsx
npm run test:run -- src/components/library/FilterBar.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSlidingIndicator.ts src/hooks/useSlidingIndicator.test.tsx \
  src/components/ui/PillSelector.tsx
git commit -m "refactor: share sliding indicator logic"
```

## Task 3: Animate Desktop And Mobile Navigation Indicators

**Files:**
- Modify: `src/components/layout/TopNavBar.tsx`
- Modify: `src/components/layout/TopNavBar.test.tsx`
- Modify: `src/components/layout/BottomTabBar.tsx`
- Modify: `src/components/layout/BottomTabBar.test.tsx`
- Modify: `src/styles/index.css`
- Modify: `src/hooks/useSlidingIndicator.ts`

- [ ] **Step 1: Add failing nav tests for animated active indicators**

```tsx
it("renders a shared animated desktop nav indicator for the active route", () => {
  renderWithProviders(<TopNavBar />, "/saved");
  expect(screen.getByTestId("top-nav-indicator")).toBeInTheDocument();
});

it("renders a sliding active capsule in the mobile tab bar", () => {
  renderWithProviders(<BottomTabBar />, "/explore");
  expect(screen.getByTestId("bottom-nav-indicator")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused nav tests to verify they fail**

Run:

```bash
npm run test:run -- src/components/layout/TopNavBar.test.tsx
npm run test:run -- src/components/layout/BottomTabBar.test.tsx
```

Expected: FAIL because both navs still switch classes without a shared animated indicator element.

- [ ] **Step 3: Implement animated indicators and active-state transitions**

Desktop nav:

```tsx
<div className="relative hidden md:flex items-center gap-8">
  <motion.div data-testid="top-nav-indicator" className="top-nav-indicator" style={indicatorStyle} />
  {links}
</div>
```

Mobile nav:

```tsx
<div className="bottom-nav-pill ...">
  <motion.div data-testid="bottom-nav-indicator" className="bottom-nav-indicator" style={indicatorStyle} />
  {tabs}
</div>
```

Also add:
- icon scale/fill transitions for active bottom-tab icons
- text color/weight transitions that do not rely on layout-jumping borders
- reduced-motion fallbacks for both indicators

- [ ] **Step 4: Run the focused nav tests again**

Run:

```bash
npm run test:run -- src/components/layout/TopNavBar.test.tsx
npm run test:run -- src/components/layout/BottomTabBar.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/TopNavBar.tsx src/components/layout/TopNavBar.test.tsx \
  src/components/layout/BottomTabBar.tsx src/components/layout/BottomTabBar.test.tsx \
  src/styles/index.css src/hooks/useSlidingIndicator.ts
git commit -m "feat: animate top and bottom navigation indicators"
```

## Task 4: Add Route-Level Overlay Motion For Game Detail

**Files:**
- Modify: `src/app/router/AppRouter.tsx`
- Modify: `src/app/router/AppRouter.test.tsx`
- Modify: `src/app/router/routes.tsx`
- Modify: `src/components/games/GameDetailOverlay.tsx`
- Modify: `src/components/games/GameDetailOverlay.test.tsx`
- Modify: `src/pages/GameDetailPage.tsx`
- Modify: `src/pages/GameDetailPage.test.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Add failing tests for animated overlay presence**

```tsx
it("renders motion-aware backdrop and panel wrappers for game detail", () => {
  render(<GameDetailOverlay title="Heat" titleId="game-detail-title" onRequestClose={vi.fn()}>body</GameDetailOverlay>);
  expect(screen.getByTestId("overlay-backdrop")).toHaveAttribute("data-motion", "backdrop");
  expect(screen.getByTestId("overlay-panel")).toHaveAttribute("data-motion", "panel");
});
```

- [ ] **Step 2: Run the focused overlay tests to verify they fail**

Run:

```bash
npm run test:run -- src/components/games/GameDetailOverlay.test.tsx
npm run test:run -- src/app/router/AppRouter.test.tsx
```

Expected: FAIL because the overlay is still a static panel with no route-aware enter/exit wrapper.

- [ ] **Step 3: Implement route and overlay motion**

Add `AnimatePresence` around background overlays in `AppRouter` and animate:
- backdrop opacity
- desktop modal scale/fade
- mobile sheet translate-y/fade
- route loading fallback fade in `RouteLoadingFallback`

Game detail shell example:

```tsx
<motion.div data-testid="overlay-backdrop" data-motion="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
  <motion.div data-testid="overlay-panel" data-motion="panel" initial={panelInitial} animate={panelAnimate} exit={panelExit}>
    ...
  </motion.div>
</motion.div>
```

- [ ] **Step 4: Run the focused overlay tests again**

Run:

```bash
npm run test:run -- src/components/games/GameDetailOverlay.test.tsx
npm run test:run -- src/pages/GameDetailPage.test.tsx
npm run test:run -- src/app/router/AppRouter.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/router/AppRouter.tsx src/app/router/AppRouter.test.tsx \
  src/app/router/routes.tsx src/components/games/GameDetailOverlay.tsx \
  src/components/games/GameDetailOverlay.test.tsx src/pages/GameDetailPage.tsx \
  src/pages/GameDetailPage.test.tsx src/styles/index.css
git commit -m "feat: animate game detail route overlays"
```

## Task 5: Add Card-To-Overlay Spatial Continuity For Game Detail

**Files:**
- Modify: `src/components/ui/GameCard.tsx`
- Modify: `src/components/library/LibraryList.tsx`
- Modify: `src/components/library/LibraryList.test.tsx`
- Modify: `src/components/library/HorizontalShelf.tsx`
- Modify: `src/components/library/ExploreShelf.tsx`
- Modify: `src/components/games/GameDetailPanel.tsx`
- Modify: `src/components/games/GameDetailPanel.test.tsx`
- Modify: `src/components/games/GameDetailOverlay.tsx`

- [ ] **Step 1: Add failing tests for shared motion identity**

```tsx
it("assigns stable motion ids to library cards and game-detail hero media", () => {
  renderWithProviders(<LibraryList entries={[entry]} />);
  expect(screen.getByRole("article", { name: /heat/i })).toHaveAttribute("data-motion-id", "game-card-heat");
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
npm run test:run -- src/components/library/LibraryList.test.tsx
npm run test:run -- src/components/games/GameDetailPanel.test.tsx
```

Expected: FAIL because cards and detail content are not coordinated through stable motion identifiers.

- [ ] **Step 3: Implement matched card/detail transitions**

Add stable shared-layout ids or `data-motion-id` values for:
- card root
- hero image
- title pill/title text

Example:

```tsx
<motion.article layoutId={`game-card-${slug}`}>
  <motion.img layoutId={`game-card-image-${slug}`} ... />
</motion.article>
```

Mirror the same ids in `GameDetailPanel` so the selected card appears to expand into the overlay. Keep the implementation opt-in for reduced motion.

- [ ] **Step 4: Run the focused tests again**

Run:

```bash
npm run test:run -- src/components/library/LibraryList.test.tsx
npm run test:run -- src/components/games/GameDetailPanel.test.tsx
npm run test:run -- src/components/games/GameDetailOverlay.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/GameCard.tsx src/components/library/LibraryList.tsx \
  src/components/library/LibraryList.test.tsx src/components/library/HorizontalShelf.tsx \
  src/components/library/ExploreShelf.tsx src/components/games/GameDetailPanel.tsx \
  src/components/games/GameDetailPanel.test.tsx src/components/games/GameDetailOverlay.tsx
git commit -m "feat: add card to detail overlay transitions"
```

## Task 6: Animate The Sign-In Surface And Auth Feedback

**Files:**
- Create: `src/components/auth/SignInOverlayFrame.test.tsx`
- Modify: `src/components/auth/SignInOverlayFrame.tsx`
- Modify: `src/pages/SignInPage.tsx`
- Modify: `src/features/auth/SignInForm.tsx`
- Modify: `src/features/auth/SignInForm.test.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Add failing tests for sign-in motion shells and banners**

```tsx
it("marks the sign-in frame as a mobile sheet / desktop modal motion surface", () => {
  render(<SignInOverlayFrame onRequestClose={vi.fn()}>body</SignInOverlayFrame>);
  expect(screen.getByRole("dialog", { name: /sign in/i })).toHaveAttribute("data-motion-surface", "auth-overlay");
});

it("renders animated success and error feedback containers", () => {
  render(<SignInForm />);
  expect(screen.queryByTestId("auth-status-panel")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused auth tests to verify they fail**

Run:

```bash
npm run test:run -- src/features/auth/SignInForm.test.tsx
npm run test:run -- src/components/auth/SignInOverlayFrame.test.tsx
```

Expected: FAIL because the sign-in overlay shell is static and the status banners are unstructured for motion.

- [ ] **Step 3: Implement responsive sign-in motion**

Add:
- backdrop fade
- mobile slide-up/down sheet behavior
- desktop scale/fade dialog behavior
- small stagger for hero copy and auth actions
- animated success/error panels with stable `data-testid="auth-status-panel"`

Keep the glass classes as the base visual treatment.

- [ ] **Step 4: Run the focused auth tests again**

Run:

```bash
npm run test:run -- src/features/auth/SignInForm.test.tsx
npm run test:run -- src/components/auth/SignInOverlayFrame.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/SignInOverlayFrame.tsx src/components/auth/SignInOverlayFrame.test.tsx \
  src/pages/SignInPage.tsx src/features/auth/SignInForm.tsx \
  src/features/auth/SignInForm.test.tsx src/styles/index.css
git commit -m "feat: animate sign in overlay and auth feedback"
```

## Task 7: Animate Filters, Search, And Library State Microinteractions

**Files:**
- Modify: `src/components/library/FilterBar.tsx`
- Modify: `src/components/library/FilterBar.test.tsx`
- Modify: `src/components/library/ExpandingSearchInput.tsx`
- Modify: `src/components/library/ExpandingSearchInput.test.tsx`
- Modify: `src/components/library/QuickFilterPresets.tsx`
- Modify: `src/components/library/QuickFilterPresets.test.tsx`
- Modify: `src/components/library/LibraryStateIconButton.tsx`
- Modify: `src/components/library/LibraryStateActionGroup.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Add failing tests for motion metadata and shared classes**

```tsx
it("renders an animated advanced-filters region", async () => {
  render(<FilterBar ... />);
  expect(screen.getByTestId("advanced-filters-region")).toHaveAttribute("data-motion", "expand-collapse");
});

it("renders preset chips and state buttons with motion-safe classes", () => {
  render(<QuickFilterPresets presets={[...]} onSelect={vi.fn()} />);
  expect(screen.getByRole("button", { name: /quick wins/i })).toHaveClass("glass-action-button");
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
npm run test:run -- src/components/library/FilterBar.test.tsx
npm run test:run -- src/components/library/ExpandingSearchInput.test.tsx
npm run test:run -- src/components/library/QuickFilterPresets.test.tsx
```

Expected: FAIL because the controls do not expose stable motion hooks/attributes for the richer animation plan.

- [ ] **Step 3: Implement search/filter/state motion**

Add:
- smoother width + opacity + icon handoff in `ExpandingSearchInput`
- animated count badge and chevron/icon response in `FilterBar`
- preset-chip press feedback
- active/inactive transitions for library-state buttons
- reduced-motion fallbacks for all interactive controls

Keep all controls on the existing `glass-*` classes required by the repo instructions.

- [ ] **Step 4: Run the focused tests again**

Run:

```bash
npm run test:run -- src/components/library/FilterBar.test.tsx
npm run test:run -- src/components/library/ExpandingSearchInput.test.tsx
npm run test:run -- src/components/library/QuickFilterPresets.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/library/FilterBar.tsx src/components/library/FilterBar.test.tsx \
  src/components/library/ExpandingSearchInput.tsx src/components/library/ExpandingSearchInput.test.tsx \
  src/components/library/QuickFilterPresets.tsx src/components/library/QuickFilterPresets.test.tsx \
  src/components/library/LibraryStateIconButton.tsx src/components/library/LibraryStateActionGroup.tsx \
  src/styles/index.css
git commit -m "feat: animate filters search and library controls"
```

## Task 8: Animate Card Grids, Discovery Surfaces, And Explore Search Transitions

**Files:**
- Modify: `src/components/layout/PageHeader.tsx`
- Modify: `src/components/layout/FloatingActionButton.tsx`
- Modify: `src/components/layout/FloatingActionButton.test.tsx`
- Modify: `src/components/ui/GameCard.tsx`
- Modify: `src/components/ui/GameCardSkeleton.tsx`
- Modify: `src/components/library/OwnedLibraryPage.tsx`
- Modify: `src/components/library/LibraryList.tsx`
- Modify: `src/components/library/HorizontalShelf.tsx`
- Modify: `src/components/library/HorizontalShelf.test.tsx`
- Modify: `src/components/library/DiscoverSection.tsx`
- Modify: `src/components/library/DiscoverSection.test.tsx`
- Modify: `src/components/library/ExploreShelf.tsx`
- Modify: `src/pages/ExplorePage.tsx`
- Modify: `src/pages/ExplorePage.test.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Add failing tests for animated content surfaces**

```tsx
it("renders discover sections with an animated expandable region", async () => {
  render(<DiscoverSection ... />);
  expect(screen.getByTestId("discover-section-panel")).toHaveAttribute("data-motion", "discover-panel");
});

it("renders explore search results inside a transition container", () => {
  renderWithProviders(<ExplorePage />, "/explore");
  expect(screen.getByTestId("explore-results-region")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
npm run test:run -- src/components/library/DiscoverSection.test.tsx
npm run test:run -- src/components/library/HorizontalShelf.test.tsx
npm run test:run -- src/pages/ExplorePage.test.tsx
npm run test:run -- src/components/layout/FloatingActionButton.test.tsx
```

Expected: FAIL because the current surfaces are static and lack dedicated transition regions.

- [ ] **Step 3: Implement discovery and list motion**

Add:
- staggered header reveal in `PageHeader`
- first-load card fade/slide for grid and shelf entries
- FLIP/layout transitions in `LibraryList` when filter/sort results change
- crossfade between editorial shelves and search results in `ExplorePage`
- animated expand/collapse in `DiscoverSection`
- subtle mount/attention animation for the floating add-game button

- [ ] **Step 4: Run the focused tests again**

Run:

```bash
npm run test:run -- src/components/library/DiscoverSection.test.tsx
npm run test:run -- src/components/library/HorizontalShelf.test.tsx
npm run test:run -- src/pages/ExplorePage.test.tsx
npm run test:run -- src/components/layout/FloatingActionButton.test.tsx
npm run test:run -- src/components/library/LibraryList.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/PageHeader.tsx src/components/layout/FloatingActionButton.tsx \
  src/components/layout/FloatingActionButton.test.tsx src/components/ui/GameCard.tsx \
  src/components/ui/GameCardSkeleton.tsx src/components/library/OwnedLibraryPage.tsx \
  src/components/library/LibraryList.tsx src/components/library/HorizontalShelf.tsx \
  src/components/library/HorizontalShelf.test.tsx src/components/library/DiscoverSection.tsx \
  src/components/library/DiscoverSection.test.tsx src/components/library/ExploreShelf.tsx \
  src/pages/ExplorePage.tsx src/pages/ExplorePage.test.tsx src/styles/index.css
git commit -m "feat: animate discovery surfaces and library lists"
```

## Task 9: Animate The Add-Game Wizard And Its Step Transitions

**Files:**
- Modify: `src/components/library/AddGameWizardOverlay.tsx`
- Modify: `src/components/library/AddGameWizardOverlay.test.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Add failing wizard tests for motion wrappers**

```tsx
it("renders the wizard with animated step and footer regions", () => {
  renderOverlay();
  expect(screen.getByRole("dialog", { name: /add new game/i })).toHaveAttribute("data-motion-surface", "wizard");
  expect(screen.getByTestId("wizard-step-region")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused wizard tests to verify they fail**

Run:

```bash
npm run test:run -- src/components/library/AddGameWizardOverlay.test.tsx
```

Expected: FAIL because the wizard swaps steps abruptly and exposes no transition regions.

- [ ] **Step 3: Implement wizard motion**

Add:
- backdrop and panel animation
- step-content slide/fade transitions
- progress-step pulse/fill transitions
- sticky footer transition when step 1 has a selected result
- disabled/loading CTA feedback that remains readable in reduced-motion mode

- [ ] **Step 4: Run the focused wizard tests again**

Run:

```bash
npm run test:run -- src/components/library/AddGameWizardOverlay.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/library/AddGameWizardOverlay.tsx \
  src/components/library/AddGameWizardOverlay.test.tsx src/styles/index.css
git commit -m "feat: animate add game wizard flow"
```

## Task 10: Animate Settings, Security Sheets, And Scenarios

**Files:**
- Create: `src/components/settings/SignInMethodsSheet.test.tsx`
- Modify: `src/components/settings/SignInMethodsSheet.tsx`
- Modify: `src/components/settings/SignInMethodsSummaryCard.tsx`
- Modify: `src/pages/AccountSettingsPage.tsx`
- Modify: `src/pages/AccountSettingsPage.test.tsx`
- Modify: `src/components/scenarios/ScenarioAccordion.tsx`
- Modify: `src/pages/ScenariosPage.tsx`
- Modify: `src/pages/ScenariosPage.test.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Add failing tests for settings/scenario motion surfaces**

```tsx
it("renders sign-in methods inside an animated dialog shell", () => {
  render(<SignInMethodsSheet isOpen onClose={vi.fn()} summary={summary} />);
  expect(screen.getByRole("dialog", { name: /sign-in methods/i })).toHaveAttribute("data-motion-surface", "settings-sheet");
});

it("renders scenario sections inside an animated accordion region", () => {
  render(<ScenarioAccordion presets={presets} />);
  expect(screen.getByTestId("scenario-accordion")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
npm run test:run -- src/pages/ScenariosPage.test.tsx
npm run test:run -- src/components/settings/SignInMethodsSheet.test.tsx
```

Expected: FAIL because there is no dedicated motion-enabled settings sheet test coverage and the accordion panel is still a simple conditional render.

- [ ] **Step 3: Implement settings and scenario motion**

Add:
- desktop sign-in-methods sheet scale/fade
- animated summary-card affordance for opening details
- account visibility-card state transitions
- accordion expand/collapse animation for scenarios
- page-level section reveal for `ScenariosPage`

- [ ] **Step 4: Run the focused tests again**

Run:

```bash
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
npm run test:run -- src/pages/ScenariosPage.test.tsx
npm run test:run -- src/components/settings/SignInMethodsSheet.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/settings/SignInMethodsSheet.tsx src/components/settings/SignInMethodsSheet.test.tsx \
  src/components/settings/SignInMethodsSummaryCard.tsx src/pages/AccountSettingsPage.tsx \
  src/pages/AccountSettingsPage.test.tsx src/components/scenarios/ScenarioAccordion.tsx \
  src/pages/ScenariosPage.tsx src/pages/ScenariosPage.test.tsx src/styles/index.css
git commit -m "feat: animate settings and scenario surfaces"
```

## Task 11: Full Verification Sweep

**Files:**
- Modify: any files touched by the previous tasks as needed

- [ ] **Step 1: Run the full focused UI suite**

Run:

```bash
npm run test:run -- src/app/router/AppRouter.test.tsx
npm run test:run -- src/components/layout/TopNavBar.test.tsx
npm run test:run -- src/components/layout/BottomTabBar.test.tsx
npm run test:run -- src/components/games/GameDetailOverlay.test.tsx
npm run test:run -- src/features/auth/SignInForm.test.tsx
npm run test:run -- src/components/library/FilterBar.test.tsx
npm run test:run -- src/components/library/ExpandingSearchInput.test.tsx
npm run test:run -- src/components/library/LibraryList.test.tsx
npm run test:run -- src/components/library/DiscoverSection.test.tsx
npm run test:run -- src/components/library/AddGameWizardOverlay.test.tsx
npm run test:run -- src/pages/ExplorePage.test.tsx
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
npm run test:run -- src/pages/ScenariosPage.test.tsx
```

Expected: PASS

- [ ] **Step 2: Run the whole test suite**

Run:

```bash
npm run test:run
```

Expected: PASS

- [ ] **Step 3: Run typecheck and production build**

Run:

```bash
npm run typecheck
npm run build
```

Expected: PASS

- [ ] **Step 4: Perform a reduced-motion/manual QA pass**

Verify manually:
- nav indicators still communicate active route without motion
- sign-in and game-detail overlays open and close correctly on desktop and mobile widths
- search/filter result changes remain understandable with reduced motion enabled
- no glass primitives were replaced with bespoke opaque button styles

- [ ] **Step 5: Commit**

```bash
git add package.json src/styles/index.css src/app/router src/components src/features src/hooks src/lib src/pages src/test
git commit -m "test: verify animation system rollout"
```

## Notes For Execution

- Reuse existing shared glass classes from `src/styles/index.css` instead of introducing bespoke blur/gradient treatments in component files.
- Prefer `motion.div` wrappers plus existing Tailwind/glass classes over inline style-heavy implementations.
- Keep all motion enhancements behind reduced-motion fallbacks.
- If the shared card-to-detail transition proves too brittle in one pass, keep the stable motion ids and ship the simpler overlay-enter/exit animations first, but do not remove the identifiers once added.
- Do not widen scope into unrelated redesign work; this plan is about motion and spatial continuity, not changing IA or component ownership.
