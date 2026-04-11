export const supportedOAuthProviders = ["apple", "google", "discord", "github"] as const;

export type SupportedOAuthProvider = (typeof supportedOAuthProviders)[number];

const supportedOAuthProviderSet = new Set<string>(supportedOAuthProviders);

export function isSupportedOAuthProvider(value: string): value is SupportedOAuthProvider {
  return supportedOAuthProviderSet.has(value);
}
