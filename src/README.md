# `src/` — React Application

## Entry points

| File | Purpose |
|---|---|
| `main.tsx` | ReactDOM mount; imports global CSS |
| `App.tsx` | Composes `<AppProviders>` + `<AppRouter>` |
| `app/providers/AppProviders.tsx` | Provider stack: `ThemeProvider` → `QueryClientProvider` → `GuestLibrarySyncBoundary` → `ExploreSearchProvider` |
| `app/router/routeRegistry.tsx` | **Single source of truth** for all routes, nav visibility, overlay flags |
| `app/router/AppRouter.tsx` | Renders routes from registry; all pages are `React.lazy` |

---

## Directory structure

```
src/
├── app/
│   ├── providers/          AppProviders (global context stack)
│   └── router/             Route registry, router, error boundary
├── components/
│   ├── admin/              Admin-only: GameForm, AdminGamesTable, GameFormFields
│   ├── auth/               SignInOverlayFrame (auth card shell)
│   ├── games/              GameCard, GameDetailOverlay, GameDetailPanel, GameQuickEditForm
│   ├── layout/             AppShell, TopNavBar, BottomTabBar, PageHeader, FAB
│   ├── library/            OwnedLibraryPage, PublicLibraryPage, LibraryList,
│   │                       FilterBar, ExploreShelf, HorizontalShelf, DiscoverSection,
│   │                       AddGameWizard*, AdvancedFilters, QuickFilterPresets
│   ├── settings/           SignInMethodsSheet, SignInMethodsSummaryCard
│   └── ui/                 ErrorStatePanel, GameCardSkeleton (generic primitives)
├── features/               Domain logic — hooks, types, keys, mappers, schemas
│   ├── accounts/           useAccount, account.types
│   ├── auth/               SignInForm, useSession, useProfile, passkey, account-security
│   ├── games/              BGG API, game mappers, CRUD mutations, admin query
│   ├── library/            Library state, filters, surface configs, guest storage, queries
│   ├── profiles/           Public profile query, update mutation
│   ├── scenarios/          Scenario mappers (derive recommend/cut scenarios from library)
│   ├── shared/             Cross-feature filter utilities
│   └── tags/               Query key factories (tag mutations removed in hardening)
├── hooks/                  useInView (intersection observer)
├── lib/
│   ├── auth/               oauthProviders.ts (supported provider list + type guard)
│   ├── env.ts              readPublicEnv() — validates and parses VITE_* vars
│   ├── query/              queryClient singleton
│   ├── supabase/           client.ts (singleton), fetchAllRows, runtimeErrors
│   ├── theme.tsx           ThemeProvider + useTheme
│   └── utils/              General utilities
├── pages/                  Route-level page components (thin, delegate to features/components)
├── styles/
│   └── index.css           Global CSS: MD3 token vars (light + dark), base styles
├── test/                   Vitest setup
└── types/
    ├── database.ts         Generated Supabase types (do not hand-edit)
    └── domain.ts           App domain types: Game, LibraryEntry, Tag, GameStatus
```

---

## Feature module conventions

Each feature in `src/features/<name>/` follows this pattern:

- `<name>.types.ts` — feature-local types
- `<name>Keys.ts` — TanStack Query key factories
- `use<Name>Query.ts` — read hooks
- `use<Name>Mutations.ts` — write hooks
- `<name>Mappers.ts` — DB row → domain type mapping
- Co-located `*.test.ts` / `*.test.tsx` files

Features must not import from other features' internals. Cross-feature dependencies go through `src/types/` or `src/lib/`.

---

## Design system

The design is named **"Obsidian Gallery"** and uses a Material Design 3 colour role system:

- Token CSS vars defined in `src/styles/index.css` under `:root` (light) and `.dark` (dark)
- Tokens mapped to Tailwind utilities in `tailwind.config.ts` via `withOpacity()` helper (enables `/opacity` modifiers)
- Primary: amber/orange. Secondary: teal. Tertiary: yellow. Font: **Manrope**.
- Dark mode applied by class (`darkMode: "class"`) — set on `<html>` and `<body>` by `ThemeProvider`

Do **not** use hardcoded hex/rgb values for brand colours — always use Tailwind token utilities (`text-primary`, `bg-surface`, etc.).

---

## Pages and routes

| Route | Page | Notes |
|---|---|---|
| `/` | `CollectionPage` | Owned collection surface |
| `/saved` | `SavedPage` | Owned saved surface |
| `/explore` | `ExplorePage` | Explore catalogue + library |
| `/game/:slug` | `GameDetailPage` | Overlay or standalone |
| `/scenarios` | `ScenariosPage` | Recommend/cut scenario view |
| `/signin` | `SignInPage` | Overlay or standalone |
| `/auth/callback` | `AuthCallbackPage` | OAuth/magic-link redirect handler |
| `/admin` | `AdminPage` | Owner-only; protected by `RequireOwner` |
| `/settings` | `AccountSettingsPage` | Auth security settings |
| `/settings/sign-in-methods` | `SignInMethodsPage` | Manage linked providers |
| `/u/:username` | `PublicProfilePage` | Public user profile |
| `/u/:username/collection` | `PublicCollectionPage` | Public collection view |
| `/u/:username/saved` | `PublicSavedPage` | Public saved view |

Routes with `allowBackgroundOverlay: true` (`/game/:slug`, `/signin`) open as overlays when navigated to from within the app. `GameDetailOverlay` wraps `GameDetailPanel` for overlay rendering.

---

## Generated types

`src/types/database.ts` is generated from the Supabase schema — do not hand-edit. Regenerate with:

```bash
supabase gen types typescript --local > src/types/database.ts
# or for hosted project:
supabase gen types typescript --project-id <id> > src/types/database.ts
```
