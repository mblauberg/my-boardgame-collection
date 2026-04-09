# Sitewide Theme Toggle Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the account settings theme toggle switch the entire website between the approved light and dark trophy room themes, with persistent state and token-driven styling across all routes.

**Architecture:** Keep `src/lib/theme.tsx` as the single source of truth for theme state and root-level class application. Use the existing CSS-variable/Tailwind-token approach as the only theming mechanism, then replace hardcoded light-mode literals in shared UI with those tokens so route components inherit the active theme automatically.

**Tech Stack:** React, TypeScript, React Router, Tailwind CSS, CSS custom properties, Vitest, Testing Library

---

## File Structure

### Theme State And Test Harness

- Create: `src/lib/theme.test.tsx`
  Purpose: lock in `ThemeProvider` persistence, root-class application, and toggle behavior.
- Modify: `src/lib/theme.tsx`
  Purpose: harden theme initialization and document-class synchronization for full-app theme switching.
- Modify: `src/pages/AccountSettingsPage.test.tsx`
  Purpose: verify the settings-page control toggles global theme state and persists it.
- Modify: `src/test/setup.ts`
  Purpose: reset `localStorage` and document classes between tests so theme assertions are deterministic.

### Global Design Tokens

- Modify: `src/styles/index.css`
  Purpose: align the light/dark CSS variable sets with the trophy room design docs and define any missing global theme-aware utility behavior.
- Modify: `tailwind.config.ts`
  Purpose: expose any missing token-backed colors needed by components during the cleanup pass.

### Shared Shell And Search/Toolbar Surfaces

- Modify: `src/components/layout/TopNavBar.tsx`
  Purpose: ensure the global shell uses theme-aware surface, text, hover, and shadow tokens.
- Modify: `src/components/library/ProfileSearch.tsx`
  Purpose: replace light-only search input/dropdown colors with token-based surfaces.
- Modify: `src/components/library/LibraryToolbar.tsx`
  Purpose: convert white controls to layered themed controls.
- Modify: `src/components/games/CollectionToolbar.tsx`
  Purpose: remove default white/border styling so collection filters match both themes.

### Auth And Public-Facing Surfaces

- Modify: `src/pages/SignInPage.tsx`
  Purpose: remove hardcoded light palette values from the sign-in layout shell.
- Modify: `src/features/auth/SignInForm.tsx`
  Purpose: make the signed-in card, form fields, CTA, success, and error states theme-aware.
- Modify: `src/pages/PublicProfilePage.tsx`
  Purpose: replace mixed fixed-dark/fixed-light surfaces with token-backed editorial surfaces.
- Modify: `src/components/ui/PlaceholderPage.tsx`
  Purpose: keep placeholder/public promo surfaces readable in both themes.

### Final Audit Pass

- Modify: `src/pages/CollectionPage.tsx`
- Modify: `src/pages/ExplorePage.tsx`
- Modify: `src/pages/SavedPage.tsx`
- Modify: `src/pages/ScenariosPage.tsx`
- Modify: `src/pages/AuthCallbackPage.tsx`
- Modify: `src/pages/AdminPage.tsx`
- Modify: `src/components/scenarios/ScenarioAccordion.tsx`
- Modify: `src/components/scenarios/ScenarioGameRow.tsx`
  Purpose: replace the remaining hardcoded white/gray/red utilities surfaced by the final grep audit so no route is left partially light-only.

---

### Task 1: Lock In Theme Persistence With Failing Tests

**Files:**

- Create: `src/lib/theme.test.tsx`
- Modify: `src/pages/AccountSettingsPage.test.tsx`
- Modify: `src/test/setup.ts`

- [ ] **Step 1: Write a failing provider test for root-class and localStorage synchronization**

```tsx
function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {theme}
    </button>
  );
}

it("applies the saved theme to the document and persists toggles", async () => {
  localStorage.setItem("theme", "dark");
  const user = userEvent.setup();

  render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );

  expect(document.documentElement).toHaveClass("dark");
  expect(document.body).toHaveClass("dark");

  await user.click(screen.getByRole("button", { name: "dark" }));

  expect(document.documentElement).toHaveClass("light");
  expect(localStorage.getItem("theme")).toBe("light");
});
```

