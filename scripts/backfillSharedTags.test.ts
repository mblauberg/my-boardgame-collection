import { describe, expect, it } from "vitest";
import { buildSharedTagBackfill } from "./backfillSharedTags";

describe("buildSharedTagBackfill", () => {
  it("creates tags and joins from available game metadata", () => {
    const result = buildSharedTagBackfill([
      {
        id: "game-1",
        category: "Engine Building Co-op",
        players_min: 1,
        players_max: 4,
        play_time_min: 45,
        play_time_max: 60,
        bgg_weight: 2.3,
      },
      {
        id: "game-2",
        category: "Word Party",
        players_min: 5,
        players_max: 8,
        play_time_min: 15,
        play_time_max: 20,
        bgg_weight: 1.4,
      },
    ]);

    expect(result.tags.map((tag) => tag.slug)).toEqual(
      expect.arrayContaining([
        "solo",
        "co-op",
        "engine-building",
        "main-event",
        "medium-weight",
        "party",
        "word",
        "filler",
        "quick",
        "light",
      ]),
    );

    expect(result.gameTags).toEqual(
      expect.arrayContaining([
        { game_id: "game-1", tag_slug: "solo" },
        { game_id: "game-1", tag_slug: "co-op" },
        { game_id: "game-1", tag_slug: "engine-building" },
        { game_id: "game-2", tag_slug: "party" },
        { game_id: "game-2", tag_slug: "word" },
      ]),
    );
  });
});
