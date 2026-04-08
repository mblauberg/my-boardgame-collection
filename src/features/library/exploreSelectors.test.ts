import { selectForYou, selectNewReleases, selectTrendingNow } from "./exploreSelectors";
import type { ExploreCandidate, ExploreInput } from "./exploreSelectors";

function candidate(id: string, overrides: Partial<ExploreCandidate> = {}): ExploreCandidate {
  return {
    gameId: id,
    name: id,
    slug: id,
    tags: [],
    publishedYear: 2024,
    saveCountLast30Days: 0,
    saveCountAllTime: 0,
    averageRating: null,
    averageWeight: null,
    ...overrides,
  };
}

function makeInput(overrides: Partial<ExploreInput> = {}): ExploreInput {
  return {
    catalog: [],
    libraryEntries: [],
    savedGameIds: new Set<string>(),
    now: new Date("2026-04-08T00:00:00Z"),
    ...overrides,
  };
}

describe("exploreSelectors", () => {
  it("ranks explicit preference matches first and excludes already-saved games", () => {
    const input = makeInput({
      catalog: [
        candidate("root-like-match", { tags: ["engine"] }),
        candidate("already-owned", { tags: ["engine"] }),
        candidate("neutral", { tags: ["abstract"] }),
      ],
      libraryEntries: [
        {
          gameId: "seed-1",
          listType: "collection",
          sentiment: "like",
          tags: ["engine"],
        },
      ],
      savedGameIds: new Set(["already-owned"]),
    });

    expect(selectForYou(input)[0]?.gameId).toBe("root-like-match");
    expect(selectForYou(input)).not.toContainEqual(
      expect.objectContaining({ gameId: "already-owned" }),
    );
  });

  it("prefers 30-day save counts for trending with all-time fallback", () => {
    const ranked = selectTrendingNow([
      candidate("recent-hot", { saveCountLast30Days: 8, saveCountAllTime: 10 }),
      candidate("legacy-hit", { saveCountLast30Days: 0, saveCountAllTime: 20 }),
    ]);

    expect(ranked[0]?.gameId).toBe("recent-hot");
  });

  it("limits new releases to the current year and previous two years", () => {
    const ranked = selectNewReleases(
      [
        candidate("new-2026", { publishedYear: 2026 }),
        candidate("new-2024", { publishedYear: 2024 }),
        candidate("old-2022", { publishedYear: 2022 }),
      ],
      new Date("2026-04-08T00:00:00Z"),
    );

    expect(ranked.map((item) => item.gameId)).toEqual(["new-2026", "new-2024"]);
  });
});
