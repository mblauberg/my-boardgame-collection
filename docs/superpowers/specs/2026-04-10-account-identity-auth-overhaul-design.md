# Account Identity And Auth UI Overhaul Design

Status: Approved for planning
Date: 2026-04-10

## Summary

This design splits the current auth/account work into three implementation plans:

1. Identity foundation
2. Auth linking and security behavior
3. Auth and account UI overhaul

The core decision is to move to an identity-first account model before redesigning the auth UX. The app should stop treating `auth.users` as the app account. Instead, app-owned data should belong to a first-class `accounts` model, while emails, auth identities, and passkeys become account-managed credentials.

Once that foundation exists:

- `/signin` becomes an overlay flow instead of a standalone page-first experience
- `Settings` becomes the real account hub
- `Sign-in methods` becomes a quiet settings summary card that opens a floating sheet on desktop/tablet and a full-screen view on mobile
- Passkeys are presented as the premium security feature without making the settings page visually loud

## Goals

- Separate app account ownership from Supabase auth identities
- Support multiple verified email addresses per account
- Support multiple login providers per account, including providers with different emails
- Auto-link new provider identities when they return the same verified email as an existing account email
- Add different verified provider emails as secondary emails when the user explicitly links that provider
- Make passkeys account-scoped and easy to understand in the UI
- Redesign sign-in and account settings into a cleaner, more modern, more coherent experience

## Non-Goals

- Completing the full identity refactor, callback rewrite, and UI overhaul in one delivery
- Designing or implementing notification preferences beyond existing real functionality
- Replacing Supabase Auth itself
- Supporting unverified provider emails as auto-link candidates

## Current Problems

- The app currently treats `auth.users` as both auth identity and app account owner
- `/signin` does double duty as unauthenticated sign-in and authenticated identity-linking UI
- Linked provider management is hidden after sign-in
- The settings page mixes real account features with placeholder or low-value UI
- The current schema is not a clean fit for multi-email, multi-identity accounts

## Approved Product Direction

### Account Model

The app will use a first-class `accounts` entity as the stable owner of app data. Auth identities become one of several ways to access that account.

### Sign-In UX

`/signin` remains a route, but the intended experience becomes a modal-style overlay over the current app screen, with a blurred background. Direct navigation to `/signin` should still work, but it should reuse the same overlay-oriented component and can degrade to a full-screen presentation on smaller devices.

### Account UX

`/settings` becomes the canonical account management surface.

The settings page should include a quiet `Sign-in methods` summary card that:

- feels like a natural settings surface
- highlights passkeys as the premium security feature
- shows whether at least one passkey exists
- encourages passkey setup when none exist

Selecting that card opens:

- a floating sheet on desktop and tablet
- a full-screen sheet/page on mobile

The detail surface contains, in order:

1. Passkeys
2. Linked providers
3. Email addresses

## Architecture

### Core Domain Model

The application should distinguish these concepts clearly:

- `account`: the app-owned entity that owns profile, library, saved games, tags, passkeys, and other user data
- `identity`: a credential path that can authenticate into an account, backed by a Supabase auth user and provider metadata
- `email`: a verified address owned by an account, with one primary email and zero or more secondary emails

### Proposed Tables

#### `accounts`

Purpose:
- Stable app-level ownership record

Suggested fields:
- `id`
- `primary_auth_user_id`
- `created_at`
- `updated_at`

Notes:
- `primary_auth_user_id` is the canonical auth user used when the app needs to mint a session for account-scoped flows such as passkey sign-in
- During migration, `accounts.id` may initially be seeded to match current `auth.users.id` values for safer rollout, but the code must still treat `accounts` as a distinct domain entity

#### `account_identities`

Purpose:
- One row per linked auth identity

Suggested fields:
- `id`
- `account_id`
- `auth_user_id`
- `provider`
- `provider_subject`
- `provider_email`
- `provider_email_verified`
- `linked_at`
- `last_seen_at`

Notes:
- This table maps every Supabase auth user used by the app back to a single account
- `auth_user_id` should be unique
- `provider + provider_subject` should also be unique

#### `account_emails`

Purpose:
- Verified emails owned by an account

Suggested fields:
- `id`
- `account_id`
- `email_original`
- `email_normalized`
- `is_primary`
- `source_identity_id`
- `verified_at`
- `created_at`

Rules:
- one and only one primary email per account
- primary email must also be verified
- secondary emails are fully account-owned and eligible for future same-email auto-linking

#### Existing App-Owned Tables

The following should move to `account_id` ownership:

- `profiles`
- `library_entries`
- `user_tags`
- `user_game_tags`
- passkey tables
- any future account-owned preferences

## Auth Resolution Rules

### Rule 1: Existing Linked Identity

If the authenticated identity already exists in `account_identities`, resolve the session to that account.

### Rule 2: Same Verified Email Auto-Link

If a new identity authenticates with a verified email that matches any row in `account_emails.email_normalized`, automatically attach that identity to the existing account.

This is the default behavior for the case:

- user originally signs in with Google
- later signs in with Apple
- Apple returns the same verified Gmail address

Outcome:
- same account
- both Google and Apple appear as linked providers in the UI

### Rule 3: Explicit Linking With Different Verified Email

If a signed-in user intentionally links a provider whose verified email does not already exist on the account:

- attach that identity to the current account
- add that provider email to `account_emails` as a verified secondary email

This enables:

- multiple emails per account
- linking providers that do not share the same email
- future same-email auto-linking against any verified secondary email

### Rule 4: New Account Creation

If no linked identity exists, no matching verified email exists, and the user is not in an explicit linking flow, create:

- a new `accounts` row
- an `account_identities` row
- a primary `account_emails` row