- [ ] **Step 2: Write a failing account-page test that exercises the real provider**

```tsx
render(
  <MemoryRouter>
    <ThemeProvider>
      <AccountSettingsPage />
    </ThemeProvider>
  </MemoryRouter>,
);

await user.click(screen.getByRole("button", { name: /toggle dark mode/i }));

expect(document.documentElement).toHaveClass("dark");
expect(localStorage.getItem("theme")).toBe("dark");
```

- [ ] **Step 3: Update shared test setup to clean theme globals**

Implement:

```ts
afterEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  document.body.className = "";
});
```

- [ ] **Step 4: Run the targeted tests and confirm they fail for the current implementation gaps**

Run: `npx vitest run src/lib/theme.test.tsx src/pages/AccountSettingsPage.test.tsx`
Expected: FAIL because the theme behavior is not yet fully covered and the account-page test does not currently render inside `ThemeProvider`.

- [ ] **Step 5: Commit the red test baseline**

```bash
git add src/lib/theme.test.tsx src/pages/AccountSettingsPage.test.tsx src/test/setup.ts
git commit -m "test: cover sitewide theme toggle behavior"
```

### Task 2: Harden ThemeProvider And Account Settings Toggle Behavior

**Files:**

- Modify: `src/lib/theme.tsx`
- Modify: `src/pages/AccountSettingsPage.tsx`
- Test: `src/lib/theme.test.tsx`
- Test: `src/pages/AccountSettingsPage.test.tsx`

- [ ] **Step 1: Make the provider safe and deterministic for test and browser initialization**

Implement:

```tsx
const THEME_STORAGE_KEY = "theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  document.body.classList.remove("light", "dark");
  document.body.classList.add(theme);
}
```

Use `applyTheme()` from both initial state setup and the effect so root/body stay synchronized in one place.

- [ ] **Step 2: Make the account-page control explicitly accessible and remove local-only styling assumptions**

Implement:

```tsx
<button
  type="button"
  aria-label="Toggle dark mode"
  onClick={toggleTheme}
  className="flex items-center gap-2 rounded-2xl bg-surface/70 px-4 py-3 text-on-surface shadow-[0_12px_40px_rgba(46,47,45,0.06)] backdrop-blur-[24px] transition hover:bg-surface-bright/70"
>
  <span className="material-symbols-outlined" aria-hidden="true">
    {theme === "dark" ? "light_mode" : "dark_mode"}
  </span>
</button>
```

While touching this file, fix invalid token class typos such as `text-on-surface-variant-variant`, `/15est`, and similar malformed utilities so the page can actually inherit theme tokens correctly.

- [ ] **Step 3: Run the targeted tests and confirm they pass**

Run: `npx vitest run src/lib/theme.test.tsx src/pages/AccountSettingsPage.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit the provider/toggle behavior**

```bash
git add src/lib/theme.tsx src/pages/AccountSettingsPage.tsx src/lib/theme.test.tsx src/pages/AccountSettingsPage.test.tsx
git commit -m "feat: make account toggle drive sitewide theme"
```

### Task 3: Align Global Tokens With The Trophy Room Light/Dark Specs

**Files:**

- Modify: `src/styles/index.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Write a failing regression assertion for a missing token if needed**

If component tests need a token-backed class that does not currently exist, add a small expectation in the nearest touched test that proves the new class name is rendered before updating config.

- [ ] **Step 2: Normalize the CSS variable sets to the approved design files**

Implement:

