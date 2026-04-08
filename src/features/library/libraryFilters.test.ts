import { filterLibraryEntries, moveEntryToCollection } from "./libraryFilters";
import type { LibraryEntry } from "./library.types";

function createEntry(
  id: string,
  listType: LibraryEntry["listType"],
  overrides: Partial<LibraryEntry> = {},
): LibraryEntry {
  return {
    id,
    userId: "user-1",
    gameId: `game-${id}`,
    listType,
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
  it("filters library entries by list type", () => {
    const entries = [
      createEntry("1", "collection"),
      createEntry("2", "collection"),
      createEntry("3", "wishlist"),
    ];

    expect(filterLibraryEntries(entries, { listType: "collection" })).toHaveLength(2);
  });

  it("moves a wishlist entry into the collection state", () => {
    expect(moveEntryToCollection(createEntry("3", "wishlist")).listType).toBe("collection");
  });
});
