# `supabase/` — Backend

## Schema

**Single rebaseline migration**: `migrations/20260410160430_rebaseline_schema.sql`

This is the canonical schema source of truth. All schema changes must be made via new migration files — never edit the rebaseline migration directly.

If your local or linked project has pre-rebaseline migrations in `schema_migrations`, mark them reverted:

```bash
supabase migration repair \
  20260409000000 20260409143000 20260409161000 20260409210000 20260409220000 \
  20260410000000 20260410000001 20260410000002 20260410000003 20260410144055 \
  --status reverted --local
# Use --linked for a hosted project
```

### Key tables

| Table | Notes |
|---|---|
| `accounts` | Stable app identity entity; `id` is a UUID distinct from `auth.users.id` |
| `account_identities` | `(account_id, provider, provider_identity_id)` — maps OAuth identities to accounts |
| `account_emails` | `(account_id, email, is_primary)` — supports multiple emails per account |
| `profiles` | `(account_id, username, role, public_collection, public_saved)` |
| `games` | Shared catalogue with BGG metadata columns and editorial fields; `status` defaults to `'new_rec'` |
| `library_entries` | `(account_id, game_id, is_in_collection, is_saved, is_loved, sentiment, notes, priority)` |
| `passkeys` | WebAuthn credentials linked to `account_id` |
| `user_tags` | Account-scoped tags; `(account_id, name, slug, tag_type, colour)` |
| `user_game_tags` | `(library_entry_id, user_tag_id)` |
| `shared_tags` | Admin-managed catalogue tags |
| `game_tags` | `(game_id, shared_tag_id)` |

### RLS

Row Level Security is enabled on all user-data tables. Policies enforce:
- Users see/write only their own `library_entries`, `user_tags`, etc.
- Public collection/saved are readable when `profiles.public_collection` / `profiles.public_saved` is true
- `games` catalogue is readable by all; writable by `owner` role only (via service role in Edge Functions)

---

## Edge Functions

All functions are Deno-based. Shared helpers in `functions/_shared/`:

| File | Purpose |
|---|---|
| `cors.ts` | CORS headers, origin allowlist (`SITE_URL` / `CORS_ALLOWED_ORIGINS`), request method enforcement |
| *(other shared helpers)* | Auth context, error utilities |

### Function inventory

| Function | Method | Auth required | Purpose |
|---|---|---|---|
| `account-sync-session` | POST | User JWT | Sync Supabase auth state → accounts tables after sign-in |
| `account-security-summary` | POST | User JWT | Return emails, identities, passkeys for settings UI |
| `passkey-auth-options` | POST | None | Begin conditional passkey sign-in (returns options) |
| `passkey-auth-verify` | POST | None | Complete passkey sign-in (returns session) |
| `passkey-register-options` | POST | User JWT | Begin passkey registration |
| `passkey-register-verify` | POST | User JWT | Complete passkey registration |
| `passkey-list` | GET | User JWT | List registered passkeys |
| `passkey-delete` | DELETE | User JWT | Delete a passkey by ID |
| `email-merge-request` | POST | User JWT | Request email/account merge — sends confirmation email |
| `email-merge-verify` | POST | None | Verify merge token and execute the account merge |

### Deploying Edge Functions

```bash
supabase functions deploy <function-name>
# Or deploy all:
supabase functions deploy
```

### Type-checking Edge Functions

```bash
npm run typecheck:edge
# Equivalent to: deno check supabase/functions/**/*.ts
```

---

## Local Supabase stack

```bash
supabase start       # starts local Postgres, Auth, Storage, Edge runtime
supabase db reset    # wipes and re-applies all migrations (use after schema changes)
supabase stop        # stop the local stack
```

If auth provider settings change in `config.toml`, stop and restart the stack, then run `db reset`.

---

## `config.toml`

Supabase CLI project configuration. Key sections:

- `[auth]` — site URL, JWT expiry, email provider settings
- `[auth.external.*]` — OAuth provider credentials (populated from env vars in local dev; set in Supabase dashboard for production)
- `[storage]` — storage bucket configuration
