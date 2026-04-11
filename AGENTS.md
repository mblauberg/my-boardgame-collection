# AGENTS.md

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

## Allowlisting exceptions

If an exception is truly required:

1. Add the narrowest possible allowlist entry in `src/test/themeConsistency.test.ts`.
2. Add/update targeted ESLint override only when necessary.
3. Document the reason in your PR to avoid accidental policy erosion.
