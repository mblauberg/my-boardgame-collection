export type GameFilters = {
  search?: string;
  tagSlugs?: string[];
  isLoved?: boolean;
  playersMin?: number;
  playersMax?: number;
  playTimeMin?: number;
  playTimeMax?: number;
  weightMin?: number;
  weightMax?: number;
};

export type SortOption = "rank" | "rating" | "weight" | "year" | "name";
export type SortDirection = "asc" | "desc";
