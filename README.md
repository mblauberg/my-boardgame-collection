# Board Game Collection

Personal board game collection app scaffolded for a public-read, private-edit workflow.

The target product is a Vite + React + TypeScript site deployed on Vercel, backed by Supabase for data, authentication, and row-level security. This repository now contains the initial project structure, shared app foundation, and detailed execution plans for the larger product features.

## Current Status

- Vite + React + TypeScript scaffold in place
- Tailwind, React Router, TanStack Query, Supabase client, and testing baseline added
- Scenario configuration moved into the app structure
- Larger feature work broken into executable plans under `docs/plans/`

What is not built yet:

- live Supabase queries
- owner auth flow
- admin CRUD
- migration/import tooling
- buy order, recommendations, and scenarios UI
- BGG refresh integration

## Product Direction

The app is intended to support:

- public browsing of the collection
- private editing by a single owner account
- data-driven filters, tags, and scenarios
- editable buy list and recommendations
- Supabase-backed persistence rather than hard-coded arrays

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- Supabase JavaScript client
- Vitest + Testing Library

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Only public browser-safe Supabase values belong here. Do not expose a service role key.

### 3. Run the app

```bash
npm run dev
```

### 4. Run tests

```bash
npm run test:run
```

### 5. Build for production

```bash
npm run build
```

## Supabase Setup

The current database schema lives in [`schema.sql`](./schema.sql).

Recommended setup:

1. Create a Supabase project.
2. Apply `schema.sql` in the SQL editor or through migrations.
3. Add the project URL and anon key to `.env.local`.
4. Follow the auth/access implementation plan before relying on owner-only workflows.

The schema already models:

- `profiles`
- `games`
- `tags`
- `game_tags`
- owner-aware helper functions and RLS policies

## Project Structure

```text
.
├── board-game-collection.jsx
├── docs/
│   ├── plans/
│   └── specs/
├── schema.sql
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── features/
│   ├── lib/
│   ├── pages/
│   ├── styles/
│   └── types/
└── README.md
```

Key files:

- `board-game-collection.jsx`: legacy source data and historical scenario references
- `src/config/scenarioPresets.ts`: config-driven scenario matching logic
- `docs/specs/2026-04-08-project-initialization-design.md`: initialization design record
- `docs/plans/`: deferred implementation plans for larger features

## Available Scripts

- `npm run dev`: start the Vite development server
- `npm run build`: type-check and build the app
- `npm run preview`: preview the production build locally
- `npm run typecheck`: run TypeScript checks
- `npm run test`: run Vitest in watch mode
- `npm run test:run`: run Vitest once

## Plans

Larger features are intentionally deferred into execution-ready plans:

- [`docs/plans/legacy-data-migration.md`](./docs/plans/legacy-data-migration.md)
- [`docs/plans/auth-and-owner-access.md`](./docs/plans/auth-and-owner-access.md)
- [`docs/plans/collection-and-game-detail.md`](./docs/plans/collection-and-game-detail.md)
- [`docs/plans/admin-crud-and-tags.md`](./docs/plans/admin-crud-and-tags.md)
- [`docs/plans/buy-order-workflow.md`](./docs/plans/buy-order-workflow.md)
- [`docs/plans/recommendations-workflow.md`](./docs/plans/recommendations-workflow.md)
- [`docs/plans/scenarios-page.md`](./docs/plans/scenarios-page.md)
- [`docs/plans/bgg-metadata-refresh.md`](./docs/plans/bgg-metadata-refresh.md)

## Notes On Legacy Data

`board-game-collection.jsx` is still in the repo because it is the migration source for the future seed/import workflow. It should not become a runtime data source again.

## Deployment Target

The intended host is Vercel with the default Vite build:

- build command: `npm run build`
- output directory: `dist`

## Next Recommended Step

Start with one of the plan documents in `docs/plans/` and execute it against the current scaffold. The best first feature slice is usually auth and owner access, followed by collection queries and the game detail page.
