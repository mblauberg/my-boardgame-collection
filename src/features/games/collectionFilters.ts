import type { Game, GameStatus } from "../../types/domain";

export type CollectionFilters = {
  search?: string;
  status?: GameStatus;
  tagSlugs?: string[];
  playersMin?: number;
  playersMax?: number;
  playTimeMin?: number;
  playTimeMax?: number;
  weightMin?: number;
  weightMax?: number;
};

export type SortOption = "name" | "rating" | "weight" | "year";
export type SortDirection = "asc" | "desc";

export function filterGames(games: Game[], filters: CollectionFilters): Game[] {
  return games.filter((game) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!game.name.toLowerCase().includes(searchLower)) return false;
    }

    if (filters.status && game.status !== filters.status) return false;

    if (filters.tagSlugs && filters.tagSlugs.length > 0) {
      const gameTags = game.tags.map((t) => t.slug);
      if (!filters.tagSlugs.some((slug) => gameTags.includes(slug))) return false;
    }

    if (filters.playersMin !== undefined && game.playersMax !== null) {
      if (game.playersMax < filters.playersMin) return false;
    }

    if (filters.playersMax !== undefined && game.playersMin !== null) {
      if (game.playersMin > filters.playersMax) return false;
    }

    if (filters.playTimeMin !== undefined && game.playTimeMax !== null) {
      if (game.playTimeMax < filters.playTimeMin) return false;
    }

    if (filters.playTimeMax !== undefined && game.playTimeMin !== null) {
      if (game.playTimeMin > filters.playTimeMax) return false;
    }

    if (filters.weightMin !== undefined && game.bggWeight !== null) {
      if (game.bggWeight < filters.weightMin) return false;
    }

    if (filters.weightMax !== undefined && game.bggWeight !== null) {
      if (game.bggWeight > filters.weightMax) return false;
    }

    return true;
  });
}

export function sortGames(
  games: Game[],
  sortBy: SortOption,
  direction: SortDirection
): Game[] {
  const sorted = [...games].sort((a, b) => {
    let aVal: number | string | null;
    let bVal: number | string | null;

    switch (sortBy) {
      case "name":
        aVal = a.name;
        bVal = b.name;
        break;
      case "rating":
        aVal = a.bggRating;
        bVal = b.bggRating;
        break;
      case "weight":
        aVal = a.bggWeight;
        bVal = b.bggWeight;
        break;
      case "year":
        aVal = a.publishedYear;
        bVal = b.publishedYear;
        break;
    }

    if (aVal === null) return 1;
    if (bVal === null) return -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  return sorted;
}
