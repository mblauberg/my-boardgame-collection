# AGENTS.md

This file adds **agent-specific UI style guardrails** for this repository.  
For full architecture/domain context, read `AGENT.md` (and matching `CLAUDE.md`).

## UI style system: required defaults

The product's interactive UI should use the shared glass-morphism primitives in `src/styles/index.css`:

- `.glass-action-button` → neutral interactive buttons (icon buttons, small action pills)
- `.glass-action-button-active` → primary/active CTAs
- `.glass-input-field` → search fields, text inputs, textareas in glass surfaces
- `.glass-selectable-card` → selectable list cards/chips
- `.glass-selectable-card-active` → selected state for selectable cards/chips
- `.glass-surface-panel` → major surfaces/panels/sheets
- `.game-card-title-glass` → game card title overlay treatment

## Theme consistency policy (runtime UI code)

Use tokenized styling as the default in `src/**/*.{ts,tsx}` runtime files:

- Prefer theme token classes such as `text-primary`, `bg-surface`, `border-outline`.
- Avoid hardcoded colour literals/functions (`#hex`, `rgb/rgba`, `hsl/hsla`, `hwb`, `color()`, `color-mix()`, `oklch`, `oklab`, `lab`, `lch`) in runtime UI logic/components.
- Avoid introducing new arbitrary-value utility classes unless they are reviewed and allowlisted.

## Enforced guardrails

- **Policy test:** `src/test/themeConsistency.test.ts`
  - Scans runtime source files (tests excluded)
  - Fails on new unallowlisted hardcoded colours or arbitrary-value utility tokens
- **ESLint:** `eslint.config.js`
  - Blocks runtime hardcoded colours
  - Blocks ad-hoc arbitrary **colour** utilities
  - Keeps explicit file allowlisting for accepted legacy exceptions

## Consistency rules for future edits

1. **Reuse shared classes before writing custom blur/gradient/border recipes.**
2. If you see ad-hoc class strings like `bg-surface-* + border-* + backdrop-blur-*` on controls, migrate them to shared glass classes.
3. Keep light/dark parity by relying on shared class definitions rather than component-local dark overrides.
4. Prefer composition (`glass-*` + spacing/size utilities) over one-off visual styling.

## Allowlisting exceptions

If an exception is truly required:

1. Add the narrowest possible allowlist entry in `src/test/themeConsistency.test.ts`.
2. Add/update targeted ESLint override only when necessary.
3. Document the reason in your PR to avoid accidental policy erosion.

## Testing expectations for style changes

When updating UI controls, add or update tests to assert the shared glass classes on key elements.  
Recent examples are in:

- `src/components/library/FilterBar.test.tsx`
- `src/components/library/ExpandingSearchInput.test.tsx`
- `src/components/library/AddGameWizardOverlay.test.tsx`
- `src/components/library/DiscoverSection.test.tsx`
- `src/components/layout/FloatingActionButton.test.tsx`

## Avoid

- Introducing new bespoke glass recipes unless existing primitives cannot support the requirement.
- Mixing opaque non-glass button styles into areas that already use the glass interaction language.
