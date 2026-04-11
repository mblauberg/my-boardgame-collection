import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLimit = vi.fn();
const mockOrder = vi.fn();
const mockIlike = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

import { searchGames } from "./useExploreSearch";

function makeCatalogRow(overrides: Record<string, unknown>) {
  return {
    id: "game-1",
    name: "Heat",
    slug: "heat",
    bgg_id: null,
    bgg_url: null,
    status: "owned",
    buy_priority: null,
    bgg_rating: 7.9,
    bgg_weight: 2.2,
    bgg_rank: 50,
    bgg_bayesaverage: null,
    bgg_usersrated: 12000,
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
    players_min: 1,
    players_max: 6,
    play_time_min: 30,
    play_time_max: 60,
    category: "Racing",
    summary: null,
    notes: null,
    recommendation_verdict: null,
    recommendation_colour: null,
    gap_reason: null,
    is_expansion_included: false,
    image_url: null,
    published_year: 2023,
    hidden: false,
    created_at: "2026-04-11T00:00:00Z",
    updated_at: "2026-04-11T00:00:00Z",
    tags: [
      {
        id: "tag-racing",
        name: "Racing",
        slug: "racing",
        tag_type: "shared",
        colour: "#f00",
        created_at: "2026-04-11T00:00:00Z",
        updated_at: "2026-04-11T00:00:00Z",
      },
    ],
    tag_slugs: ["racing"],
    ...overrides,
  };
}

describe("searchGames", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    mockSelect.mockReset();
    mockEq.mockReset();
    mockIlike.mockReset();
    mockOrder.mockReset();
    mockLimit.mockReset();

    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ ilike: mockIlike });
    mockIlike.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });
  });

  it("searches the shared catalog read model without a second tag fetch", async () => {
    mockLimit.mockResolvedValue({
      data: [makeCatalogRow({ name: "Heat: Pedal to the Metal" })],
      error: null,
    });

    const results = await searchGames("Heat");

    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith("games_catalog");
    expect(mockEq).toHaveBeenCalledWith("hidden", false);
    expect(mockIlike).toHaveBeenCalledWith("name", "%Heat%");
    expect(results[0]?.tags[0]?.slug).toBe("racing");
  });
});