### Rule 5: Unverified Provider Emails

If the provider email is not verified:

- do not auto-link
- do not add the email to `account_emails`
- require a different verified path or reject account-linking behavior

## Email Model

### Primary Email

Each account has one primary email used for:

- default account display
- account communication
- email-first UX copy in settings

### Secondary Emails

Secondary emails are:

- verified
- account-owned
- eligible for same-email auto-link matching
- shown in the `Sign-in methods` detail surface

### Email Promotion

The system should support promoting a verified secondary email to primary later. That promotion flow can be part of a later implementation plan if needed, but the schema should support it from the start.

## Passkey Model

Passkeys should belong to `account_id`, not directly to `auth.users.id`.

Reasoning:

- users should understand passkeys as an account security feature
- the UI groups passkeys with linked providers and owned emails
- the account is the stable owner, even if multiple auth identities are linked

Operational rule:

- after successful passkey verification, the app should issue the authenticated session against the account's canonical auth user, represented by `accounts.primary_auth_user_id`

This keeps passkey authentication compatible with Supabase session issuance while preserving the account-first domain model.

## UI Design

### Sign-In Overlay

The sign-in route should become an overlay pattern:

- blurred app background
- centered sign-in sheet on desktop/tablet
- full-screen or nearly full-screen presentation on mobile
- same unified email field plus OAuth options
- passkeys remain conditional and background-driven, with no standalone passkey button

The overlay should feel lighter and more integrated than a dedicated auth page. It should look like the user is signing into the current product context, not navigating to a separate auth site.

### Settings Page Overhaul

The account page should be rebuilt around fewer, higher-value surfaces.

Recommended structure:

1. Hero/header
2. Profile and sharing
3. Sign-in methods summary card
4. Session/sign-out area

Recommended removals or replacements:

- remove placeholder notification settings until backed by real persisted behavior
- remove duplicated summary/tip cards that do not materially help the user

### Sign-In Methods Summary Card

Visual tone:

- quiet, clean settings card
- subtle status chips
- one premium treatment for passkeys

At-a-glance content:

- primary email
- linked providers count or names
- passkey status

Passkey presentation:

- if zero passkeys: a warm, premium accent state with a clear setup CTA
- if one or more passkeys: a calmer success state such as `Passkey enabled`, with count and optionally most recent device or usage detail

Interaction:

- opens a floating sheet on desktop/tablet
- opens a full-screen view on mobile

### Sign-In Methods Detail Surface

Section order:

1. Passkeys
2. Linked providers
3. Email addresses

The passkeys section should feel slightly more elevated than the others, since passkeys are the premium security feature and the primary desired upgrade path for users.

## Implementation Plans

### Plan 1: Identity Foundation

Deliverables:

- add `accounts`, `account_identities`, and `account_emails`
- add `account_id` ownership to app-owned data
- create a single account-resolution layer used by hooks, mutations, and protected views
- begin migrating app logic away from direct `auth.users` ownership assumptions

Success criteria:

- app-owned data resolves through `account_id`
- a signed-in auth identity can always be mapped to one app account
- current single-identity users continue to work unchanged

### Plan 2: Auth Linking And Security

Deliverables:

- rewrite callback and linking flows to use accounts
- implement same-email verified auto-linking
- implement explicit linking of different-email providers as secondary emails
- migrate passkeys to account ownership
- expose linked providers and account emails through account-aware services

Success criteria:

- same verified email across providers resolves to one account automatically
- explicit provider linking with a different verified email adds a secondary email
- passkey sign-in resolves to the correct account

### Plan 3: Auth And Account UI Overhaul

Deliverables:

- convert `/signin` to an overlay pattern
- redesign `SignInForm` and `SignInPage` to support the overlay presentation
- redesign `/settings` into a cleaner account hub
- add the quiet `Sign-in methods` card
- add floating sheet on desktop/tablet and full-screen detail view on mobile
- remove placeholder notification UI

Success criteria:

- sign-in feels integrated and modern
- account management is discoverable
- linking providers, managing passkeys, and understanding owned emails all happen in one coherent place

## Migration Strategy

### Phase A: Introduce New Tables

- create `accounts`
- create `account_identities`
- create `account_emails`
- add nullable `account_id` columns to app-owned tables where needed

### Phase B: Backfill

- create one account per existing user
- backfill `account_identities` from existing auth-linked users
- backfill `account_emails` from existing profile or auth email data
- backfill app-owned data onto `account_id`

### Phase C: Dual Read / Cutover

- introduce account-resolution services
- update hooks and queries to read via `account_id`
- move auth callback logic to account-aware resolution

### Phase D: Cleanup

- remove legacy assumptions that profile ownership equals `auth.users.id`
- remove UI flows that depend on authenticated `/signin`

## Testing Strategy

- migration tests for one-to-one backfill from existing users
- auth callback tests for:
  - existing linked identity
  - same verified email auto-link
  - explicit linking with a different verified email
  - unverified provider rejection
- passkey tests for account-level resolution and session issuance
- UI tests for:
  - sign-in overlay behavior
  - settings summary card states
  - floating sheet and mobile full-screen detail surfaces

## Risks

- Supabase auth sessions are still identity-based, so the account model must carefully define a canonical auth user for account-scoped flows
- The migration from `user_id` to `account_id` touches central data ownership paths and should be rolled out incrementally
- UI overhaul before account resolution would create rework, so sequencing must be preserved

## Final Recommendation

Proceed with three separate implementation plans in this order:

1. Identity foundation
2. Auth linking and security behavior
3. Auth and account UI overhaul

This keeps the model correct first, behavior correct second, and experience premium third.