```css
:root {
  --surface: #f7f6f3;
  --surface-container-low: #f1f1ee;
  --surface-container-lowest: #ffffff;
  --surface-container-high: #e2e3df;
  --surface-container-highest: #ddddda;
  --surface-bright: #f7f6f3;
  --on-surface: #2e2f2d;
  --on-surface-variant: #5b5c5a;
  --primary: #8a4c00;
  --primary-container: #fd9000;
  --outline-variant: #adadab;
  --surface-tint: #8a4c00;
}

.dark {
  --surface: #131313;
  --surface-container-low: #1c1b1b;
  --surface-container-lowest: #0e0e0e;
  --surface-container-high: #2a2a2a;
  --surface-container-highest: #2a2a2a;
  --surface-bright: #3a3a3a;
  --on-surface: #e5e2e1;
  --on-surface-variant: #dcc2ae;
  --primary: #ffb97c;
  --primary-container: #ff9100;
  --outline-variant: #564334;
  --surface-tint: #ffb778;
}
```

Also make global body/link/scrollbar styles consume tokens instead of fixed light-only values.

- [ ] **Step 3: Add any missing Tailwind token aliases used by the component cleanup**

Implement entries only when needed, for example:

```ts
colors: {
  surface: "var(--surface)",
  "surface-container-low": "var(--surface-container-low)",
  "surface-container-lowest": "var(--surface-container-lowest)",
  "surface-container-high": "var(--surface-container-high)",
  "surface-container-highest": "var(--surface-container-highest)",
  "surface-bright": "var(--surface-bright)",
  "on-surface": "var(--on-surface)",
  "on-surface-variant": "var(--on-surface-variant)",
  primary: "var(--primary)",
  "primary-container": "var(--primary-container)",
  "outline-variant": "var(--outline-variant)",
}
```

- [ ] **Step 4: Run a lightweight type/build verification**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit the global token alignment**

```bash
git add src/styles/index.css tailwind.config.ts
git commit -m "refactor: align global theme tokens with trophy room spec"
```

### Task 4: Convert Shared Shell, Search, And Toolbar Surfaces To Theme Tokens

**Files:**

- Modify: `src/components/layout/TopNavBar.tsx`
- Modify: `src/components/library/ProfileSearch.tsx`
- Modify: `src/components/library/LibraryToolbar.tsx`
- Modify: `src/components/games/CollectionToolbar.tsx`
- Test: `src/components/layout/AppShell.test.tsx`
- Test: `src/pages/CollectionPage.test.tsx`
- Test: `src/pages/ExplorePage.test.tsx`
- Test: `src/pages/SavedPage.test.tsx`

- [ ] **Step 1: Write or extend a failing shell test around theme-aware control classes**

Example assertion:

```tsx
expect(screen.getByRole("navigation")).toHaveClass("bg-surface-bright/60");
```

If a better signal is available, assert that the nav/search controls no longer render `bg-white` or `border-black/10`.

- [ ] **Step 2: Replace literal surface styles in shared controls**

Implement patterns like:

```tsx
className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
```

Use this pass to update:

- `TopNavBar` glass surface, link states, and icon button hover surfaces.
- `ProfileSearch` input and dropdown.
- `LibraryToolbar` inputs, selects, and buttons.
- `CollectionToolbar` wrapper, inputs, selects, and action buttons.

- [ ] **Step 3: Run the affected page/component tests**

