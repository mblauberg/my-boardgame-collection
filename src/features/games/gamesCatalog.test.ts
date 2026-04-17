import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRange = vi.fn();
const mockOrder = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

import { fetchGamesCatalogRows } from "./gamesCatalog";

function makeCatalogRow(id: string) {
  return {
    id,
    name: `Game ${id}`,
    slug: `game-${id}`,
    bgg_id: null,
    bgg_url: null,
    status: "owned",
    buy_priority: null,
    bgg_rating: 7.5,
    bgg_weight: 2.5,
    bgg_rank: 100,
    bgg_bayesaverage: null,
    bgg_usersrated: 1000,
    is_expansion: false,
    abstracts_rank: null,
    cgs_rank: null,
    childrensgames_rank: null,
    familygames_rank: null,
    partygames_rank: null,
    strategygames_rank: null,
    thematic_rank: null,
    wargames_rank: null,
    bgg_data_source: null,
    bgg_data_updated_at: null,
    bgg_snapshot_payload: null,
    players_min: 2,
    players_max: 4,
    play_time_min: 30,
    play_time_max: 60,
    category: "Strategy",
    summary: null,
    notes: null,
    recommendation_verdict: null,
    recommendation_colour: null,
    gap_reason: null,
    is_expansion_included: false,
    image_url: null,
    published_year: 2024,
    hidden: false,
    created_at: "2026-04-11T00:00:00Z",
    updated_at: "2026-04-11T00:00:00Z",
    tags: [],
    tag_slugs: [],
  };
}

describe("fetchGamesCatalogRows", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockSelect.mockReset();
    mockOrder.mockReset();
    mockRange.mockReset();

    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ range: mockRange });
  });

  it("paginates through the full games_catalog view instead of stopping at the first API page", async () => {
    mockRange
      .mockResolvedValueOnce({
        data: [makeCatalogRow("game-1"), makeCatalogRow("game-2")],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [makeCatalogRow("game-3")],
        error: null,
      });

    const rows = await fetchGamesCatalogRows({ pageSize: 2 });

    expect(rows.map((row) => row.id)).toEqual(["game-1", "game-2", "game-3"]);
    expect(mockFrom).toHaveBeenCalledWith("games_catalog");
    expect(mockOrder).toHaveBeenCalledWith("id");
    expect(mockRange).toHaveBeenNthCalledWith(1, 0, 1);
    expect(mockRange).toHaveBeenNthCalledWith(2, 2, 3);
  });
});
