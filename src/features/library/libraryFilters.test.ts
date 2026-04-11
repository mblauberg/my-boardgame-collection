import { filterLibraryEntries, moveEntryToCollection } from "./libraryFilters";
import type { LibraryEntry } from "./library.types";

function createEntry(
  id: string,
  overrides: Partial<LibraryEntry> = {},
): LibraryEntry {
  return {
    id,
    userId: "user-1",
    gameId: `game-${id}`,
    isSaved: false,
    isLoved: false,
    isInCollection: false,
    sentiment: null,
    notes: null,
    priority: null,
    game: {
      id: `game-${id}`,
      name: `Game ${id}`,
      slug: `game-${id}`,
      bggId: null,
      bggUrl: null,
      status: "archived",
      buyPriority: null,
      bggRating: null,
      bggWeight: null,
      playersMin: 2,
      playersMax: 4,
      playTimeMin: 30,
      playTimeMax: 60,
      category: null,
      summary: null,
      notes: null,
      recommendationVerdict: null,
      recommendationColour: null,
      gapReason: null,
      isExpansionIncluded: false,
      imageUrl: null,
      publishedYear: null,
      hidden: false,
      createdAt: "",
      updatedAt: "",
      tags: [],
    },
    sharedTags: [],
    userTags: [],
    ...overrides,
  };
}

describe("libraryFilters", () => {
  it("filters collection entries by state", () => {
    const entries = [
      createEntry("1", { isInCollection: true }),
      createEntry("2", { isInCollection: true }),
      createEntry("3", { isSaved: true }),
    ];

    expect(filterLibraryEntries(entries, { surface: "collection" })).toHaveLength(2);
  });

  it("moves an entry into the collection state without clearing saved", () => {
    const moved = moveEntryToCollection(createEntry("3", { isSaved: true }));

    expect(moved.isInCollection).toBe(true);
    expect(moved.isSaved).toBe(true);
  });

  describe("single-value filters", () => {
    const entries = [
      createEntry("small", {
        game: { ...createEntry("small").game, playersMin: 1, playersMax: 2, playTimeMin: 15, playTimeMax: 30, bggWeight: 1.2 }
      } as any),
      createEntry("medium", {
        game: { ...createEntry("medium").game, playersMin: 2, playersMax: 5, playTimeMin: 60, playTimeMax: 120, bggWeight: 3.0 }
      } as any),
      createEntry("large", {
        game: { ...createEntry("large").game, playersMin: 5, playersMax: 10, playTimeMin: 180, playTimeMax: 300, bggWeight: 4.5 }
      } as any),
    ];

    it("filters by playerCount", () => {
      // 1 player should only find "small"
      expect(filterLibraryEntries(entries, { playerCount: 1 })).toHaveLength(1);
      expect(filterLibraryEntries(entries, { playerCount: 1 })[0].id).toBe("small");

      // 5 players should find "medium" and "large"
      expect(filterLibraryEntries(entries, { playerCount: 5 })).toHaveLength(2);

      // 8 players should only find "large"
      expect(filterLibraryEntries(entries, { playerCount: 8 })).toHaveLength(1);
      expect(filterLibraryEntries(entries, { playerCount: 8 })[0].id).toBe("large");
    });

    it("filters by playTime", () => {
      // 20 mins should find "small"
      expect(filterLibraryEntries(entries, { playTime: 20 })).toHaveLength(1);
      expect(filterLibraryEntries(entries, { playTime: 20 })[0].id).toBe("small");

      // 90 mins should find "medium"
      expect(filterLibraryEntries(entries, { playTime: 90 })).toHaveLength(1);
      expect(filterLibraryEntries(entries, { playTime: 90 })[0].id).toBe("medium");

      // 180 mins (3h+) should find "large"
      expect(filterLibraryEntries(entries, { playTime: 180 })).toHaveLength(1);
      expect(filterLibraryEntries(entries, { playTime: 180 })[0].id).toBe("large");
    });

    it("filters by weight with +-0.5 tolerance", () => {
      // Filter for weight 3.0 should find games in range [2.5, 3.5]
      expect(filterLibraryEntries(entries, { weight: 3.0 })).toHaveLength(1);
      expect(filterLibraryEntries(entries, { weight: 3.0 })[0].id).toBe("medium");

      // Filter for weight 1.5 should find games in range [1.0, 2.0]
      expect(filterLibraryEntries(entries, { weight: 1.5 })).toHaveLength(1);
      expect(filterLibraryEntries(entries, { weight: 1.5 })[0].id).toBe("small");

      // Filter for weight 4.2 should find "large" (4.5 is in [3.7, 4.7])
      expect(filterLibraryEntries(entries, { weight: 4.2 })).toHaveLength(1);
      expect(filterLibraryEntries(entries, { weight: 4.2 })[0].id).toBe("large");
    });
  });
});
