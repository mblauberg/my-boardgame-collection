import { describe, expect, it } from "vitest";
import { mapBggThingToGameMetadata } from "./bggMappers";
import type { BggThing } from "./bgg.types";

describe("bggMappers", () => {
  it("normalizes a remote BGG payload into safe game metadata fields", () => {
    const payload: BggThing = {
      id: 174430,
      imageUrl: null,
      stats: {
        averageRating: 8.19241,
        averageWeight: 2.37654,
      },
      yearPublished: 2015,
    };

    expect(mapBggThingToGameMetadata(payload)).toEqual({
      bgg_id: 174430,
      bgg_url: "https://boardgamegeek.com/boardgame/174430",
      bgg_rating: 8.2,
      bgg_weight: 2.4,
      published_year: 2015,
      image_url: null,
    });
  });
});
