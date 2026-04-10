import { createClient } from "npm:@supabase/supabase-js@2";
import type { User } from "npm:@supabase/supabase-js@2";

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

function getAccessTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7);
}

export async function getAuthUserFromRequest(req: Request): Promise<User | null> {
  const token = getAccessTokenFromRequest(req);
  if (!token) {
    return null;
  }

  const supabase = getServiceClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getUserFromRequest(req: Request): Promise<string | null> {
  const user = await getAuthUserFromRequest(req);
  return user?.id ?? null;
}

export type AccountContext = {
  accountId: string;
  authUserId: string;
  primaryAuthUserId: string;
};

export async function resolveAccountContextForAuthUser(authUserId: string): Promise<AccountContext> {
  const supabase = getServiceClient();

  const { data: identityRows, error: identityError } = await supabase
    .from("account_identities")
    .select("account_id,last_seen_at")
    .eq("auth_user_id", authUserId)
    .order("last_seen_at", { ascending: false })
    .limit(1);

  if (identityError) {
    throw new Error(identityError.message);
  }

  let accountId = identityRows?.[0]?.account_id ?? authUserId;

  const { data: accountById, error: accountByIdError } = await supabase
    .from("accounts")
    .select("id,primary_auth_user_id")
    .eq("id", accountId)
    .maybeSingle();

  if (accountByIdError) {
    throw new Error(accountByIdError.message);
  }

  if (accountById) {
    return {
      accountId: accountById.id,
      authUserId,
      primaryAuthUserId: accountById.primary_auth_user_id,
    };
  }

  const { data: accountByPrimary, error: accountByPrimaryError } = await supabase
    .from("accounts")
    .select("id,primary_auth_user_id")
    .eq("primary_auth_user_id", authUserId)
    .maybeSingle();

  if (accountByPrimaryError) {
    throw new Error(accountByPrimaryError.message);
  }

  if (accountByPrimary) {
    accountId = accountByPrimary.id;
    return {
      accountId,
      authUserId,
      primaryAuthUserId: accountByPrimary.primary_auth_user_id,
    };
  }

  return {
    accountId: authUserId,
    authUserId,
    primaryAuthUserId: authUserId,
  };
}

export async function getAccountContextFromRequest(req: Request): Promise<AccountContext | null> {
  const authUser = await getAuthUserFromRequest(req);
  if (!authUser) {
    return null;
  }

  return resolveAccountContextForAuthUser(authUser.id);
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
