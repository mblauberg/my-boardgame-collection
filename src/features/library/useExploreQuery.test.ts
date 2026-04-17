import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFetchGamesCatalogExploreCandidateRows,
  mockFetchGamesCatalogRowsByIds,
  mockBuildExploreDaySeed,
  mockBuildExploreShelves,
} = vi.hoisted(() => ({
  mockFetchGamesCatalogExploreCandidateRows: vi.fn(),
  mockFetchGamesCatalogRowsByIds: vi.fn(),
  mockBuildExploreDaySeed: vi.fn(),
  mockBuildExploreShelves: vi.fn(),
}));

vi.mock("../games/gamesCatalog", async () => {
  const actual = await vi.importActual<typeof import("../games/gamesCatalog")>("../games/gamesCatalog");
  return {
    ...actual,
    fetchGamesCatalogExploreCandidateRows: mockFetchGamesCatalogExploreCandidateRows,
    fetchGamesCatalogRowsByIds: mockFetchGamesCatalogRowsByIds,
  };
});

vi.mock("./exploreRanking", async () => {
  const actual =
    await vi.importActual<typeof import("./exploreRanking")>("./exploreRanking");

  mockBuildExploreDaySeed.mockImplementation(actual.buildExploreDaySeed);
  mockBuildExploreShelves.mockImplementation(actual.buildExploreShelves);

  return {
    ...actual,
    buildExploreDaySeed: mockBuildExploreDaySeed,
    buildExploreShelves: mockBuildExploreShelves,
  };
});

import { fetchExploreData, resolveExplorePresets } from "./useExploreQuery";
import { libraryKeys } from "./libraryKeys";

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
    mockFetchGamesCatalogExploreCandidateRows.mockReset();
    mockFetchGamesCatalogRowsByIds.mockReset();
    mockBuildExploreDaySeed.mockClear();
    mockBuildExploreShelves.mockClear();
  });

  it("builds explore shelves from section-scoped candidate queries and hydrates only selected shelf games", async () => {
    mockFetchGamesCatalogExploreCandidateRows.mockResolvedValue([
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
    mockFetchGamesCatalogRowsByIds.mockResolvedValue([makeCatalogRow()]);

    const result = await fetchExploreData(["trending"]);

    expect(mockFetchGamesCatalogExploreCandidateRows).toHaveBeenCalledTimes(1);
    expect(mockFetchGamesCatalogRowsByIds).toHaveBeenCalledWith(["game-1", "game-2"]);
    expect(result.shelves).toHaveLength(1);
    expect(result.shelves[0]?.id).toBe("trending");
    expect(result.shelves[0]?.entries[0]?.name).toBe("Heat");
  });

  it("keeps cut catalog games eligible for explore shelves", async () => {
    const cutGame = makeCatalogRow({
      id: "game-cut",
      name: "Crokinole",
      slug: "crokinole",
      status: "cut",
      bgg_rating: 8.0,
      bgg_usersrated: 12000,
      play_time_max: 30,
    });
    mockFetchGamesCatalogExploreCandidateRows.mockResolvedValue([
      cutGame,
    ]);
    mockFetchGamesCatalogRowsByIds.mockResolvedValue([cutGame]);

    const result = await fetchExploreData(["quick-wins"]);

    expect(result.shelves[0]?.entries).toHaveLength(1);
    expect(result.shelves[0]?.entries[0]?.name).toBe("Crokinole");
  });

  it("hydrates multi-section shelves from the selected ids only", async () => {
    const engineGame = makeCatalogRow({
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
    });
    const deckGame = makeCatalogRow({
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
    });
    mockFetchGamesCatalogExploreCandidateRows.mockImplementation(async (section) => {
      if (section.id === "engine-building") return [engineGame];
      if (section.id === "deck-building") return [deckGame];
      return [];
    });
    mockFetchGamesCatalogRowsByIds.mockResolvedValue([engineGame, deckGame]);

    const result = await fetchExploreData(["by-mechanic"]);

    const mechanicSections = result.shelves[0]?.sections ?? [];

    expect(mockFetchGamesCatalogExploreCandidateRows).toHaveBeenCalled();
    expect(mockFetchGamesCatalogExploreCandidateRows).toHaveBeenCalledWith(
      expect.objectContaining({ id: "engine-building" }),
    );
    expect(mockFetchGamesCatalogExploreCandidateRows).toHaveBeenCalledWith(
      expect.objectContaining({ id: "deck-building" }),
    );
    expect(mockFetchGamesCatalogRowsByIds).toHaveBeenCalledWith(["game-deck", "game-engine"]);
    expect(mechanicSections.find((section) => section.id === "engine-building")?.games).toEqual([
      expect.objectContaining({ name: "Terraforming Mars" }),
    ]);
    expect(mechanicSections.find((section) => section.id === "deck-building")?.games).toEqual([
      expect.objectContaining({ name: "Dominion" }),
    ]);
  });

  it("applies exact scenario-rule matching so mechanic shelves do not collapse into the same results", async () => {
    mockFetchGamesCatalogExploreCandidateRows.mockImplementation(async (section) => {
      if (section.id === "engine-building") {
        return [
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
        ];
      }

      if (section.id === "deck-building") {
        return [
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
        ];
      }

      return [];
    });
    mockFetchGamesCatalogRowsByIds.mockResolvedValue([
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

  it("delegates shelf assembly to the ranking module with a UTC day seed", async () => {
    mockFetchGamesCatalogExploreCandidateRows.mockResolvedValue([makeCatalogRow()]);
    mockFetchGamesCatalogRowsByIds.mockResolvedValue([]);
    mockBuildExploreDaySeed.mockReturnValue("2026-04-12");
    mockBuildExploreShelves.mockReturnValue([
      {
        id: "trending",
        emoji: "🔥",
        label: "Trending Now",
        description: "Daily rotation",
        sections: [],
        entries: [],
      },
    ]);

    const result = await fetchExploreData(["trending"]);

    expect(mockFetchGamesCatalogExploreCandidateRows).toHaveBeenCalledTimes(1);
    expect(mockBuildExploreDaySeed).toHaveBeenCalledWith(expect.any(Date));
    expect(mockBuildExploreShelves).toHaveBeenCalledWith({
      games: [
        expect.objectContaining({
          id: "game-1",
          name: "Heat",
          tags: ["racing"],
        }),
      ],
      presets: expect.arrayContaining([expect.objectContaining({ id: "trending" })]),
      daySeed: "2026-04-12",
    });
    expect(result.shelves).toEqual([
      expect.objectContaining({
        id: "trending",
        title: "Trending Now",
      }),
    ]);
  });
});

describe("libraryKeys.explore", () => {
  it("scopes the explore query key by UTC day", () => {
    expect(libraryKeys.explore(["trending"], "2026-04-12")).toEqual([
      "library",
      "explore",
      ["trending"],
      "2026-04-12",
    ]);
  });
});
