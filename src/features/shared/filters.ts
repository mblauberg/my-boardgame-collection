export type GameFilters = {
  search?: string;
  tagSlugs?: string[];
  isLoved?: boolean;
  playerCount?: number;
  playTime?: number;
  weight?: number;
  // Deprecated range filters
  playersMin?: number;
  playersMax?: number;
  playTimeMin?: number;
  playTimeMax?: number;
  weightMin?: number;
  weightMax?: number;
};

export type SortOption = "rank" | "rating" | "weight" | "year" | "name";
export type SortDirection = "asc" | "desc";
