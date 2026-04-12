export type GameFilters = {
  search?: string;
  tagSlugs?: string[];
  isLoved?: boolean;
  playerCount?: number;
  playTime?: number;
  weight?: number;
};

export type SortOption = "rank" | "rating" | "weight" | "year" | "name";
export type SortDirection = "asc" | "desc";
