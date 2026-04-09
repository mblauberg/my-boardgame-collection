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
};

export function filterLibraryEntries(entries: LibraryEntry[], filters: LibraryFilters) {
  const searchText = filters.searchText?.trim().toLowerCase();

  return entries.filter((entry) => {
    if (filters.surface === "collection" && !entry.isInCollection) return false;
    if (filters.surface === "saved" && !entry.isSaved) return false;

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

    if (filters.maxWeight != null && entry.game.bggWeight != null && entry.game.bggWeight > filters.maxWeight) {
      return false;
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
      case "name":
        return compareValues(left.game.name, right.game.name, direction);
      case "rating":
        return compareValues(left.game.bggRating ?? -1, right.game.bggRating ?? -1, direction);
      case "weight":
        return compareValues(left.game.bggWeight ?? -1, right.game.bggWeight ?? -1, direction);
      case "year":
        return compareValues(left.game.publishedYear ?? -1, right.game.publishedYear ?? -1, direction);
      case "priority":
        return compareValues(
          left.priority ?? Number.MAX_SAFE_INTEGER,
          right.priority ?? Number.MAX_SAFE_INTEGER,
          direction
        );
      default:
        return 0;
    }
  });
}
