# My Boardgame Collection — Agent Context

> **Sync note:** `AGENT.md` and `CLAUDE.md` are identical twins. Keep both in sync manually whenever one changes. They exist so tools that look for `AGENT.md` (Antigravity, Gemini) and tools that look for `CLAUDE.md` (Claude Code) both find the same context.

## What this project is

A **Vite + React 19 + Supabase** single-page app for managing a shared board-game catalogue and per-account libraries (collection + saved). Deployed to Vercel; backend lives entirely in Supabase (Postgres, Auth, Storage, Edge Functions).

Live URL: <https://my-boardgame-collection.vercel.app>

---

## Stack

| Layer       | Tech                                                                |
| ----------- | ------------------------------------------------------------------- |
| Frontend    | Vite 8, React 19, TypeScript 6, React Router 7, TanStack Query 5    |
| Styling     | Tailwind CSS 3 (class dark-mode) + Material Design 3 token CSS vars |
| Forms       | React Hook Form + Zod                                               |
| Icons       | `@iconify/react`                                                    |
| Backend     | Supabase (Postgres, Auth, Storage, Edge Functions via Deno)         |
| API proxy   | Vercel serverless functions (`api/`)                                |
| Auth extras | SimpleWebAuthn (passkeys)                                           |
| Testing     | Vitest + Testing Library (jsdom)                                    |
| Deployment  | Vercel (SPA rewrite + `/api/*` functions)                           |
| Scripts     | `tsx` for Node scripts; `deno check` for Edge Functions             |

---

## Repository layout

```
.
├── api/                    Vercel serverless API routes (BGG proxy)
├── data/                   Local CSV data assets (not required to run the app)
├── docs/                   Design specs, plans, auth-flow doc
│   ├── plans/              Dated planning/refactor docs (read for historical context)
│   └── superpowers/        Capability/feature design docs
├── scripts/                Import and maintenance scripts (run with tsx)
│   ├── legacy/             Legacy transforms + quarantined import inputs/artifacts
│   │   ├── assets/         Legacy source (`board-game-collection.jsx`)
│   │   └── output/         Generated legacy payload (`seed-data.json`)
├── src/                    React application (see src/README.md)
├── supabase/
│   ├── config.toml         Local Supabase CLI config (auth providers, feature flags)
│   ├── functions/          Deno Edge Functions
│   └── migrations/         Single rebaseline migration (source of truth for schema)
├── ui_design/              UI reference docs and design mockups
├── .env.example            All env vars (copy → .env.local)
├── vercel.json             SPA rewrite + API function routing
├── vite.config.ts          Vite + Vitest config; shims /api/* routes in dev
├── tailwind.config.ts      Tailwind design tokens (MD3 colour roles, custom shadows)
└── tsconfig.json           App TypeScript config (src/ + api/)
```

For deeper detail on `src/` internals see [`src/README.md`](src/README.md).  
For `supabase/` internals see [`supabase/README.md`](supabase/README.md).

---

## Data model (schema source of truth: `supabase/migrations/`)

Single rebaseline migration: `supabase/migrations/20260410160430_rebaseline_schema.sql`

Key tables:

| Table                | Purpose                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `accounts`           | Stable app-owner entity (one per person, survives identity changes)                      |
| `account_identities` | Maps Supabase auth identities/providers → account                                        |
| `account_emails`     | Primary + secondary verified emails per account                                          |
| `profiles`           | Username, display name, `role` (`user` \| `owner`), public flags                         |
| `games`              | Shared game catalogue (BGG metadata + editorial fields)                                  |
| `library_entries`    | Per-account library state (`is_in_collection`, `is_saved`, `is_loved`, sentiment, notes) |
| `user_tags`          | Account-scoped custom tags                                                               |
| `user_game_tags`     | Many-to-many: library entry ↔ user tag                                                   |
| `shared_tags`        | Shared/admin tags                                                                        |
| `game_tags`          | Many-to-many: game ↔ shared tag                                                          |
| `passkeys`           | WebAuthn credential storage                                                              |

TypeScript types are generated and live in `src/types/database.ts`. Domain types (`Game`, `LibraryEntry`, `Tag`) are in `src/types/domain.ts`.

---

## Auth & identity design

- **Account-first**: `accounts` is the stable entity, not `auth.users`. After sign-in, `account-sync-session` Edge Function syncs auth state into `accounts`, `account_identities`, `account_emails`.
- **Auth methods**: Email magic links, OAuth (Google, Discord, GitHub active; Apple UI-disabled/coming soon), passkeys (SimpleWebAuthn).
- **Guest mode**: Library state stored in `localStorage` via `guestLibraryStorage.ts`. `useGuestLibrarySync` auto-merges to server on sign-in.
- **OAuth capability**: Controlled at runtime by `VITE_AUTH_ENABLED_OAUTH_PROVIDERS` env var (comma-separated list). Default: `google,discord,github`. Validated by `src/lib/env.ts`.
- **Owner role**: Set via `public.profiles.role = 'owner'`; gates `/admin` route and `bgg-refresh` API.
- **Email merge flow**: `email-merge-request` + `email-merge-verify` Edge Functions handle linking a second email to an existing account.

