# Sitewide Theme Toggle Design

**Date:** 2026-04-09

## Goal

Keep the theme toggle on the account settings page while making the selected light or dark theme apply across the entire website, persist after reload, and follow the editorial token sets defined in `ui_design/trophy_room/DESIGN_light.md` and `ui_design/trophy_room/DESIGN_dark.md`.

## Core Decisions

### Theme ownership

- `src/lib/theme.tsx` remains the single source of truth for theme state.
- The provider continues to persist the chosen theme in `localStorage`.
- The provider applies the active theme to the document root so every route can consume the same token set.
- The toggle stays on `src/pages/AccountSettingsPage.tsx`. No duplicate control is added to the top nav.

### Styling strategy

- Keep the existing CSS-variable approach instead of adding per-component `theme === "dark"` branches.
- Align the global variables in `src/styles/index.css` with the approved trophy room light and dark palettes.
- Replace hardcoded light-only colors, borders, and backgrounds in shared UI with token-based Tailwind classes backed by those CSS variables.
- Prefer semantic surface layering from the design docs over fixed white/gray fills.

### Scope

In scope:

- Theme persistence and page-wide class application.
- Account settings toggle behavior and accessibility.
- Shared layout surfaces, auth surfaces, public profile surfaces, and toolbar/search components that currently ignore dark mode.
- A final audit pass over remaining hardcoded light-mode utilities returned by `rg`.

Out of scope:

- Moving the toggle to a global nav control.
- Redesigning page structure beyond what is needed to make the existing UI respect the light/dark token sets.
- Introducing a third theme mode or system-preference auto mode.

## Implementation Shape

### Global theme flow

1. Load the saved theme from `localStorage`.
2. Apply the `light` or `dark` class to the document root before first paint.
3. Toggle the class from the account settings page.
4. Let all components inherit colors from CSS variables and token-backed Tailwind classes.

### Token usage

- Use `surface`, `surface-container-low`, `surface-container-lowest`, `surface-container-high`, `surface-container-highest`, `surface-bright`, `on-surface`, `on-surface-variant`, `primary`, `primary-container`, `outline-variant`, and `surface-tint` as the primary cross-theme tokens.
- Preserve the editorial layering rules from the trophy room docs: no heavy dividers, minimal ghost borders, and tonal separation over white cards.

### Verification

- Add or update tests that prove the account-page toggle changes the global theme class and persists the selected value.
- Run targeted page/component tests for the touched surfaces.
- Run a final grep-based audit for hardcoded light-only classes and a repo typecheck.
