# Board Game Collection

Personal board game collection app for a public-read, private-edit workflow.

The app is built with Vite, React, TypeScript, and Supabase. It now includes live collection browsing, game detail pages, owner auth and admin tools, a ranked buy list, recommendations, scenarios, legacy-data migration scripts, and owner-triggered BoardGameGeek metadata refresh.

## Features

- public collection browsing with filtering, sorting, and shareable URL state
- game detail pages with metadata, notes, tags, and BoardGameGeek links
- owner-only magic-link auth and protected admin route
- admin CRUD for games and tags
- buy-order workflow with priority editing and quick status changes
- recommendations workflow with owner editing and promotion actions
- scenarios page driven by preset rules instead of hard-coded lists
- BGG metadata refresh for owner-managed games
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
```

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used by the browser app.

`SUPABASE_SERVICE_ROLE_KEY` is only for local import scripts such as `npm run migrate:import`. Do not expose that key in client code or deployments that do not need server-side seed access.

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

The schema already models:

- `profiles`
- `games`
- `tags`
- `game_tags`
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
- Generates deterministic JSON suitable for import

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
- `docs/specs/2026-04-08-project-initialization-design.md`: initialization design record
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

## Verification

The current repository passes:

- `npm run test:run`
- `npm run typecheck`
- `npm run build`

## Notes On Legacy Data

`board-game-collection.jsx` stays in the repo as a migration source only. It should not become a runtime data source again.

## Deployment Target

The intended host is Vercel with the default Vite build:

- build command: `npm run build`
- output directory: `dist`
