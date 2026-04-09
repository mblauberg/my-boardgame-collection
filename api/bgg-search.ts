import { z } from "zod";

const querySchema = z.object({
  query: z.string().trim().min(2, "Search query must be at least 2 characters."),
});

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

function buildBggSearchUrl(query: string) {
  return `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`;
}

function readBggApplicationToken(
  env: Record<string, string | undefined> =
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {},
) {
  const token = env.BGG_APPLICATION_TOKEN?.trim();

  if (!token) {
    throw new Error("Missing BGG application token.");
  }

  return token;
}

export function parseBggSearchResults(xml: string) {
  const items = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)];

  return items.flatMap((match) => {
    const itemXml = match[0];
    const id = itemXml.match(/<item\b[^>]*id="(\d+)"/i)?.[1];
    const name = itemXml.match(/<name\b[^>]*value="([^"]+)"/i)?.[1];
    const yearPublished = itemXml.match(/<yearpublished\b[^>]*value="(\d+)"/i)?.[1] ?? null;

    if (!id || !name) {
      return [];
    }

    return [
      {
        id: Number.parseInt(id, 10),
        name,
        yearPublished: yearPublished ? Number.parseInt(yearPublished, 10) : null,
      },
    ];
  });
}

/**
 * Creates a BGG search API handler that proxies requests to BoardGameGeek XML API
 * @param options - Configuration options
 * @param options.readToken - Function to read BGG application token from environment
 * @param options.fetchImpl - Fetch implementation for testing
 * @returns Request handler function
 */
export function createBggSearchHandler({
  fetchImpl = fetch,
  getToken = readBggApplicationToken,
}: {
  fetchImpl?: typeof fetch;
  getToken?: () => string;
} = {}) {
  return async function handleBggSearch(request: Request) {
    if (request.method !== "GET") {
      return json({ error: "Method not allowed." }, { status: 405 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({ query: searchParams.get("query") ?? "" });

    if (!parsed.success) {
      return json({ error: parsed.error.issues[0]?.message ?? "Invalid search query." }, { status: 400 });
    }

    let token: string;
    try {
      token = getToken();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Missing BGG application token.";
      return json({ error: message }, { status: 503 });
    }

    const response = await fetchImpl(buildBggSearchUrl(parsed.data.query), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return json({ error: `BGG search failed with status ${response.status}.` }, { status: 502 });
    }

    const xml = await response.text();
    return json({ results: parseBggSearchResults(xml) });
  };
}

const handleBggSearch = createBggSearchHandler();

export default handleBggSearch;
