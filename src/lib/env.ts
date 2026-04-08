export type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

type EnvLike = Record<string, string | undefined>;

export function readPublicEnv(env: EnvLike = import.meta.env): PublicEnv {
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim();

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
  };
}

export function hasPublicEnv(env: EnvLike = import.meta.env) {
  return Boolean(env.VITE_SUPABASE_URL?.trim() && env.VITE_SUPABASE_ANON_KEY?.trim());
}
