import { describe, expect, it } from "vitest";
import { resolveExplorePresets, resolveMatchingGameIdsForRule } from "./useExploreQuery";

describe("resolveExplorePresets", () => {
  it("filters to the requested preset ids and excludes for-you", () => {
    const presets = resolveExplorePresets(["trending", "new-releases", "for-you"]);

    expect(presets.map((preset) => preset.id)).toEqual(["trending", "new-releases"]);
  });
});

describe("resolveMatchingGameIdsForRule", () => {
  it("reuses a shared tag index to apply any/all/exclude matching rules", () => {
    const tagSlugsByGameId = new Map<string, Set<string>>([
      ["game-1", new Set(["solo", "quick"])],
      ["game-2", new Set(["solo", "heavy"])],
      ["game-3", new Set(["party"])],
    ]);

    const matchingIds = resolveMatchingGameIdsForRule(
      {
        anyTags: ["solo"],
        allTags: ["quick"],
        excludeTags: ["heavy"],
      },
      tagSlugsByGameId,
    );

    expect(matchingIds).toEqual(["game-1"]);
  });
});
