type EnvReader = (name: string) => string | undefined;

const baseCorsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function readEnv(name: string): string | undefined {
  const maybeDeno = globalThis as {
    Deno?: {
      env?: {
        get(key: string): string | undefined;
      };
    };
  };

  return maybeDeno.Deno?.env?.get(name);
}

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch (_error) {
    return null;
  }
}

function getAllowedOrigins(env: EnvReader = readEnv): string[] {
  const siteOrigin = normalizeOrigin(env("SITE_URL"));
  const configuredOrigins = (env("CORS_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter((origin): origin is string => Boolean(origin));

  return [...new Set([siteOrigin, ...configuredOrigins].filter((origin): origin is string => Boolean(origin)))];
}

function resolveAllowedOrigin(req: Request, env: EnvReader = readEnv): string {
  const requestOrigin = normalizeOrigin(req.headers.get("Origin"));
  const allowedOrigins = getAllowedOrigins(env);

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0] ?? "null";
}

export function getCorsHeaders(
  req: Request,
  extraHeaders?: HeadersInit,
  env: EnvReader = readEnv,
): Headers {
  const headers = new Headers(baseCorsHeaders);
  headers.set("Access-Control-Allow-Origin", resolveAllowedOrigin(req, env));
  headers.append("Vary", "Origin");

  if (extraHeaders) {
    const extra = new Headers(extraHeaders);
    extra.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

export function handleCors(req: Request, env: EnvReader = readEnv): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req, undefined, env) });
  }

  return null;
}

export function requireMethod(
  req: Request,
  allowedMethods: string[],
  env: EnvReader = readEnv,
): Response | null {
  if (allowedMethods.includes(req.method)) {
    return null;
  }

  return Response.json(
    { error: "Method not allowed" },
    {
      status: 405,
      headers: getCorsHeaders(req, { Allow: allowedMethods.join(", ") }, env),
    },
  );
}
