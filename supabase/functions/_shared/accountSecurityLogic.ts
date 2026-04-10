type ProviderIdentity = {
  id?: string | null;
  identity_id?: string | null;
  provider?: string | null;
  identity_data?: {
    email?: string | null;
    email_verified?: boolean | string | null;
  } | null;
};

type ProviderAwareUser = {
  email?: string | null;
  email_confirmed_at?: string | null;
  app_metadata?: Record<string, unknown> | null;
  identities?: ProviderIdentity[] | null;
};

export type ActiveProviderState = {
  provider: string;
  email: string | null;
  isEmailVerified: boolean;
  shouldReject: boolean;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

function normalizeEmail(value: unknown): string | null {
  return isNonEmptyString(value) ? value.trim().toLowerCase() : null;
}

function getProvider(user: ProviderAwareUser): string {
  const provider = user.app_metadata?.provider;
  return isNonEmptyString(provider) ? provider.toLowerCase() : "email";
}

function getIdentities(user: ProviderAwareUser): ProviderIdentity[] {
  return Array.isArray(user.identities) ? user.identities : [];
}

function getIdentityEmailVerified(user: ProviderAwareUser, identity: ProviderIdentity): boolean {
  const identityEmail = normalizeEmail(identity.identity_data?.email);
  const userEmail = normalizeEmail(user.email);

  return (
    toBoolean(identity.identity_data?.email_verified) ||
    (identityEmail !== null && userEmail !== null && user.email_confirmed_at !== null && identityEmail === userEmail)
  );
}

export function getVerifiedEmailCandidates(user: ProviderAwareUser): string[] {
  const emails = new Set<string>();

  const primaryEmail = normalizeEmail(user.email);
  if (primaryEmail && user.email_confirmed_at) {
    emails.add(primaryEmail);
  }

  for (const identity of getIdentities(user)) {
    const identityEmail = normalizeEmail(identity.identity_data?.email);
    if (!identityEmail) continue;

    if (getIdentityEmailVerified(user, identity)) {
      emails.add(identityEmail);
    }
  }

  return [...emails];
}

export function getActiveProviderState(user: ProviderAwareUser): ActiveProviderState {
  const provider = getProvider(user);

  if (provider === "email") {
    const email = normalizeEmail(user.email);
    const isEmailVerified = email !== null && user.email_confirmed_at !== null;

    return {
      provider,
      email,
      isEmailVerified,
      shouldReject: false,
    };
  }

  const identity = getIdentities(user).find(
    (candidate) => isNonEmptyString(candidate.provider) && candidate.provider.toLowerCase() === provider,
  );
  const email = normalizeEmail(identity?.identity_data?.email) ?? normalizeEmail(user.email);
  const isEmailVerified = identity
    ? getIdentityEmailVerified(user, identity)
    : (email !== null && user.email_confirmed_at !== null);

  return {
    provider,
    email,
    isEmailVerified,
    shouldReject: !isEmailVerified,
  };
}