---

## Key architectural patterns

### Feature-slice organisation (`src/features/`)

Features own their hooks, types, query keys, mappers, and schemas. No feature imports from another feature's internals. Shared utilities live in `src/lib/`. Shared UI components live in `src/components/`.

Features: `accounts`, `auth`, `games`, `library`, `profiles`, `scenarios`, `shared`, `tags`.

### Query / mutation pattern

All server state goes through **TanStack Query**. Each feature exports:

- A `*Keys` file with typed query key factories
- `use*Query` hooks (wrapping Supabase or fetch calls)
- `use*Mutation` hooks (with optimistic updates where appropriate)

### Route registry

All route definitions are centralised in `src/app/router/routeRegistry.tsx`. Nav components (`TopNavBar`, `BottomTabBar`) consume `desktopNavRouteDefinitions` / `mobileNavRouteDefinitions` from registry — no duplicated route lists.

Routes with `allowBackgroundOverlay: true` (e.g. `/game/:slug`, `/signin`) render as overlays on top of the current page if navigated to from within the app.

### Theme system

`src/lib/theme.tsx` provides `ThemeProvider` + `useTheme`. Theme is stored in `localStorage` and applied as a `light` / `dark` class on `<html>` and `<body>`. Tailwind `darkMode: "class"`. All colours are MD3 CSS custom properties (`--primary`, `--surface`, etc.) in `src/styles/index.css`, consumed as Tailwind colour utilities via `tailwind.config.ts`.

### Library surface pattern

`CollectionPage` and `SavedPage` are thin wrappers that call `getOwnedLibrarySurfaceConfig("collection" | "saved")` from `src/features/library/librarySurfaceConfigs.tsx` and render `OwnedLibraryPage`. Public variants use `getPublicLibrarySurfaceConfig`. Avoid duplicating copy or UI logic between the two surfaces.

### Vercel API routes (`api/`)

- `GET /api/bgg-search?query=…` — BGG XML API proxy, returns parsed JSON search results
- `POST /api/bgg-refresh` — owner-only; refreshes BGG metadata for a single game in the DB

In dev, `vite.config.ts` shims these routes via a custom middleware plugin.

### Edge Functions (`supabase/functions/`)

All Deno; shared CORS/auth helpers in `_shared/`. Functions:

| Function                          | Purpose                                                                   |
| --------------------------------- | ------------------------------------------------------------------------- |
| `account-sync-session`            | Sync auth identities, emails, passkeys into accounts tables after sign-in |
| `account-security-summary`        | Return email/identity/passkey summary for settings UI                     |
| `passkey-auth-options/verify`     | Conditional passkey sign-in flow                                          |
| `passkey-register-options/verify` | Passkey registration flow                                                 |
| `passkey-list/delete`             | Passkey management                                                        |
| `email-merge-request/verify`      | Email/account merge flow                                                  |

---

## Environment variables

See `.env.example` for the full list. Required at runtime:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SITE_URL=https://my-boardgame-collection.vercel.app
VITE_AUTH_ENABLED_OAUTH_PROVIDERS=google,discord,github
SITE_URL=http://localhost:5173
BGG_APPLICATION_TOKEN=
```

Optional (local dev only):

```dotenv
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID/SECRET=
SUPABASE_AUTH_EXTERNAL_DISCORD_CLIENT_ID/SECRET=
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID/SECRET=
SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID/SECRET=
```

---

## Development commands

```bash
npm run dev              # Vite dev server (shims /api/* routes)
npm run build            # typecheck:app + vite build
npm run typecheck        # all surfaces: app + tools + edge
npm run test             # Vitest watch
npm run test:run         # Vitest one-shot

supabase start           # start local Supabase stack
supabase db reset        # apply migrations to local stack

npm run migrate:import-bgg        # import BGG CSV into games table
npm run migrate:backfill-shared-tags  # backfill shared tags
npm run legacy:migrate:generate / legacy:migrate:import  # quarantined legacy import pipeline
```

---

## Testing conventions

- Test files co-located with source (`*.test.ts` / `*.test.tsx`)
- Vitest globals enabled; `jsdom` environment; setup: `src/test/setup.ts`
- Use Testing Library (`@testing-library/react`, `@testing-library/user-event`)
- Mock Supabase client via `vi.mock(...)` — see existing test files for pattern
- Edge Function tests use Deno test runner (not Vitest)

---

## Active work / planned phases

See [`docs/plans/2026-04-11-repository-hardening-and-refactor.md`](docs/plans/2026-04-11-repository-hardening-and-refactor.md) for the current phased hardening plan. Phase 1 is largely complete; Phases 2–6 cover edge security, structural dedup, tooling guardrails, design consistency, and legacy pipeline decisions.

---

## Non-app assets (do not delete without checking)

- `scripts/legacy/assets/board-game-collection.jsx` — legacy source, still used by `scripts/generateSeedData.ts`
- `scripts/legacy/` — legacy transform scripts used in the import pipeline
- `scripts/legacy/output/seed-data.json` — generated import payload
- `data/boardgames_ranks.csv` — historical BGG ranks CSV (not required at runtime)
