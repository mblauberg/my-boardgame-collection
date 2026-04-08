import { describe, it, expect } from "vitest";
import { mapGameRecord, mapTag } from "./gameMappers";
import type { GameWithTags, TagRow } from "./games.types";

describe("gameMappers", () => {
  const tagFixture: TagRow = {
    id: "tag-1",
    name: "Racing",
    slug: "racing",
    tag_type: "theme",
    colour: "#ff0000",
    created_at: "2026-01-01T00:00:00Z",
  };

  const recordFixture: GameWithTags = {
    id: "game-1",
    name: "Heat",
    slug: "heat",
    bgg_id: 366013,
    bgg_url: "https://boardgamegeek.com/boardgame/366013/heat",
    status: "owned",
    buy_priority: null,
    bgg_rating: 8.1,
    bgg_weight: 2.5,
    players_min: 1,
    players_max: 6,
    play_time_min: 30,
    play_time_max: 60,
    category: "Racing",
    summary: "A racing game",
    notes: "Great game",
    recommendation_verdict: null,
    recommendation_colour: null,
    gap_reason: null,
    is_expansion_included: false,
    image_url: "https://example.com/heat.jpg",
    published_year: 2022,
    hidden: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    tags: [tagFixture],
  };

  it("maps a tag row to domain model", () => {
    const result = mapTag(tagFixture);
    expect(result.name).toBe("Racing");
    expect(result.slug).toBe("racing");
    expect(result.tagType).toBe("theme");
    expect(result.colour).toBe("#ff0000");
  });

  it("maps a Supabase game row with tags into the domain model", () => {
    const result = mapGameRecord(recordFixture);
    expect(result.name).toBe("Heat");
    expect(result.slug).toBe("heat");
    expect(result.bggRating).toBe(8.1);
    expect(result.tags).toHaveLength(1);
    expect(result.tags[0].slug).toBe("racing");
  });
});
