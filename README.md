# My Boardgame Collection

A Vite and React app for browsing a shared board-game catalogue, managing
personal collection and saved lists, and optionally sharing them.

Live app: <https://my-boardgame-collection.vercel.app>

## Architecture

- **Frontend:** Vite 8, React 19, TypeScript, React Router 7 and TanStack Query
  form a client-rendered single-page app. This is not a Next.js app.
- **Backend:** Supabase provides Postgres, Auth, Storage and Deno Edge
  Functions. The data model separates the shared game catalogue from
  account-owned library entries, tags and profile settings.
- **Authentication:** Supabase Auth supports email magic links and configurable
  Google, Discord and GitHub OAuth. SimpleWebAuthn provides passkey sign-in and
  registration. Guest library state remains in browser local storage and is
  merged after sign-in.
- **Hosting and APIs:** Vercel serves the built SPA and the `/api/bgg-search`
  and `/api/bgg-refresh` serverless routes. Search uses a server-held
  BoardGameGeek application token; refresh also verifies an authenticated owner.

See [`src/README.md`](src/README.md) for frontend boundaries,
[`supabase/README.md`](supabase/README.md) for the backend and
[`docs/PROVENANCE.md`](docs/PROVENANCE.md) for data and asset rights.

## Security

Supabase Auth sessions are mapped to stable application accounts. Email magic
links, OAuth and passkeys all establish a Supabase session before account data
is loaded.

Row-level security is enabled in the migrations for account, profile, library,
tag, catalogue and storage tables. Policies and narrow public functions allow
reads of the visible catalogue and explicitly shared profiles or libraries,
restrict account data to the current account and reserve admin operations for
the owner role. Database functions and the BGG refresh route perform additional
authentication or role checks.

The Supabase anon key is a public client identifier, not an administrator
secret. Before sign-in it can access only operations allowed to the `anon`
database role, such as public catalogue reads and authentication flows. After
sign-in the user's JWT supplies the `authenticated` role. The anon key cannot
bypass row-level security, impersonate another account or grant service-role
access. `SUPABASE_SERVICE_ROLE_KEY` is privileged and must remain server-side
and outside version control.

## Features

- Browse and search the shared catalogue, including BoardGameGeek metadata.
- Maintain Collection and Saved lists with loved status, sentiment, notes and
  tags.
- Filter the library, explore curated shelves and view scenario groupings.
- Use guest mode without an account, then merge the local library after
  sign-in.
- Opt in to a public profile, collection or saved list at `/u/<username>`.
- Sign in by email magic link, supported OAuth provider or passkey.
- Switch between persistent light and dark themes.
- Manage catalogue entries and refresh BoardGameGeek metadata through the
  owner-only admin interface.

## Local setup

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm
- [Supabase CLI](https://supabase.com/docs/guides/cli) and its container runtime
  for a local backend
- An approved BoardGameGeek application token for live search

### Install and configure

```bash
git clone https://github.com/mblauberg/my-boardgame-collection.git
cd my-boardgame-collection
npm install
cp .env.example .env.local
```

Set the Supabase URL and anon key, local site URLs and BoardGameGeek application
token in `.env.local`. OAuth testing also requires credentials for each enabled
provider. Do not commit `.env.local` or expose the Supabase service-role key to
the browser.

Use a hosted Supabase project by setting its URL and anon key, then run:

```bash
npm run dev
```

For a local Supabase stack:

```bash
supabase start
supabase db reset
npm run dev
```

Useful commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite with local `/api` route shims |
| `npm run build` | Type-check the app and create a production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check the app, scripts and Edge Functions |
| `npm run test:run` | Run the Vitest suite once |
| `npm run migrate:import-bgg` | Import the local BoardGameGeek CSV snapshot |
| `npm run migrate:backfill-shared-tags` | Backfill shared catalogue tags |

## Testing and CI

Tests use Vitest, Testing Library and jsdom, with test files co-located beside
the source. Run the suite locally with:

```bash
npm run test:run
```

The GitHub Actions workflow in [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
runs `npm ci`, linting, full type-checking, the Vitest suite and the production
build for pull requests and configured branch pushes.

## Licence

Project code is available under the [MIT Licence](LICENSE). Third-party data,
game images, icons, fonts and trademarks keep their own terms and are not
relicensed under MIT. See [`docs/PROVENANCE.md`](docs/PROVENANCE.md).
