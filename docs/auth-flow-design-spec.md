# Authentication Flow Design Specification

## Overview

This document specifies the complete sign-in and registration flow for an application supporting passkeys, magic links, and OAuth social providers (Apple, Google, Discord, GitHub). The design prioritises a single unified entry point — one email field that handles all authentication paths — with OAuth as a clearly visible alternative.

The guiding principle is **progressive disclosure**: the user always takes the simplest path available to them, and complexity (account linking, passkey setup prompts) is introduced only when it is relevant.

---

## Sign-In Page Layout

### Visual Structure

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                   [App Logo]                        │
│                                                     │
│              Sign in to [App Name]                  │
│                                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │  your@email.com                          🔑 │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │           Continue with email               │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
│   ─────────────────── or ───────────────────────   │
│                                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │  🍎   Continue with Apple                   │   │
│   └─────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────┐   │
│   │  G    Continue with Google                  │   │
│   └─────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────┐   │
│   │  🎮   Continue with Discord                 │   │
│   └─────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────┐   │
│   │  🐙   Continue with GitHub                  │   │
│   └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Email Field Specification

- `<input type="email" autocomplete="username webauthn">`
- The `webauthn` token in `autocomplete` activates Conditional UI in supported browsers (Chrome 108+, Safari 16+, Edge 108+)[cite:31][cite:33]
- A passkey icon (🔑 or lock icon) may optionally be shown as a suffix on the input to hint at passkey support — it should be decorative only and not a button
- Standard email format validation before submission

### Continue with Email Button

- Primary CTA; triggers the magic link / account lookup flow (see Section 3)
- Label is always "Continue with email" regardless of whether the user is new or returning — do not differentiate in the button text to avoid account enumeration

### OAuth Buttons

- Each button shows the provider logo + "Continue with [Provider]" text
- All four are visible by default; do not collapse into a "more options" menu as this reduces trust
- Ordered: Apple, Google, Discord, GitHub (by general user base size)

---

## Authentication Paths

### Path 1: Passkey User (Conditional UI)

**Trigger:** User focuses or clicks the email input field and the browser detects a saved passkey for the site.

**Flow:**

1. Page loads → JavaScript immediately fires a background WebAuthn request with `mediation: 'conditional'` and `signal: AbortController.signal`[cite:34][cite:35]
2. User clicks the email field
3. Browser renders its native autofill dropdown, listing available passkeys alongside any saved passwords
4. User selects their passkey from the dropdown
5. Browser triggers device biometric prompt (Face ID / Touch ID / Windows Hello / PIN)
6. On success, the WebAuthn credential is returned to the app's JavaScript handler
7. App verifies the credential server-side and issues a session
8. User is redirected to their home/dashboard view

**Notes:**
- The email field is never submitted — the WebAuthn response includes the user's credential ID which maps to their account server-side
- The abort controller must be cancelled if the user manually submits the form, to prevent a conflicting modal WebAuthn request firing simultaneously[cite:34]
- If the user is on a new device where no passkey is synced yet, no passkey will appear in the dropdown and they fall through to Path 2 naturally[cite:47]

---

### Path 2: Email Magic Link

**Trigger:** User types their email and presses "Continue with email".

**Step 1 — Email Submission**

1. Client-side validates email format
2. POST to `/auth/email` with `{ email }`
3. Server looks up the email in the database

**Step 2a — Returning User (email exists)**

1. Server generates a short-lived, single-use signed token (recommended: 15-minute expiry, HMAC-signed or JWT)
2. Email sent: "Here's your sign-in link for [App Name]"
3. UI displays: *"Check your email — we've sent a link to [email]"*
4. User clicks link → token validated server-side → session issued → redirect to dashboard
5. After login, if the user has no passkey registered: show passkey setup prompt (see Section 4)

**Step 2b — New User (email not found)**

1. Server generates same-format token, creates a provisional account record flagged as `email_unverified`
2. Email sent: "Confirm your email to finish creating your account"
3. UI displays identical message: *"Check your email — we've sent a link to [email]"*
4. User clicks link → email verified → account activated → session issued
5. Redirect to onboarding / first-run experience
6. Passkey setup prompt shown as part of onboarding (see Section 4)

**Account Enumeration Protection:**
The UI response must be **identical** for both Step 2a and 2b — the same message, same timing. Never reveal in the UI whether an account was found.[cite:46] The distinction is handled silently server-side and resolved only when the link is clicked.

---

### Path 3: OAuth Providers

**Trigger:** User clicks one of the four OAuth provider buttons.

**General Flow:**

1. Redirect to provider's OAuth authorisation URL with appropriate scopes (email, profile)
2. User authenticates with provider
3. Provider redirects back with authorisation code
4. Server exchanges code for access token, retrieves user profile (id, email, name, avatar)
5. Server checks `email_verified` flag from provider payload — **do not proceed with account linking if `false`**[cite:21]
6. Server looks up the email in the database

**Case A — Email matches an existing account:**

- Link the new OAuth provider to the existing account (add a row to `oauth_providers` table referencing the user)
- Issue session as the existing user
- Notify user (optional in-app banner): *"Your [Provider] account has been linked to your existing account"*

