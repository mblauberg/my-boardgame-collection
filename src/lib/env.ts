import {
  isSupportedOAuthProvider,
  supportedOAuthProviders,
  type SupportedOAuthProvider,
} from "./auth/oauthProviders";

export type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  enabledOAuthProviders: SupportedOAuthProvider[];
};

type EnvLike = Record<string, string | undefined>;

const DEFAULT_ENABLED_OAUTH_PROVIDERS: SupportedOAuthProvider[] = ["google", "discord", "github"];

function parseEnabledOAuthProviders(env: EnvLike): SupportedOAuthProvider[] {
  const rawProviders = env.VITE_AUTH_ENABLED_OAUTH_PROVIDERS;

  if (rawProviders === undefined) {
    return DEFAULT_ENABLED_OAUTH_PROVIDERS;
  }

  const providers = rawProviders
    .split(",")
    .map((provider) => provider.trim())
    .filter(Boolean);

  const invalidProviders = providers.filter((provider) => !isSupportedOAuthProvider(provider));
  if (invalidProviders.length > 0) {
    throw new Error(
      `Unsupported values in VITE_AUTH_ENABLED_OAUTH_PROVIDERS: ${invalidProviders.join(", ")}. Expected a comma-separated list of: ${supportedOAuthProviders.join(", ")}.`,
    );
  }

  return [...new Set(providers)] as SupportedOAuthProvider[];
}

export function readPublicEnv(env: EnvLike = import.meta.env): PublicEnv {
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim();
  const enabledOAuthProviders = parseEnabledOAuthProviders(env);

  const missing = [
    !supabaseUrl ? "VITE_SUPABASE_URL" : null,
    !supabaseAnonKey ? "VITE_SUPABASE_ANON_KEY" : null,
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing required public environment variables: ${missing.join(", ")}`);
  }

  return {
    supabaseUrl: supabaseUrl!,
    supabaseAnonKey: supabaseAnonKey!,
    enabledOAuthProviders,
  };
}

export function hasPublicEnv(env: EnvLike = import.meta.env) {
  return Boolean(env.VITE_SUPABASE_URL?.trim() && env.VITE_SUPABASE_ANON_KEY?.trim());
}
