import type { LibraryEntry, LibraryListType } from "./library.types";

export type LibraryFilters = {
  listType?: LibraryListType;
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
    if (filters.listType && entry.listType !== filters.listType) return false;

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
    listType: "collection",
  };
}
