import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFetchGamesCatalogRows } = vi.hoisted(() => ({
  mockFetchGamesCatalogRows: vi.fn(),
}));

vi.mock("../games/gamesCatalog", async () => {
  const actual = await vi.importActual<typeof import("../games/gamesCatalog")>("../games/gamesCatalog");
  return {
    ...actual,
    fetchGamesCatalogRows: mockFetchGamesCatalogRows,
  };
});

import { fetchExploreData, resolveExplorePresets } from "./useExploreQuery";

function makeCatalogRow(overrides: Record<string, unknown> = {}) {
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
        colour: null,
        created_at: "2026-04-11T00:00:00Z",
        updated_at: "2026-04-11T00:00:00Z",
      },
    ],
    tag_slugs: ["racing"],
    ...overrides,
  };
}

describe("resolveExplorePresets", () => {
  it("filters to the requested preset ids and excludes for-you", () => {
    const presets = resolveExplorePresets(["trending", "new-releases", "for-you"]);

    expect(presets.map((preset) => preset.id)).toEqual(["trending", "new-releases"]);
  });
});

describe("fetchExploreData", () => {
  beforeEach(() => {
    mockFetchGamesCatalogRows.mockReset();
  });

  it("builds explore shelves from the shared games_catalog view in a single fetch", async () => {
    mockFetchGamesCatalogRows.mockResolvedValue([
      makeCatalogRow(),
      makeCatalogRow({
        id: "game-2",
        name: "Sky Team",
        slug: "sky-team",
        category: "Cooperative",
        tag_slugs: ["co-op"],
        tags: [
          {
            id: "tag-co-op",
            name: "Co-op",
            slug: "co-op",
            tag_type: "shared",
            colour: null,
            created_at: "2026-04-11T00:00:00Z",
            updated_at: "2026-04-11T00:00:00Z",
          },
        ],
      }),
    ]);

    const result = await fetchExploreData(["trending"]);

    expect(mockFetchGamesCatalogRows).toHaveBeenCalledTimes(1);
    expect(result.shelves).toHaveLength(1);
    expect(result.shelves[0]?.id).toBe("trending");
    expect(result.shelves[0]?.entries[0]?.name).toBe("Heat");
  });

  it("keeps cut catalog games eligible for explore shelves", async () => {
    mockFetchGamesCatalogRows.mockResolvedValue([
      makeCatalogRow({
        id: "game-cut",
        name: "Crokinole",
        slug: "crokinole",
        status: "cut",
        bgg_rating: 8.0,
        bgg_usersrated: 12000,
        play_time_max: 30,
      }),
    ]);

    const result = await fetchExploreData(["quick-wins"]);

    expect(result.shelves[0]?.entries).toHaveLength(1);
    expect(result.shelves[0]?.entries[0]?.name).toBe("Crokinole");
  });

  it("applies exact scenario-rule matching so mechanic shelves do not collapse into the same results", async () => {
    mockFetchGamesCatalogRows.mockResolvedValue([
      makeCatalogRow({
        id: "game-engine",
        name: "Terraforming Mars",
        slug: "terraforming-mars",
        tags: [
          {
            id: "tag-engine",
            name: "Engine Building",
            slug: "engine-building",
            tag_type: "shared",
            colour: null,
            created_at: "2026-04-11T00:00:00Z",
            updated_at: "2026-04-11T00:00:00Z",
          },
        ],
        tag_slugs: ["engine-building"],
      }),
      makeCatalogRow({
        id: "game-deck",
        name: "Dominion",
        slug: "dominion",
        tags: [
          {
            id: "tag-deck",
            name: "Deck Building",
            slug: "deck-building",
            tag_type: "shared",
            colour: null,
            created_at: "2026-04-11T00:00:00Z",
            updated_at: "2026-04-11T00:00:00Z",
          },
        ],
        tag_slugs: ["deck-building"],
      }),
    ]);

    const result = await fetchExploreData(["by-mechanic"]);
    const mechanicSections = result.shelves[0]?.sections ?? [];

    expect(mechanicSections.find((section) => section.id === "engine-building")?.games).toEqual([
      expect.objectContaining({ name: "Terraforming Mars" }),
    ]);
    expect(mechanicSections.find((section) => section.id === "deck-building")?.games).toEqual([
      expect.objectContaining({ name: "Dominion" }),
    ]);
  });
});
