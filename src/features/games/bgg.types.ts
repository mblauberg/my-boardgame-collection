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
  bggUrl?: string | null;
  imageUrl?: string | null;
  playersMin?: number | null;
  playersMax?: number | null;
  playTimeMin?: number | null;
  playTimeMax?: number | null;
  averageRating?: number | null;
  averageWeight?: number | null;
  summary?: string | null;
  bggRank?: number | null;
  bggBayesAverage?: number | null;
  bggUsersRated?: number | null;
  isExpansion?: boolean | null;
};

export type BggSearchSource = {
  kind: "api" | "snapshot";
  label: string;
  updatedAt: string | null;
};

export type BggSearchResponse = {
  results: BggSearchResult[];
  source: BggSearchSource;
};

export type BggMetadataPatch = Pick<
  GameRow,
  "bgg_id" | "bgg_url" | "bgg_rating" | "bgg_weight" | "published_year" | "image_url"
>;
