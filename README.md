# Board Game Collection

Multi-user board game collection app built on a shared BoardGameGeek-backed catalog plus user-owned library entries.

Live at **https://my-boardgame-collection.vercel.app**

Built with Vite, React, TypeScript, and Supabase.

## Features

- Shared catalog of games and tags backed by BoardGameGeek metadata
- Per-user library entries with independent saved, loved, and in-collection states
- Public profile pages at `/u/:username` with per-section visibility controls
- Game detail pages with catalog-safe metadata and BGG links
- Curated Explore shelves and grouped discovery sections driven by scenario presets
- Magic-link auth with a protected admin route
- Admin CRUD for games and tags with BGG search and metadata refresh
- Light/dark theme toggle with persistence
- BGG CSV import for bulk catalog seeding
- Legacy-data migration scripts

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod
- Supabase (auth, database, RLS)
- Vitest + Testing Library

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
BGG_APPLICATION_TOKEN=...
```

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — used by the browser app
- `SUPABASE_SERVICE_ROLE_KEY` — only needed for local import scripts; never expose in client code
- `BGG_APPLICATION_TOKEN` — required by the BGG XML API proxy (`/api/bgg-search`)

### 3. Apply the schema

Apply `schema.sql` to your Supabase project via the SQL editor or Supabase CLI migrations.

### 4. Seed data (optional)

```bash
npm run migrate:generate   # generate seed-data.json from legacy source
npm run migrate:import     # import to Supabase (requires SUPABASE_SERVICE_ROLE_KEY)
```

Or import from a BGG CSV export:

```bash
npm run migrate:import-bgg
npm run migrate:backfill-shared-tags
```

### 5. Promote your owner account

After signing in once, set `role = 'owner'` on your row in `public.profiles`. The SQL snippet is at the bottom of `schema.sql`.

### 6. Run the app

```bash
npm run dev
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript checks only |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |
| `npm run migrate:generate` | Generate seed data from legacy source file |
| `npm run migrate:import` | Import seed data to Supabase |
| `npm run migrate:import-bgg` | Import games from a BGG CSV export |
| `npm run migrate:backfill-shared-tags` | Backfill shared tags from game metadata |

## Data Model

- `games` — shared catalog (owner-managed)
- `tags` / `game_tags` — shared taxonomy
- `library_entries` — per-user saved/loved/in-collection states
- `user_tags` / `user_game_tags` — per-user tagging
- `profiles` — auth-linked user profiles with visibility settings
- Public pages expose only catalog-safe data (no private library details)

## Project Structure

```
.
├── api/                    # Vercel Functions (bgg-search, bgg-refresh)
├── data/                   # BGG CSV data
├── schema.sql              # Full database schema
├── scripts/                # One-off migration and seeding scripts
├── supabase/               # Supabase config and migrations
├── src/
│   ├── app/                # Providers and router
│   ├── components/         # UI components by domain
│   ├── config/             # Scenario presets and static config
│   ├── features/           # Data hooks and mutations by domain
│   ├── lib/                # Supabase client, query helpers, utilities
│   ├── pages/              # Route-level page components
│   └── types/              # Shared TypeScript types
└── vercel.json             # Build config and SPA rewrite rule
```

## Deployment

Deployed on Vercel. Configuration in `vercel.json`:

- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrite: all routes served from `index.html`
- API functions in `api/` are deployed as Vercel Functions
