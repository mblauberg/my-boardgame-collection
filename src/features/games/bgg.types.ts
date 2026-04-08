import type { GameRow } from "./games.types";

export type BggThing = {
  id: number;
  yearPublished: number | null;
  imageUrl?: string | null;
  stats: {
    averageRating: number | null;
    averageWeight: number | null;
  };
};

export type BggSearchResult = {
  id: number;
  name: string;
  yearPublished: number | null;
};

export type BggMetadataPatch = Pick<
  GameRow,
  "bgg_id" | "bgg_url" | "bgg_rating" | "bgg_weight" | "published_year" | "image_url"
>;