**Case B — No existing account found:**

- Create new account with details from the OAuth profile
- Issue session
- Proceed to onboarding, including passkey setup prompt

**Provider-Specific Notes:**

| Provider | `email_verified` behaviour | Notes |
|---|---|---|
| Google | Always `true` if email returned | Safe to auto-link[cite:21] |
| Apple | Always verified for Apple ID email | Use `sub` as stable identifier — Apple emails can be relay addresses |
| Discord | `verified` field in user object — **check explicitly** | Unverified Discord emails must not trigger auto-link[cite:21][cite:25] |
| GitHub | Primary email verified; must query `/user/emails` endpoint | Use the email where `primary: true` and `verified: true` |

**Security Note on Auto-Linking:**
Auto-linking based solely on matching email is acceptable when the provider has verified the email. For a higher security posture, consider requiring the user to confirm linking via their existing auth method (e.g., send a confirmation to the email on file) before silently merging accounts.[cite:23]

---

## Post-Login: Passkey Setup Prompt

Shown to users who do not yet have a passkey registered on the current device. This should be a **suggestion, not a gate** — always provide a clear dismiss option.

### When to Show

- Immediately after first-time OAuth sign-in (new account)
- Immediately after first magic link sign-in on a new device
- After magic link sign-in if the user has no passkeys at all (first login ever)
- **Do not** show on every login; suppress after one dismissal per device for 30 days

### UI Pattern

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   🔑  Sign in faster next time                      │
│                                                      │
│   Set up a passkey to log in with Face ID or        │
│   Touch ID — no email link needed.                  │
│                                                      │
│   [ Create passkey ]        [ Maybe later ]         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Presented as a dismissible card or bottom sheet, **not a blocking modal**
- "Create passkey" triggers a standard (modal) WebAuthn registration ceremony
- On success, confirm with: *"Passkey saved — you're all set"*
- On dismiss, store a suppression flag (in-memory or server-side user preference)

### Technical Flow for Passkey Registration

1. App requests registration options from server: POST `/auth/passkey/register/begin`
2. Server returns `PublicKeyCredentialCreationOptions` with user id, challenge, and relying party details
3. App calls `navigator.credentials.create({ publicKey: options })`
4. Device shows biometric/PIN prompt
5. On success, app sends credential to server: POST `/auth/passkey/register/complete`
6. Server validates and stores the public key and credential ID against the user record

---

## Edge Cases and Error Handling

### Passkey on Different Device

A user who registered a passkey on their phone will not see it in the autofill dropdown on a new laptop (unless it is synced via iCloud Keychain or Google Password Manager). The expected behaviour is:

- No passkey appears in autofill → user types email → receives magic link → logs in → passkey prompt offers to register a passkey on the new device[cite:47]

### Expired or Used Magic Link

- Return HTTP 401 with message: *"This link has expired or has already been used. Request a new one."*
- Provide a one-click option to resend to the same email

### OAuth Provider Returns Unverified Email

- Do not create an account or link providers
- Display: *"We couldn't verify your email address with [Provider]. Please sign in with a verified email."*
- Log the event for monitoring

### Rate Limiting

- Magic link requests: limit to 5 per email address per hour
- WebAuthn registration: limit to 10 per user per day
- OAuth callbacks: standard rate limiting applies per IP

### User Has Multiple Auth Methods

A single user account may have any combination of:
- One or more registered passkeys (across devices)
- One or more linked OAuth providers
- A verified email (for magic links)

All are valid entry points to the same account. The account record is the canonical identity; auth methods are credentials pointing to it.

---

## Summary of Browser Support

| Feature | Chrome | Safari | Firefox | Edge |
|---|---|---|---|---|
| Conditional UI (passkey autofill) | 108+ | 16+ | Not supported[cite:33] | 108+ |
| Passkey creation (WebAuthn) | 67+ | 16+ | 60+ | 18+ |
| Magic links | All | All | All | All |
| OAuth | All | All | All | All |

Firefox users will not see passkeys in autofill but can still create and use passkeys via the explicit post-login prompt. The magic link and OAuth paths remain fully functional on all browsers.

---

## Server-Side Data Model (Reference)

```
users
  id            UUID PRIMARY KEY
  email         TEXT UNIQUE NOT NULL
  email_verified BOOLEAN DEFAULT FALSE
  created_at    TIMESTAMP

oauth_providers
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  provider      TEXT  -- 'apple' | 'google' | 'discord' | 'github'
  provider_uid  TEXT  -- stable ID from provider
  created_at    TIMESTAMP

passkeys
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  credential_id BYTEA UNIQUE NOT NULL
  public_key    BYTEA NOT NULL
  device_name   TEXT  -- optional, e.g. "Michael's iPhone"
  last_used_at  TIMESTAMP
  created_at    TIMESTAMP

magic_link_tokens
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  token_hash    TEXT UNIQUE NOT NULL
  expires_at    TIMESTAMP
  used_at       TIMESTAMP  -- NULL until consumed
```

