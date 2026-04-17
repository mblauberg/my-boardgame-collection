# Auth And Account UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn sign-in into an overlay experience and rebuild the account/settings UI around a quiet sign-in-methods summary card with a premium passkey focus.

**Architecture:** Reuse the existing route-background modal pattern already used for game detail to render `/signin` as an overlay whenever the user enters auth from inside the app. Rebuild `/settings` into a smaller set of higher-value surfaces, add a quiet `Sign-in methods` summary card that opens a floating sheet on desktop/tablet and a full-screen surface on mobile, and remove placeholder content that does not map to real persisted behavior.

**Tech Stack:** React 19, React Router, TypeScript, TanStack Query, Tailwind CSS, Vitest, Testing Library

---

## File Map

**Create**
- `src/features/auth/signInNavigation.ts` — helper for building modal-route state when sending users to `/signin`
- `src/components/auth/SignInOverlayFrame.tsx` — blurred backdrop and responsive overlay shell
- `src/components/settings/SignInMethodsSummaryCard.tsx` — quiet account-security summary card with premium passkey state
- `src/components/settings/SignInMethodsSheet.tsx` — floating sheet on desktop/tablet
- `src/pages/SignInMethodsPage.tsx` — full-screen mobile presentation (or route wrapper around the same content)
- `src/features/auth/useAccountSecuritySummary.ts` — query hook over the account-security summary API if it does not already exist from plan 2

**Modify**
- `src/app/router/AppRouter.tsx`
- `src/app/router/AppRouter.test.tsx`
- `src/app/router/routes.tsx`
- `src/app/router/routes.test.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/TopNavBar.tsx`
- `src/components/layout/BottomTabBar.tsx`
- `src/components/auth/SignInPrompt.tsx`
- `src/pages/CollectionPage.tsx`
- `src/pages/SavedPage.tsx`
- `src/pages/SignInPage.tsx`
- `src/features/auth/SignInForm.tsx`
- `src/features/auth/SignInForm.test.tsx`
- `src/features/auth/PasskeyRegistrationPrompt.tsx`
- `src/features/auth/PasskeyRegistrationPrompt.test.tsx`
- `src/pages/AccountSettingsPage.tsx`
- `src/pages/AccountSettingsPage.test.tsx`
- `src/styles/index.css`

## Task 1: Add Modal-Route Plumbing For Sign-In Overlay

**Files:**
- Create: `src/features/auth/signInNavigation.ts`
- Modify: `src/app/router/AppRouter.tsx`
- Modify: `src/app/router/AppRouter.test.tsx`
- Modify: `src/app/router/routes.tsx`
- Modify: `src/app/router/routes.test.tsx`

- [ ] **Step 1: Add a failing router test for sign-in as an overlay**

```tsx
it("keeps the collection page rendered behind the sign-in overlay", async () => {
  renderAppRouter([
    "/",
    {
      pathname: "/signin",
      state: {
        backgroundLocation: {
          pathname: "/",
          search: "",
          hash: "",
          state: null,
          key: "default",
        },
      },
    },
  ]);

  expect(screen.getByRole("heading", { name: /your collection/i })).toBeInTheDocument();
  expect(screen.getByRole("dialog", { name: /sign in/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the router tests to verify they fail**

Run:

```bash
npm run test:run -- src/app/router/AppRouter.test.tsx
npm run test:run -- src/app/router/routes.test.tsx
```

Expected: FAIL because `/signin` is still only rendered as a normal page route.

- [ ] **Step 3: Implement the modal-route plumbing**

Re-use the existing game-detail background-location pattern:

```tsx
{backgroundLocation ? (
  <Routes>
    <Route path="/signin" element={<SignInPage />} />
    <Route path="/game/:slug" element={<GameDetailPage />} />
  </Routes>
) : null}
```

Add a helper like:

```ts
export function getSignInRouteState(location: Location) {
  return { backgroundLocation: location };
}
```

- [ ] **Step 4: Run the focused router tests again**

Run:

```bash
npm run test:run -- src/app/router/AppRouter.test.tsx
npm run test:run -- src/app/router/routes.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/signInNavigation.ts \
  src/app/router/AppRouter.tsx \
  src/app/router/AppRouter.test.tsx \
  src/app/router/routes.tsx \
  src/app/router/routes.test.tsx
git commit -m "feat: add sign-in overlay routing"
```

## Task 2: Build The Sign-In Overlay Shell

**Files:**
- Create: `src/components/auth/SignInOverlayFrame.tsx`
- Modify: `src/pages/SignInPage.tsx`
- Modify: `src/features/auth/SignInForm.tsx`
- Modify: `src/features/auth/SignInForm.test.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Add failing sign-in UI tests**

