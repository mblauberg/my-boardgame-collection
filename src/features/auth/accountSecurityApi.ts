import { getSupabaseBrowserClient } from "../../lib/supabase/client";

export type AccountSecuritySummaryResponse = {
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

export type AccountSessionSyncResponse = {
  needsPasskeyPrompt: boolean;
};

function normalizeSummary(
  payload: Partial<AccountSecuritySummaryResponse> | null | undefined,
): AccountSecuritySummaryResponse {
  return {
    primaryEmail: payload?.primaryEmail ?? null,
    secondaryEmails: Array.isArray(payload?.secondaryEmails) ? payload.secondaryEmails : [],
    identities: Array.isArray(payload?.identities) ? payload.identities : [],
    passkeys: Array.isArray(payload?.passkeys) ? payload.passkeys : [],
  };
}

export async function syncAccountSession(): Promise<AccountSessionSyncResponse> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.functions.invoke<Partial<AccountSessionSyncResponse>>(
    "account-sync-session",
    undefined,
  );
  if (error) {
    throw new Error(error.message);
  }

  return {
    needsPasskeyPrompt: data?.needsPasskeyPrompt === true,
  };
}

export async function fetchAccountSecuritySummary(): Promise<AccountSecuritySummaryResponse> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.functions.invoke<AccountSecuritySummaryResponse>(
    "account-security-summary",
    {},
  );

  if (error) {
    throw new Error(error.message);
  }

  return normalizeSummary(data);
}
