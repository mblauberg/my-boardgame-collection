create table public.passkeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  transports text[],
  device_name text,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.passkey_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  challenge text not null unique,
  expires_at timestamptz not null default (now() + interval '5 minutes'),
  created_at timestamptz not null default now()
);

create table public.email_merge_tokens (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null default (now() + interval '1 hour'),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.passkeys enable row level security;
alter table public.passkey_challenges enable row level security;
alter table public.email_merge_tokens enable row level security;

create index passkey_challenges_expires_at_idx on public.passkey_challenges (expires_at);
create index email_merge_tokens_expires_at_idx on public.email_merge_tokens (expires_at);
