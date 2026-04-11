# Board Game Collection

Board Game Collection is a Vite + React + Supabase app for managing a shared board-game catalog and account-owned libraries (collection + saved).

## What is implemented

- Account-based data model (`account_id`) for profile, library, tags, and account security data
- Auth flow with email magic links, OAuth (Apple/Google/Discord/GitHub), and passkeys
- Account security sync after sign-in (linked identities, owned emails, passkeys)
- Email merge flow that can merge account data into an existing account email
- Guest library mode (local storage) with automatic sync after sign-in
- Public profile + optional public collection/saved pages
- Owner-only admin area for catalog and metadata maintenance
- Explore and scenarios views driven from catalog + library data

## Stack

- **Frontend:** Vite, React 19, TypeScript, React Router, TanStack Query
- **Backend:** Supabase Postgres/Auth/Storage/Edge Functions
- **Testing:** Vitest + Testing Library
- **Deployment:** Vercel

## Data model and source of truth

Supabase migrations are the schema source of truth.

- `supabase/migrations/` contains the canonical schema history
- `src/types/database.ts` contains generated TypeScript database types

Migration history was rebaselined into a single migration:

- `supabase/migrations/20260410160430_rebaseline_schema.sql`

If your local or linked project still has pre-rebaseline versions in `schema_migrations`,
mark them as reverted before your next push:

```bash
supabase migration repair \
  20260409000000 20260409143000 20260409161000 20260409210000 20260409220000 \
  20260410000000 20260410000001 20260410000002 20260410000003 20260410144055 \
  --status reverted --local
```

Use `--linked` instead of `--local` for a hosted project.

Current architecture is identity-aware and account-first:

- `accounts` is the stable app owner entity
- `account_identities` maps auth identities/providers to accounts
- `account_emails` stores primary and secondary verified emails per account
- `library_entries` stores per-account library state

## Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required app/runtime variables:

```dotenv
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SITE_URL=http://localhost:5173
SITE_URL=http://localhost:5173
BGG_APPLICATION_TOKEN=...
```

Optional local admin/import variable:

```dotenv
SUPABASE_SERVICE_ROLE_KEY=...
```

Optional local Supabase Auth provider variables currently used in this repo:

```dotenv
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=
SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_APPLE_SECRET=
SUPABASE_AUTH_EXTERNAL_DISCORD_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_DISCORD_SECRET=
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=
```

Notes:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required by the browser app
- `VITE_SITE_URL` and `SITE_URL` should match your local origin
- `BGG_APPLICATION_TOKEN` is required for `/api/bgg-search`

## Local development

Prerequisites:

- Node.js 20+
- npm
- Supabase CLI

Install dependencies:

```bash
npm install
```

### Option 1: Hosted Supabase

Point `.env.local` to your hosted project, apply this repo's migrations there, then run:

```bash
npm run dev
```

### Option 2: Local Supabase CLI stack

```bash
supabase start
supabase db reset
npm run dev
```

If auth/provider settings change in `supabase/config.toml`, restart and reset the local stack.

## Owner setup

After signing in once, promote your account in `public.profiles`:

```sql
update public.profiles
set role = 'owner'
where email = 'you@example.com';
```

## Auth and account security services

### Supabase Edge Functions (`supabase/functions/`)

- `account-sync-session`: sync account security state after sign-in
- `account-security-summary`: return primary/secondary emails, identities, passkeys
- `passkey-auth-options`, `passkey-auth-verify`: conditional passkey sign-in
- `passkey-register-options`, `passkey-register-verify`: passkey registration
- `passkey-list`, `passkey-delete`: passkey management
- `email-merge-request`, `email-merge-verify`: email/account merge flow

### Vercel API routes (`api/`)

- `GET /api/bgg-search?query=...`: proxies BoardGameGeek search
- `POST /api/bgg-refresh`: owner-authenticated metadata refresh for a game

## Import and migration scripts

There is no automatic seed file. Legacy import is script-driven:

```bash
npm run migrate:generate
npm run migrate:import
```

BGG CSV import path:

```bash
npm run migrate:import-bgg
npm run migrate:backfill-shared-tags
```

These scripts target the account-based schema (`account_id`).

The legacy migration pipeline is intentionally retained. `board-game-collection.jsx`,
`scripts/legacy/*`, `scripts/generateSeedData.ts`, `scripts/importLegacyData.ts`, and
`scripts/output/seed-data.json` are still part of the active import and backfill workflow.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript check only |
| `npm run test` | Vitest watch mode |
| `npm run test:run` | Vitest one-shot run |
| `npm run migrate:generate` | Generate legacy seed payload |
| `npm run migrate:import` | Import legacy payload |
| `npm run migrate:import-bgg` | Import games from BGG CSV |
| `npm run migrate:backfill-shared-tags` | Backfill shared tags |

## Repository layout

```text
.
├── api/                  Vercel API routes
├── data/                 Local data assets and notes
├── docs/                 Design/spec/planning docs
├── scripts/              Import and maintenance scripts
├── src/                  React application code
├── supabase/
│   ├── config.toml       Local Supabase CLI config
│   ├── functions/        Edge Functions
│   └── migrations/       Database schema history
├── ui_design/            UI references and mockups
├── board-game-collection.jsx  Legacy source retained for migration tooling
└── vercel.json           Build and rewrite config
```

## Notes on non-app assets

- `data/boardgames_ranks.csv` is not required to run the app (historical analysis/seeding data)
- `docs/plans/` and `docs/superpowers/` contain design and implementation planning artifacts

## Deployment

Production is deployed on Vercel: <https://my-boardgame-collection.vercel.app>

`vercel.json` rewrites all non-`/api/*` routes to `index.html` for SPA routing.