```tsx
it("renders sign-in inside a dialog-style overlay shell when opened as a background route", () => {
  render(<SignInPage />);

  expect(screen.getByRole("dialog", { name: /sign in/i })).toBeInTheDocument();
});

it("does not render authenticated provider-link management inside SignInForm", () => {
  render(<SignInForm />, { wrapper: AuthenticatedWrapper });

  expect(screen.queryByText(/link another sign-in method/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the sign-in tests to verify they fail**

Run:

```bash
npm run test:run -- src/features/auth/SignInForm.test.tsx
```

Expected: FAIL because `SignInForm` still contains the authenticated management branch and `SignInPage` is not yet dialog-framed.

- [ ] **Step 3: Implement the overlay shell**

Create a reusable frame component:

```tsx
export function SignInOverlayFrame({ children }: PropsWithChildren) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-surface/30 backdrop-blur-md">
      <div role="dialog" aria-modal="true" aria-label="Sign in" className="glass-surface-panel ...">
        {children}
      </div>
    </div>
  );
}
```

Then:

- `SignInPage` renders through the new frame
- `SignInForm` becomes unauthenticated-only
- keep the existing passkey conditional-auth behavior intact

- [ ] **Step 4: Run the focused sign-in tests again**

Run:

```bash
npm run test:run -- src/features/auth/SignInForm.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/SignInOverlayFrame.tsx \
  src/pages/SignInPage.tsx \
  src/features/auth/SignInForm.tsx \
  src/features/auth/SignInForm.test.tsx \
  src/styles/index.css
git commit -m "feat: convert sign-in to overlay presentation"
```

## Task 3: Route All Auth Entry Points Through The Overlay Pattern

**Files:**
- Modify: `src/components/auth/SignInPrompt.tsx`
- Modify: `src/components/layout/TopNavBar.tsx`
- Modify: `src/components/layout/BottomTabBar.tsx`
- Modify: `src/pages/CollectionPage.tsx`
- Modify: `src/pages/SavedPage.tsx`

- [ ] **Step 1: Add failing entry-point tests**

Extend the nearest tests to assert that sign-in links use background-route state when invoked from in-app surfaces.

Minimal expectation:

```tsx
expect(link).toHaveAttribute("href", "/signin");
expect(navigate).toHaveBeenCalledWith("/signin", expect.objectContaining({
  state: expect.objectContaining({ backgroundLocation: expect.anything() }),
}));
```

- [ ] **Step 2: Run the focused tests**

Run:

```bash
npm run test:run -- src/components/layout/AppShell.test.tsx
npm run test:run -- src/pages/CollectionPage.test.tsx
npm run test:run -- src/pages/SavedPage.test.tsx
```

Expected: FAIL until the entry points use the new helper.

- [ ] **Step 3: Update the entry points**

Use `getSignInRouteState(location)` everywhere the user enters auth from inside the app:

- guest sync banners
- floating action buttons
- top-nav account button when signed out
- any prompt component that links to `/signin`

Decide whether mobile bottom navigation gets an account tab now or stays unchanged until the settings surface is in place. If you add the tab here, make it point to `/settings` for authenticated users and `/signin` with overlay state for signed-out users.

- [ ] **Step 4: Run the focused entry-point tests again**

Run:

```bash
npm run test:run -- src/components/layout/AppShell.test.tsx
npm run test:run -- src/pages/CollectionPage.test.tsx
npm run test:run -- src/pages/SavedPage.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/SignInPrompt.tsx \
  src/components/layout/TopNavBar.tsx \
  src/components/layout/BottomTabBar.tsx \
  src/pages/CollectionPage.tsx \
  src/pages/SavedPage.tsx
