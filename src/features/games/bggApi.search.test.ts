import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.fn();
const select = vi.fn();
const textSearch = vi.fn();
const order = vi.fn();
const limit = vi.fn();
const getSupabaseBrowserClient = vi.fn(() => ({
  from,
}));

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => getSupabaseBrowserClient(),
}));

import { searchBggGames } from "./bggApi";

describe("searchBggGames", () => {
  beforeEach(() => {
    limit.mockReset();
    order.mockReset();
    textSearch.mockReset();
    select.mockReset();
    from.mockReset();

    limit.mockResolvedValue({ data: [] });
    order.mockReturnValue({ limit });
    textSearch.mockReturnValue({ order });
    select.mockReturnValue({ textSearch });
    from.mockReturnValue({ select });
  });

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
    expect(results).toEqual({
      results: [{ id: 199792, name: "Everdell", yearPublished: 2018 }],
      source: {
        kind: "api",
        label: "Live BGG",
        updatedAt: null,
      },
    });
  });

  it("falls back to the offline catalog when the BGG token is unavailable", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Missing BGG application token." }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );

    limit.mockResolvedValue({
      data: [
        {
          bgg_id: 199792,
          name: "Everdell",
          published_year: 2018,
          bgg_url: "https://boardgamegeek.com/boardgame/199792/everdell",
          image_url: "https://example.com/everdell.jpg",
          players_min: 1,
          players_max: 4,
          play_time_min: 40,
          play_time_max: 80,
          bgg_rating: 8.1,
          bgg_weight: 2.8,
          summary: "Build a woodland city.",
          bgg_rank: 35,
          bgg_bayesaverage: 7.91,
          bgg_usersrated: 52311,
          is_expansion: false,
          bgg_data_updated_at: "2026-04-09T00:00:00.000Z",
        },
      ],
    });

    await expect(searchBggGames("Everdell", fetchImpl)).resolves.toEqual({
      results: [
        {
          id: 199792,
          name: "Everdell",
          yearPublished: 2018,
          bggUrl: "https://boardgamegeek.com/boardgame/199792/everdell",
          imageUrl: "https://example.com/everdell.jpg",
          playersMin: 1,
          playersMax: 4,
          playTimeMin: 40,
          playTimeMax: 80,
          averageRating: 8.1,
          averageWeight: 2.8,
          summary: "Build a woodland city.",
          bggRank: 35,
          bggBayesAverage: 7.91,
          bggUsersRated: 52311,
          isExpansion: false,
        },
      ],
      source: {
        kind: "snapshot",
        label: "Local BGG snapshot",
        updatedAt: "2026-04-09T00:00:00.000Z",
      },
    });
  });

  it("surfaces non-fallback proxy errors instead of silently masking them", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Unexpected upstream failure." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(searchBggGames("Everdell", fetchImpl)).rejects.toThrow(
      "Unexpected upstream failure.",
    );
  });
});
