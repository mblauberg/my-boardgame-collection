# My Boardgame Collection

A personal board-game tracker built with **Vite + React 19 + Supabase**. Manage a shared game catalogue, track your personal collection and saved games, discover what to play next, and share your library publicly.

**Live:** <https://my-boardgame-collection.vercel.app>

---

## Features

- 🎲 **Shared catalogue** — browse the full game library with BGG metadata (ratings, weight, player count, categories)
- 📚 **Personal library** — track owned games (Collection) and games on your radar (Saved) with sentiment, notes, and tags
- 🔍 **Explore & Scenarios** — filter and discover what to play; get curated recommendations and cuts based on your library
- 🔐 **Flexible auth** — email magic links, OAuth (Google, Discord, GitHub), and passkeys (WebAuthn)
- 👤 **Guest mode** — use the app without signing in; library syncs to your account on first sign-in
- 🌐 **Public profiles** — optionally share your collection and/or saved list at `/u/<username>`
- 🌗 **Dark mode** — persistent light/dark theme toggle
- 🛠 **Owner admin** — catalogue management and BGG metadata refresh for the site owner

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vite 8, React 19, TypeScript, React Router 7, TanStack Query 5 |
| Styling | Tailwind CSS 3 + Material Design 3 CSS token system |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Auth extras | SimpleWebAuthn (passkeys) |
| API proxy | Vercel serverless functions |
| Testing | Vitest + Testing Library |
| Deployment | Vercel |

---

## Getting started

### Prerequisites

- Node.js 20+
- npm
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local backend)

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/my-boardgame-collection.git
cd my-boardgame-collection
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in the required values:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=http://localhost:5173
SITE_URL=http://localhost:5173
BGG_APPLICATION_TOKEN=your-bgg-token
```

`VITE_AUTH_ENABLED_OAUTH_PROVIDERS` defaults to `google,discord,github` if omitted. Set OAuth provider credentials for local auth testing (see `.env.example`).

### 3. Start the backend

**Option A — Hosted Supabase:** point `.env.local` to your project and run `npm run dev`.

**Option B — Local Supabase CLI:**

```bash
supabase start
supabase db reset   # applies the schema migration
npm run dev
```

### 4. Promote yourself to owner (optional)

After signing in, run this in the Supabase SQL editor or `psql`:

```sql
update public.profiles set role = 'owner' where email = 'you@example.com';
```

This unlocks the `/admin` page and the BGG metadata refresh API.

---

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server with local API shim |
| `npm run build` | Type-check + production build |
| `npm run typecheck` | Type-check all surfaces (app, scripts, edge functions) |
| `npm run test` | Vitest in watch mode |
| `npm run test:run` | Vitest one-shot |
| `npm run migrate:import-bgg` | Import games from BGG CSV export |
| `npm run migrate:backfill-shared-tags` | Backfill shared tags |

---

## Project structure

```text
.
├── api/             Vercel serverless API routes (BGG search + refresh proxy)
├── docs/            Design specs, planning docs, auth flow doc
├── scripts/         Data import and maintenance scripts
├── src/             React application (see src/README.md)
├── supabase/
│   ├── config.toml  Local Supabase CLI config
│   ├── functions/   Deno Edge Functions (auth, passkeys, email merge)
│   └── migrations/  Database schema — single rebaseline migration
└── ui_design/       Design reference docs and mockups
```

For a detailed breakdown of the source tree, see [`src/README.md`](src/README.md).  
For backend schema and Edge Function details, see [`supabase/README.md`](supabase/README.md).

---

## Schema notes

The schema was rebaselined into a single migration (`supabase/migrations/20260410160430_rebaseline_schema.sql`). If you have pre-rebaseline migrations in your local or linked project, mark them as reverted:

```bash
supabase migration repair \
  20260409000000 20260409143000 20260409161000 20260409210000 20260409220000 \
  20260410000000 20260410000001 20260410000002 20260410000003 20260410144055 \
  --status reverted --local   # use --linked for hosted
```

---

## Deployment

Production runs on Vercel. `vercel.json` configures:
- `/api/*` → serverless functions
- `/*` → `index.html` (SPA client-side routing)

TypeScript types for the database are generated via:

```bash
supabase gen types typescript --local > src/types/database.ts
```

