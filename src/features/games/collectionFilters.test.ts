import { describe, it, expect } from "vitest";
import { filterGames, sortGames } from "./collectionFilters";
import type { Game } from "../../types/domain";

describe("collectionFilters", () => {
  const games: Game[] = [
    {
      id: "1",
      name: "Heat",
      slug: "heat",
      status: "owned",
      bggRating: 8.1,
      bggWeight: 2.5,
      playersMin: 1,
      playersMax: 6,
      playTimeMin: 30,
      playTimeMax: 60,
      publishedYear: 2022,
      tags: [{ id: "t1", name: "Racing", slug: "racing", tagType: null, colour: null }],
      bggId: null,
      bggUrl: null,
      buyPriority: null,
      category: null,
      summary: null,
      notes: null,
      recommendationVerdict: null,
      recommendationColour: null,
      gapReason: null,
      isExpansionIncluded: false,
      imageUrl: null,
      hidden: false,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "2",
      name: "Ark Nova",
      slug: "ark-nova",
      status: "buy",
      bggRating: 8.5,
      bggWeight: 3.7,
      playersMin: 1,
      playersMax: 4,
      playTimeMin: 90,
      playTimeMax: 150,
      publishedYear: 2021,
      tags: [{ id: "t2", name: "Animals", slug: "animals", tagType: null, colour: null }],
      bggId: null,
      bggUrl: null,
      buyPriority: null,
      category: null,
      summary: null,
      notes: null,
      recommendationVerdict: null,
      recommendationColour: null,
      gapReason: null,
      isExpansionIncluded: false,
      imageUrl: null,
      hidden: false,
      createdAt: "",
      updatedAt: "",
    },
  ];

  describe("filterGames", () => {
    it("filters by search term", () => {
      const result = filterGames(games, { search: "heat" });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Heat");
    });

    it("filters by status", () => {
      const result = filterGames(games, { status: "buy" });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Ark Nova");
    });

    it("filters by tag slug", () => {
      const result = filterGames(games, { tagSlugs: ["racing"] });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Heat");
    });

    it("filters by player count range", () => {
      const result = filterGames(games, { playersMin: 5, playersMax: 6 });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Heat");
    });

    it("returns all games when no filters applied", () => {
      const result = filterGames(games, {});
      expect(result).toHaveLength(2);
    });
  });

  describe("sortGames", () => {
    it("sorts by name ascending", () => {
      const result = sortGames(games, "name", "asc");
      expect(result[0].name).toBe("Ark Nova");
      expect(result[1].name).toBe("Heat");
    });

    it("sorts by rating descending", () => {
      const result = sortGames(games, "rating", "desc");
      expect(result[0].name).toBe("Ark Nova");
      expect(result[1].name).toBe("Heat");
    });

    it("sorts by weight ascending", () => {
      const result = sortGames(games, "weight", "asc");
      expect(result[0].name).toBe("Heat");
      expect(result[1].name).toBe("Ark Nova");
    });
  });
});
