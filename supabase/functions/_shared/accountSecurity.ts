import type { User } from "npm:@supabase/supabase-js@2";
import { getAuthUserFromRequest, getServiceClient, resolveAccountContextForAuthUser } from "./auth.ts";

type AuthIdentity = {
  identity_id?: string | null;
  id?: string | null;
  provider?: string | null;
  identity_data?: {
    email?: string | null;
    email_verified?: boolean | string | null;
  } | null;
};

export type AccountSecuritySummaryPayload = {
  primaryEmail: string | null;
  secondaryEmails: Array<{ email: string }>;
  identities: Array<{ provider: string; email: string | null }>;
  passkeys: Array<{
    id: string;
    device_name: string | null;
    last_used_at: string | null;
    created_at: string;
  }>;
};

export class AccountSecurityError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

function getAuthIdentities(user: User): AuthIdentity[] {
  const identities = (user as User & { identities?: unknown }).identities;
  if (!Array.isArray(identities)) return [];
  return identities as AuthIdentity[];
}

function getProviderFromAppMetadata(user: User): string {
  const provider = (user.app_metadata as Record<string, unknown> | undefined)?.provider;
  return isNonEmptyString(provider) ? provider.toLowerCase() : "email";
}

async function callRpcOrThrow(functionName: string, params: Record<string, unknown>) {
  const supabase = getServiceClient();
  const { error } = await supabase.rpc(functionName, params);
  if (error) {
    throw new AccountSecurityError(500, error.message);
  }
}

function normalizeSummaryPayload(data: unknown): AccountSecuritySummaryPayload {
  if (!data || typeof data !== "object") {
    return {
      primaryEmail: null,
      secondaryEmails: [],
      identities: [],
      passkeys: [],
    };
  }

  const payload = data as Record<string, unknown>;
  const secondaryEmails = Array.isArray(payload.secondaryEmails)
    ? payload.secondaryEmails
        .map((entry) => {
          const email = typeof (entry as { email?: unknown })?.email === "string"
            ? (entry as { email: string }).email
            : null;
          return email ? { email } : null;
        })
        .filter((entry): entry is { email: string } => entry !== null)
    : [];

  const identities = Array.isArray(payload.identities)
    ? payload.identities
        .map((entry) => {
          const provider = typeof (entry as { provider?: unknown })?.provider === "string"
            ? (entry as { provider: string }).provider
            : null;
          const email = typeof (entry as { email?: unknown })?.email === "string"
            ? (entry as { email: string }).email
            : null;
          return provider ? { provider, email } : null;
        })
        .filter((entry): entry is { provider: string; email: string | null } => entry !== null)
    : [];

  const passkeys = Array.isArray(payload.passkeys)
    ? payload.passkeys
        .map((entry) => {
          const row = entry as Record<string, unknown>;
          if (!isNonEmptyString(row.id) || !isNonEmptyString(row.created_at)) {
            return null;
          }

          return {
            id: row.id,
            device_name: typeof row.device_name === "string" ? row.device_name : null,
            last_used_at: typeof row.last_used_at === "string" ? row.last_used_at : null,
            created_at: row.created_at,
          };
        })
        .filter(
          (
            entry,
          ): entry is {
            id: string;
            device_name: string | null;
            last_used_at: string | null;
            created_at: string;
          } => entry !== null,
        )
    : [];

  return {
    primaryEmail: typeof payload.primaryEmail === "string" ? payload.primaryEmail : null,
    secondaryEmails,
    identities,
    passkeys,
  };
}

export async function syncCurrentAccountSecurity(req: Request) {
  const authUser = await getAuthUserFromRequest(req);
  if (!authUser) {
    throw new AccountSecurityError(401, "Unauthorized");
  }

  const accountContext = await resolveAccountContextForAuthUser(authUser.id);
  const identities = getAuthIdentities(authUser);
  const hasConfirmedPrimaryEmail = isNonEmptyString(authUser.email) && !!authUser.email_confirmed_at;

  if (hasConfirmedPrimaryEmail) {
    await callRpcOrThrow("sync_account_email", {
      p_account_id: accountContext.accountId,
      p_email: authUser.email,
      p_is_primary: accountContext.primaryAuthUserId === authUser.id,
      p_verified_at: authUser.email_confirmed_at,
    });
  }

  if (identities.length === 0) {
    await callRpcOrThrow("sync_account_identity", {
      p_account_id: accountContext.accountId,
      p_auth_user_id: authUser.id,
      p_auth_identity_id: authUser.id,
      p_provider: getProviderFromAppMetadata(authUser),
      p_provider_subject: authUser.id,
      p_provider_email: hasConfirmedPrimaryEmail ? authUser.email : null,
      p_provider_email_verified: hasConfirmedPrimaryEmail,
    });
    return accountContext;
  }

  for (const identity of identities) {
    const provider = isNonEmptyString(identity.provider) ? identity.provider.toLowerCase() : null;
    const providerSubject = isNonEmptyString(identity.id)
      ? identity.id
      : (isNonEmptyString(identity.identity_id) ? identity.identity_id : authUser.id);
    const providerEmail = isNonEmptyString(identity.identity_data?.email)
      ? identity.identity_data.email.toLowerCase()
      : null;
    const providerEmailVerified =
      toBoolean(identity.identity_data?.email_verified) ||
      (providerEmail !== null &&
        isNonEmptyString(authUser.email) &&
        authUser.email_confirmed_at !== null &&
        providerEmail === authUser.email.toLowerCase());

    await callRpcOrThrow("sync_account_identity", {
      p_account_id: accountContext.accountId,
      p_auth_user_id: authUser.id,
      p_auth_identity_id: isNonEmptyString(identity.identity_id) ? identity.identity_id : null,
      p_provider: provider,
      p_provider_subject: providerSubject,
      p_provider_email: providerEmail,
      p_provider_email_verified: providerEmailVerified,
    });
  }

  return accountContext;
}

export async function getAccountSecuritySummaryForRequest(
  req: Request,
): Promise<AccountSecuritySummaryPayload> {
  const authUser = await getAuthUserFromRequest(req);
  if (!authUser) {
    throw new AccountSecurityError(401, "Unauthorized");
  }

  const accountContext = await resolveAccountContextForAuthUser(authUser.id);
  const supabase = getServiceClient();
  const { data, error } = await supabase.rpc("get_account_security_summary", {
    p_account_id: accountContext.accountId,
  });

  if (error) {
    throw new AccountSecurityError(500, error.message);
  }

  return normalizeSummaryPayload(data);
}
