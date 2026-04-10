import { useQuery } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
import { useProfile } from "./useProfile";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";

export type AccountSecurityPasskey = {
  id: string;
  device_name: string | null;
  last_used_at: string | null;
  created_at: string;
};

export type AccountSecurityIdentity = {
  provider: string;
  label: string;
};

export type AccountSecurityEmail = {
  id: string;
  value: string;
  isPrimary: boolean;
};

export type AccountSecuritySummary = {
  primaryEmail: string | null;
  emails: AccountSecurityEmail[];
  identities: AccountSecurityIdentity[];
  passkeys: AccountSecurityPasskey[];
};

type PasskeyListResponse = {
  passkeys?: AccountSecurityPasskey[];
};

const PROVIDER_LABELS: Record<string, string> = {
  apple: "Apple",
  discord: "Discord",
  email: "Email link",
  github: "GitHub",
  google: "Google",
};

function getProviderLabel(provider: string) {
  return PROVIDER_LABELS[provider] ?? provider.charAt(0).toUpperCase() + provider.slice(1);
}

function getPrimaryEmail(profileEmail: string | null, sessionEmail: string | null) {
  return profileEmail ?? sessionEmail ?? null;
}

export function useAccountSecuritySummary() {
  const { profile, isAuthenticated } = useProfile();

  return useQuery({
    queryKey: authKeys.accountSecuritySummary(profile?.id),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<AccountSecuritySummary> => {
      const supabase = getSupabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      const user = session?.user ?? null;
      const primaryEmail = getPrimaryEmail(profile?.email ?? null, user?.email ?? null);

      const emailSet = new Set<string>();
      const emails: AccountSecurityEmail[] = [];

      [primaryEmail, user?.email ?? null].forEach((value, index) => {
        if (!value || emailSet.has(value)) {
          return;
        }

        emailSet.add(value);
        emails.push({
          id: `${value}-${index}`,
          value,
          isPrimary: value === primaryEmail,
        });
      });

      const rawIdentities = Array.isArray((user as { identities?: unknown[] } | null)?.identities)
        ? ((user as { identities?: Array<{ provider?: string }> }).identities ?? [])
        : [];
      const providerSet = new Set<string>();
      const identities: AccountSecurityIdentity[] = [];

      rawIdentities.forEach((identity) => {
        if (!identity?.provider || providerSet.has(identity.provider)) {
          return;
        }

        providerSet.add(identity.provider);
        identities.push({
          provider: identity.provider,
          label: getProviderLabel(identity.provider),
        });
      });

      const appProvider =
        typeof user?.app_metadata?.provider === "string" ? user.app_metadata.provider : null;
      if (appProvider && appProvider !== "email" && !providerSet.has(appProvider)) {
        identities.push({
          provider: appProvider,
          label: getProviderLabel(appProvider),
        });
      }

      const { data, error } = await supabase.functions.invoke<PasskeyListResponse>("passkey-list");

      return {
        primaryEmail,
        emails,
        identities,
        passkeys: error ? [] : (data?.passkeys ?? []),
      };
    },
  });
}
