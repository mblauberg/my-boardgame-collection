import { selectCollectionEntries, selectSavedEntries } from "./librarySelectors";
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

describe("librarySelectors", () => {
  it("returns saved entries from one unified library array", () => {
    const entries = [
      createEntry("1", { isSaved: true }),
      createEntry("2", { isInCollection: true }),
    ];

    expect(selectSavedEntries(entries).map((entry) => entry.id)).toEqual(["1"]);
  });

  it("returns collection entries from one unified library array", () => {
    const entries = [
      createEntry("1", { isSaved: true }),
      createEntry("2", { isInCollection: true }),
    ];

    expect(selectCollectionEntries(entries).map((entry) => entry.id)).toEqual(["2"]);
  });
});
