# Board Game Collection

Multi-user board game collection app built on a shared BoardGameGeek-backed catalog plus user-owned library entries.

The app is built with Vite, React, TypeScript, and Supabase. It includes private collection and wishlist management, public profile sharing by username, an Explore view, admin tools, scenarios, legacy-data migration scripts, and BoardGameGeek metadata utilities.

## Features

- shared catalog of games and shared tags in Supabase
- per-user collection and wishlist library entries
- public profile sharing by username with per-section visibility controls
- game detail pages with catalog-safe metadata and BoardGameGeek links
- private Explore shelves driven by catalog data and library signals
- magic-link auth plus protected admin route
- admin CRUD for games and tags
- scenarios page driven by preset rules instead of hard-coded lists
- BGG metadata refresh and search helpers
- deterministic legacy-data seed generation and import scripts

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
SUPABASE_SERVICE_ROLE_KEY=...
BGG_APPLICATION_TOKEN=...
```

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used by the browser app.

`SUPABASE_SERVICE_ROLE_KEY` is only for local import scripts such as `npm run migrate:import`. Do not expose that key in client code or deployments that do not need server-side seed access.

`BGG_APPLICATION_TOKEN` is used by the local `/api/bgg-search` proxy and any server-side BoardGameGeek XML API access. BoardGameGeek now requires an approved application token on XML API requests.

### 3. Apply the schema and seed data

```bash
npm run migrate:generate
npm run migrate:import
```

The import script expects:

- `schema.sql` already applied to the target Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` present in your local environment

### 4. Promote your owner account

After signing in once, update the matching row in `public.profiles` to `role = 'owner'`. The SQL snippet is included at the bottom of [`schema.sql`](./schema.sql).

### 5. Run the app

```bash
npm run dev
```

### 6. Run tests

```bash
npm run test:run
```

### 7. Build for production

```bash
npm run build
```

## Supabase Setup

The current database schema lives in [`schema.sql`](./schema.sql).

Recommended setup:

1. Create a Supabase project.
2. Apply `schema.sql` in the SQL editor or through migrations.
3. Add the project URL, anon key, and service role key to `.env.local`.
4. Generate and import the seed data.
5. Sign in once and promote the owner profile manually.

The schema now models:

- `profiles`
- `games`
- `tags`
- `game_tags`
- `library_entries`
- `user_tags`
- `user_game_tags`
- public profile search and public-library read surfaces
- owner-aware helper functions and RLS policies

### Migrating Legacy Data

To import the legacy collection data from `board-game-collection.jsx`:

1. Generate the seed data:

   ```bash
   npm run migrate:generate
   ```

   This creates `scripts/output/seed-data.json` with normalized games, tags, and relationships.

2. Import to Supabase with a service-role key:
   ```bash
   npm run migrate:import
   ```

The migration pipeline:

- Extracts arrays from the legacy JSX file
- Normalizes player counts, time, status, and metadata
- Derives tags from categories and game attributes
- Seeds the shared catalog and shared tags
- Backfills the primary user profile into `library_entries` for owned and wishlist rows

## Project Structure

```text
.
├── board-game-collection.jsx
├── docs/
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
- `docs/superpowers/plans/2026-04-08-multi-user-library-redesign.md`: implementation plan
- `scripts/output/seed-data.json`: generated seed payload for Supabase imports

## Available Scripts

- `npm run dev`: start the Vite development server
- `npm run build`: type-check and build the app
- `npm run preview`: preview the production build locally
- `npm run typecheck`: run TypeScript checks
- `npm run test`: run Vitest in watch mode
- `npm run test:run`: run Vitest once
- `npm run migrate:generate`: generate seed data from legacy file
- `npm run migrate:import`: import seed data to Supabase with `SUPABASE_SERVICE_ROLE_KEY`

## Product Model

- `games` is the shared catalog
- `library_entries` stores whether a signed-in user has a game in their collection or wishlist
- public pages live under `/u/:username`
- public collection and wishlist pages only expose catalog-safe data

## Notes On Legacy Data

`board-game-collection.jsx` stays in the repo as a migration source only. It should not become a runtime data source again.

## Deployment Target

The intended host is Vercel with the default Vite build:

- build command: `npm run build`
- output directory: `dist`
