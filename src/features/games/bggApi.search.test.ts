import { describe, expect, it, vi } from "vitest";
import { searchBggGames } from "./bggApi";

describe("searchBggGames", () => {
  it("calls the local API proxy and returns parsed JSON results", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [{ id: 199792, name: "Everdell", yearPublished: 2018 }],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const results = await searchBggGames("Everdell", fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith("/api/bgg-search?query=Everdell");
    expect(results).toEqual([{ id: 199792, name: "Everdell", yearPublished: 2018 }]);
  });

  it("surfaces the API error message when the proxy rejects the request", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Missing BGG application token." }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(searchBggGames("Everdell", fetchImpl)).rejects.toThrow(
      "Missing BGG application token.",
    );
  });
});
