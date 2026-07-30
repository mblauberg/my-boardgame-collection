# Provenance

## Data

Data sourced from BoardGameGeek: `data/boardgames_ranks.csv` is identified as
BoardGameGeek rankings data, and the live search and refresh routes use the
BoardGameGeek XML API. [BGG's XML API terms](https://boardgamegeek.com/wiki/page/XML_API_Terms_of_Use)
grant use “solely for strictly non-commercial purposes” and require source
credit and a linked, legible Powered by BGG logo in public-facing uses.

Data sourced from hand-entered legacy objects in
`scripts/legacy/assets/board-game-collection.jsx`, which generate
`scripts/legacy/output/seed-data.json`. The authorship and original sources of
the ratings, weights and summaries are **UNRESOLVED — needs Michael**. No
`seed/` directory or separate fixture JSON files were found.

## Images and assets

Image assets: no bundled game cover art was found under `src/`, and there is no
`public/` directory. Runtime covers are remote BoardGameGeek image URLs,
operator-supplied URLs or uploads to Supabase Storage; their copyright and
redistribution rights are **UNRESOLVED — needs Michael** and are not covered by
the repository's MIT licence. Interface icons use Google Material Symbols and
Iconify, while missing covers use a generated SVG fallback. The inline favicon
and the third-party-looking images in `ui_design/` have no recorded authorship
or redistribution licence: **UNRESOLVED — needs Michael**.

## Dependencies

Key dependencies checked: `react: MIT`, `react-dom: MIT`,
`@supabase/supabase-js: MIT`, `@tanstack/react-query: MIT`,
`react-router-dom: MIT`, `vite: MIT`, `vitest: MIT`,
`@simplewebauthn/browser: MIT`, `@iconify/react: MIT`,
`framer-motion: MIT`, `zod: MIT`, `dotenv: BSD-2-Clause` and
`typescript: Apache-2.0`. No GPL or AGPL licence was found in the lockfile. All
compatible with MIT licence.

## Third-party services

BoardGameGeek XML API: non-commercial by default; application registration,
an application token, source credit and a linked Powered by BGG logo are
required.

Supabase: standard ToS.

Vercel: standard ToS.

Google, Discord, GitHub and Apple OAuth: standard provider developer ToS.

Google Fonts and Material Symbols: standard Google API ToS; the fonts and
symbols retain their own open-source licences.

Iconify API: standard ToS; each icon set retains its own licence and provider
marks may also be protected by trademark.
