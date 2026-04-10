import { useQuery } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
import { useProfile } from "./useProfile";
import { fetchAccountSecuritySummary } from "./accountSecurityApi";

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

export function useAccountSecuritySummary() {
  const { profile, isAuthenticated } = useProfile();

  return useQuery({
    queryKey: authKeys.accountSecuritySummary(profile?.id),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<AccountSecuritySummary> => {
      const summary = await fetchAccountSecuritySummary();
      const primaryEmail = summary.primaryEmail ?? profile?.email ?? null;
      const emailSet = new Set<string>();
      const emails: AccountSecurityEmail[] = [];

      [primaryEmail, ...summary.secondaryEmails.map((entry) => entry.email)].forEach((value, index) => {
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

      const providerSet = new Set<string>();
      const identities: AccountSecurityIdentity[] = [];

      summary.identities.forEach((identity) => {
        if (!identity.provider || providerSet.has(identity.provider)) {
          return;
        }

        providerSet.add(identity.provider);
        identities.push({
          provider: identity.provider,
          label: getProviderLabel(identity.provider),
        });
      });

      return {
        primaryEmail,
        emails,
        identities,
        passkeys: summary.passkeys,
      };
    },
  });
}