Run: `npx vitest run src/components/layout/AppShell.test.tsx src/pages/CollectionPage.test.tsx src/pages/ExplorePage.test.tsx src/pages/SavedPage.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit the shared-surface cleanup**

```bash
git add src/components/layout/TopNavBar.tsx src/components/library/ProfileSearch.tsx src/components/library/LibraryToolbar.tsx src/components/games/CollectionToolbar.tsx src/components/layout/AppShell.test.tsx src/pages/CollectionPage.test.tsx src/pages/ExplorePage.test.tsx src/pages/SavedPage.test.tsx
git commit -m "refactor: theme shared shell and toolbar surfaces"
```

### Task 5: Convert Auth, Public, And Placeholder Pages To Theme Tokens

**Files:**

- Modify: `src/pages/SignInPage.tsx`
- Modify: `src/features/auth/SignInForm.tsx`
- Modify: `src/pages/PublicProfilePage.tsx`
- Modify: `src/components/ui/PlaceholderPage.tsx`
- Test: `src/pages/PublicProfilePage.test.tsx`

- [ ] **Step 1: Write or extend a failing test for public/profile themed surfaces if needed**

If no explicit theme assertion exists yet, add one that checks the tokenized class names on a stable container.

- [ ] **Step 2: Replace hardcoded hex and fixed light/dark surface classes**

Implement patterns like:

```tsx
<div className="rounded-xl bg-surface-container-low p-6 text-on-surface">
...
<button className="w-full rounded-xl bg-gradient-to-tr from-primary to-primary-container px-6 py-3.5 text-base font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5">
```

For public/profile placeholder shells, replace mixed `bg-white/90`, `bg-ink`, and `text-parchment` usage with tokenized editorial surfaces that remain legible in both themes.

- [ ] **Step 3: Run the affected tests**

Run: `npx vitest run src/pages/PublicProfilePage.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit the auth/public-surface cleanup**

```bash
git add src/pages/SignInPage.tsx src/features/auth/SignInForm.tsx src/pages/PublicProfilePage.tsx src/components/ui/PlaceholderPage.tsx src/pages/PublicProfilePage.test.tsx
git commit -m "refactor: theme auth and public profile surfaces"
```

### Task 6: Audit Remaining Literal Colors And Finish Verification

**Files:**

- Modify: `src/pages/CollectionPage.tsx`
- Modify: `src/pages/ExplorePage.tsx`
- Modify: `src/pages/SavedPage.tsx`
- Modify: `src/pages/ScenariosPage.tsx`
- Modify: `src/pages/AuthCallbackPage.tsx`
- Modify: `src/pages/AdminPage.tsx`
- Modify: `src/components/scenarios/ScenarioAccordion.tsx`
- Modify: `src/components/scenarios/ScenarioGameRow.tsx`
- Modify: any additional file returned by the grep below

- [ ] **Step 1: Run a grep audit to find remaining light-only classes**

Run:

```bash
rg -n "bg-white|text-\\[#|border-gray|bg-red-50|text-red-900|border-black/10|bg-amber-100|text-amber-900|bg-slate|text-slate|bg-gray|text-gray" src --glob '!**/*.test.tsx' --glob '!**/*.test.ts'
```

Expected: remaining matches only in files actively being cleaned up in this task.

- [ ] **Step 2: Replace remaining literals with semantic token classes**

Use:

- `bg-surface-container-low`, `bg-surface-container-lowest`, `bg-surface-container-high`
- `text-on-surface`, `text-on-surface-variant`
- `border-outline-variant/15`
- existing semantic success/error colors only where the state itself is semantic, not structural

- [ ] **Step 3: Run the relevant tests and full typecheck**

Run: `npx vitest run src/pages/ScenariosPage.test.tsx src/pages/AuthCallbackPage.test.tsx src/pages/CollectionPage.test.tsx src/pages/ExplorePage.test.tsx src/pages/SavedPage.test.tsx`
Expected: PASS

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Run a final grep audit**

Run the grep from Step 1 again.
Expected: no structural light-only color literals remain in app code other than intentional semantic state colors or data-driven tag colors.

- [ ] **Step 5: Commit the final audit pass**

```bash
git add src/pages/CollectionPage.tsx src/pages/ExplorePage.tsx src/pages/SavedPage.tsx src/pages/ScenariosPage.tsx src/pages/AuthCallbackPage.tsx src/pages/AdminPage.tsx src/components/scenarios/ScenarioAccordion.tsx src/components/scenarios/ScenarioGameRow.tsx
git commit -m "refactor: finish sitewide light and dark theme adoption"
```

## Review Notes

- Approved design source: `docs/specs/2026-04-09-sitewide-theme-toggle-design.md`
- Visual source of truth: `ui_design/trophy_room/DESIGN_light.md` and `ui_design/trophy_room/DESIGN_dark.md`
- This plan intentionally avoids adding a second theme control outside the account settings page.
