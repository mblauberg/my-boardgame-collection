import { describe, expect, it, vi } from "vitest";
import { createBggRefreshHandler } from "./bgg-refresh";

function makeRequest(token?: string, body: Record<string, unknown> = { gameId: "game-1" }) {
  return new Request("http://localhost/api/bgg-refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

function makeSupabase({
  user = { id: "user-1" },
  profile = { role: "owner" as const },
  game = { id: "game-1", bgg_id: 174430 },
} = {}) {
  const update = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  });

  const from = vi.fn((table: string) => {
    if (table === "profiles") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: profile, error: null }),
          }),
        }),
      };
    }

    if (table === "games") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: game, error: null }),
          }),
        }),
        update,
      };
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from,
    update,
  };
}

describe("createBggRefreshHandler", () => {
  it("rejects unauthenticated requests", async () => {
    const createSupabaseClient = vi.fn();
    const handler = createBggRefreshHandler({ createSupabaseClient });

    const response = await handler(makeRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Authentication required." });
    expect(createSupabaseClient).not.toHaveBeenCalled();
  });

  it("rejects authenticated users who are not owners", async () => {
    const supabase = makeSupabase({ profile: { role: "viewer" as const } });
    const fetchImpl = vi.fn();
    const handler = createBggRefreshHandler({
      createSupabaseClient: vi.fn().mockReturnValue(supabase),
      fetchImpl,
    });

    const response = await handler(makeRequest("owner-token"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Owner access required." });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns normalized metadata for a valid owner request", async () => {
    const supabase = makeSupabase();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        `<?xml version="1.0" encoding="utf-8"?>
        <items>
          <item type="boardgame" id="174430">
            <yearpublished value="2015" />
            <statistics>
              <ratings>
                <average value="8.19241" />
                <averageweight value="2.37654" />
              </ratings>
            </statistics>
          </item>
        </items>`,
        { status: 200, headers: { "Content-Type": "application/xml" } },
      ),
    );

    const handler = createBggRefreshHandler({
      createSupabaseClient: vi.fn().mockReturnValue(supabase),
      fetchImpl,
    });

    const response = await handler(makeRequest("owner-token"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      metadata: {
        bgg_id: 174430,
        bgg_url: "https://boardgamegeek.com/boardgame/174430",
        bgg_rating: 8.2,
        bgg_weight: 2.4,
        published_year: 2015,
      },
    });
    expect(supabase.update).toHaveBeenCalledWith({
      bgg_id: 174430,
      bgg_url: "https://boardgamegeek.com/boardgame/174430",
      bgg_rating: 8.2,
      bgg_weight: 2.4,
      published_year: 2015,
    });
  });
});
