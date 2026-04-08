import type { GameRow } from "./games.types";

export type BggThing = {
  id: number;
  yearPublished: number | null;
  stats: {
    averageRating: number | null;
    averageWeight: number | null;
  };
};

export type BggMetadataPatch = Pick<
  GameRow,
  "bgg_id" | "bgg_url" | "bgg_rating" | "bgg_weight" | "published_year"
>;
