import { describe, expect, it } from "vitest";
import { resolveExplorePresets } from "./useExploreQuery";

describe("resolveExplorePresets", () => {
  it("filters to the requested preset ids and excludes for-you", () => {
    const presets = resolveExplorePresets(["trending", "new-releases", "for-you"]);

    expect(presets.map((preset) => preset.id)).toEqual(["trending", "new-releases"]);
  });
});
