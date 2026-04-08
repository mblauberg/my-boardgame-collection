import type { BggMetadataPatch, BggThing } from "./bgg.types";

function roundToTenth(value: number | null) {
  if (value === null) return null;
  return Math.round(value * 10) / 10;
}

export function mapBggThingToGameMetadata(thing: BggThing): BggMetadataPatch {
  return {
    bgg_id: thing.id,
    bgg_url: `https://boardgamegeek.com/boardgame/${thing.id}`,
    bgg_rating: roundToTenth(thing.stats.averageRating),
    bgg_weight: roundToTenth(thing.stats.averageWeight),
    published_year: thing.yearPublished,
  };
}
