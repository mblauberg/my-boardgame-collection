import type { LibraryEntry, LibrarySurface } from "./library.types";
import { compareValues } from "../../lib/utils/sorting";
import type { SortOption, SortDirection } from "../shared/filters";

export type LibraryFilters = {
  surface?: LibrarySurface;
  searchText?: string;
  sharedTagSlugs?: string[];
  userTagSlugs?: string[];
  playerCount?: number | null;
  playTime?: number | null;
  maxWeight?: number | null;
  playersMin?: number;
  playersMax?: number;
  playTimeMin?: number;
  playTimeMax?: number;
  weightMin?: number;
  weightMax?: number;
  isLoved?: boolean;
};

export function filterLibraryEntries(entries: LibraryEntry[], filters: LibraryFilters) {
  const searchText = filters.searchText?.trim().toLowerCase();

  return entries.filter((entry) => {
    if (filters.surface === "collection" && !entry.isInCollection) return false;
    if (filters.surface === "saved" && !entry.isSaved) return false;
    if (filters.isLoved && !entry.isLoved) return false;

    if (searchText) {
      const haystack = `${entry.game.name} ${entry.game.summary ?? ""}`.toLowerCase();
      if (!haystack.includes(searchText)) return false;
    }

    if (
      filters.sharedTagSlugs?.length &&
      !filters.sharedTagSlugs.every((slug) => entry.sharedTags.some((tag) => tag.slug === slug))
    ) {
      return false;
    }

    if (
      filters.userTagSlugs?.length &&
      !filters.userTagSlugs.every((slug) => entry.userTags.some((tag) => tag.slug === slug))
    ) {
      return false;
    }

    if (filters.playerCount != null) {
      const { playersMin, playersMax } = entry.game;
      if (
        playersMin != null &&
        playersMax != null &&
        (filters.playerCount < playersMin || filters.playerCount > playersMax)
      ) {
        return false;
      }
    }

    if (filters.playersMin != null || filters.playersMax != null) {
      const { playersMin, playersMax } = entry.game;
      if (playersMin != null && filters.playersMax != null && playersMin > filters.playersMax) return false;
      if (playersMax != null && filters.playersMin != null && playersMax < filters.playersMin) return false;
    }

    if (filters.playTime != null) {
      const { playTimeMin, playTimeMax } = entry.game;
      if (
        playTimeMin != null &&
        playTimeMax != null &&
        (filters.playTime < playTimeMin || filters.playTime > playTimeMax)
      ) {
        return false;
      }
    }

    if (filters.playTimeMin != null || filters.playTimeMax != null) {
      const { playTimeMin, playTimeMax } = entry.game;
      if (playTimeMin != null && filters.playTimeMax != null && playTimeMin > filters.playTimeMax) return false;
      if (playTimeMax != null && filters.playTimeMin != null && playTimeMax < filters.playTimeMin) return false;
    }

    if (filters.maxWeight != null && entry.game.bggWeight != null && entry.game.bggWeight > filters.maxWeight) {
      return false;
    }

    if (filters.weightMin != null || filters.weightMax != null) {
      const weight = entry.game.bggWeight;
      if (weight != null) {
        if (filters.weightMin != null && weight < filters.weightMin) return false;
        if (filters.weightMax != null && weight > filters.weightMax) return false;
      }
    }

    return true;
  });
}

export function moveEntryToCollection(entry: LibraryEntry): LibraryEntry {
  return {
    ...entry,
    isInCollection: true,
    listType: "collection",
  };
}

export function sortLibraryEntries(
  entries: LibraryEntry[],
  sortBy: SortOption,
  direction: SortDirection,
) {
  return [...entries].sort((left, right) => {
    switch (sortBy) {
      case "rank":
        return compareValues(left.game.bggRank ?? 999999, right.game.bggRank ?? 999999, direction);
      case "name":
        return compareValues(left.game.name, right.game.name, direction);
      case "rating":
        return compareValues(left.game.bggRating ?? -1, right.game.bggRating ?? -1, direction);
      case "weight":
        return compareValues(left.game.bggWeight ?? -1, right.game.bggWeight ?? -1, direction);
      case "year":
        return compareValues(left.game.publishedYear ?? -1, right.game.publishedYear ?? -1, direction);
      default:
        return 0;
    }
  });
}