git commit -m "refactor: route auth entry points through sign-in overlay"
```

## Task 4: Build The Quiet Sign-In Methods Summary Card

**Files:**
- Create: `src/components/settings/SignInMethodsSummaryCard.tsx`
- Create: `src/features/auth/useAccountSecuritySummary.ts`
- Modify: `src/pages/AccountSettingsPage.tsx`
- Modify: `src/pages/AccountSettingsPage.test.tsx`
- Modify: `src/features/auth/PasskeyRegistrationPrompt.tsx`
- Modify: `src/features/auth/PasskeyRegistrationPrompt.test.tsx`

- [ ] **Step 1: Add failing settings tests for the new summary card**

```tsx
it("renders a quiet sign-in methods card with a premium no-passkey state", async () => {
  renderAccountSettingsPage();

  expect(await screen.findByText(/sign-in methods/i)).toBeInTheDocument();
  expect(screen.getByText(/set up passkey/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused settings tests**

Run:

```bash
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
npm run test:run -- src/features/auth/PasskeyRegistrationPrompt.test.tsx
```

Expected: FAIL because the summary card and its passkey states do not exist yet.

- [ ] **Step 3: Implement the summary card**

The card should be visually quiet overall, but give passkeys a premium state:

```tsx
<SignInMethodsSummaryCard
  primaryEmail={summary.primaryEmail}
  linkedProviders={summary.identities}
  passkeys={summary.passkeys}
  onOpen={openSheet}
/>
```

Behavior:

- zero passkeys -> warm accent + setup CTA
- one or more passkeys -> calm success badge such as `Passkey enabled`
- remove the old standalone `PasskeyRegistrationPrompt` from the sign-in page flow if the new settings card replaces its purpose

- [ ] **Step 4: Run the focused tests again**

Run:

```bash
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
npm run test:run -- src/features/auth/PasskeyRegistrationPrompt.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/settings/SignInMethodsSummaryCard.tsx \
  src/features/auth/useAccountSecuritySummary.ts \
  src/pages/AccountSettingsPage.tsx \
  src/pages/AccountSettingsPage.test.tsx \
  src/features/auth/PasskeyRegistrationPrompt.tsx \
  src/features/auth/PasskeyRegistrationPrompt.test.tsx
git commit -m "feat: add sign-in methods summary card"
```

## Task 5: Build The Floating Sheet / Mobile Full-Screen Detail Surface

**Files:**
- Create: `src/components/settings/SignInMethodsSheet.tsx`
- Create: `src/pages/SignInMethodsPage.tsx`
- Modify: `src/app/router/routes.tsx`
- Modify: `src/pages/AccountSettingsPage.tsx`
- Modify: `src/pages/AccountSettingsPage.test.tsx`

- [ ] **Step 1: Add failing tests for desktop and mobile behavior**

```tsx
it("opens sign-in methods in a floating sheet on desktop", async () => {
  renderAccountSettingsPage();
  await user.click(screen.getByRole("button", { name: /sign-in methods/i }));

  expect(screen.getByRole("dialog", { name: /sign-in methods/i })).toBeInTheDocument();
});
```

Add a route test for the mobile full-screen path if you expose a dedicated route like `/settings/sign-in-methods`.

- [ ] **Step 2: Run the focused tests**

Run:

```bash
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
npm run test:run -- src/app/router/routes.test.tsx
```

Expected: FAIL because the sheet/full-screen detail view does not exist yet.

- [ ] **Step 3: Implement the detail surface**

Desktop/tablet:

- floating sheet
- passkeys first
- linked providers second
- email addresses third

Mobile:

- full-screen route or sheet using the same content component

Minimal structure:

```tsx
<SignInMethodsSheet
  isOpen={isSheetOpen}
  onClose={closeSheet}
  summary={summary}
/>
```

- [ ] **Step 4: Run the focused tests again**

Run:

```bash
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
npm run test:run -- src/app/router/routes.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/settings/SignInMethodsSheet.tsx \
  src/pages/SignInMethodsPage.tsx \
  src/app/router/routes.tsx \
  src/pages/AccountSettingsPage.tsx \
  src/pages/AccountSettingsPage.test.tsx
git commit -m "feat: add sign-in methods detail surface"
```

## Task 6: Finish The Account Page Overhaul And Run Regression

**Files:**
- Modify: `src/pages/AccountSettingsPage.tsx`
- Modify: `src/pages/AccountSettingsPage.test.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Add failing expectations for removed placeholder content**

```tsx
expect(screen.queryByText(/notifications/i)).not.toBeInTheDocument();
expect(screen.queryByText(/share your collection/i)).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused settings tests**

Run:

```bash
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
```

Expected: FAIL because the placeholder cards still render.

- [ ] **Step 3: Recompose the settings page**

Implement the approved structure:

1. Hero/header
2. Profile and sharing
3. Sign-in methods summary card
4. Session/sign-out area

Also:

- remove placeholder notification settings
- remove duplicated summary/tip cards
- keep the sign-out area visually distinct but secondary to account/security management

- [ ] **Step 4: Run the targeted and broad UI regression suite**

Run:

```bash
npm run test:run -- src/pages/AccountSettingsPage.test.tsx
npm run test:run -- src/features/auth/SignInForm.test.tsx
npm run test:run -- src/app/router/AppRouter.test.tsx
npm run test:run -- src/app/router/routes.test.tsx
npm run test:run -- src/components/layout/AppShell.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/AccountSettingsPage.tsx \
  src/pages/AccountSettingsPage.test.tsx \
  src/styles/index.css
git commit -m "feat: overhaul auth and account ui"
```
