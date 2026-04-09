import { describe, expect, it } from "vitest";
import type { Game } from "../../types/domain";
import {
  GUEST_LIBRARY_USER_ID,
  clearGuestLibraryEntries,
  readGuestLibraryEntries,
  removeGuestLibraryEntry,
  upsertGuestLibraryEntry,
} from "./guestLibraryStorage";

const gameFixture: Game = {
  id: "game-1",
  name: "Heat",
  slug: "heat",
  bggId: 366013,
  bggUrl: "https://boardgamegeek.com/boardgame/366013/heat",
  status: "owned",
  buyPriority: null,
  bggRating: 8.1,
  bggWeight: 2.5,
  playersMin: 1,
  playersMax: 6,
  playTimeMin: 30,
  playTimeMax: 60,
  category: "Racing",
  summary: "A racing game about heat management",
  notes: null,
  recommendationVerdict: null,
  recommendationColour: null,
  gapReason: null,
  isExpansionIncluded: false,
  imageUrl: "https://example.com/heat.jpg",
  publishedYear: 2022,
  hidden: false,
  createdAt: "",
  updatedAt: "",
  tags: [{ id: "tag-1", name: "Racing", slug: "racing", tagType: "theme", colour: "#ff0000" }],
};

describe("guestLibraryStorage", () => {
  it("stores and reads guest saved state", () => {
    clearGuestLibraryEntries();

    upsertGuestLibraryEntry({
      game: gameFixture,
      isSaved: true,
      isLoved: false,
      isInCollection: false,
      sentiment: null,
      notes: null,
    });

    const entries = readGuestLibraryEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      userId: GUEST_LIBRARY_USER_ID,
      gameId: gameFixture.id,
      isSaved: true,
      isInCollection: false,
      listType: "saved",
    });
  });

  it("removes guest entries by game id", () => {
    clearGuestLibraryEntries();
    upsertGuestLibraryEntry({
      game: gameFixture,
      isSaved: true,
      isLoved: false,
      isInCollection: false,
      sentiment: null,
      notes: null,
    });

    removeGuestLibraryEntry(gameFixture.id);

    expect(readGuestLibraryEntries()).toHaveLength(0);
  });
});
