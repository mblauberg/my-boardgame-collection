import { createClient } from "npm:@supabase/supabase-js@2";

function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function getServiceClient() {
  return createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export async function getUserFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  const supabase = getServiceClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user.id;
}

export function getSiteUrl(): string {
  return requireEnv("SITE_URL");
}

function normalizeOrigin(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch (_error) {
    return null;
  }
}

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function getExpectedOrigin(req: Request): string {
  const siteOrigin = new URL(getSiteUrl()).origin;
  const requestOrigin = normalizeOrigin(req.headers.get("Origin"));
  if (!requestOrigin) return siteOrigin;

  const requestHostname = new URL(requestOrigin).hostname;
  const siteHostname = new URL(siteOrigin).hostname;
  if (requestHostname === siteHostname || isLocalhost(requestHostname)) {
    return requestOrigin;
  }

  return siteOrigin;
}

export function getRpIdForRequest(req: Request): string {
  return new URL(getExpectedOrigin(req)).hostname;
}
