export type GameFilters = {
  search?: string;
  tagSlugs?: string[];
  playersMin?: number;
  playersMax?: number;
  playTimeMin?: number;
  playTimeMax?: number;
  weightMin?: number;
  weightMax?: number;
};

export type SortOption = "name" | "rating" | "weight" | "year" | "priority";
export type SortDirection = "asc" | "desc";
