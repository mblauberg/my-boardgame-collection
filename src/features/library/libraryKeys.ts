import type { LibraryListType } from "./library.types";

export const libraryKeys = {
  all: ["library"] as const,
  library: (userId?: string) => [...libraryKeys.all, "entries", userId] as const,
  lists: (userId?: string) => [...libraryKeys.all, "list", userId] as const,
  list: (userId: string | undefined, listType: LibraryListType) =>
    [...libraryKeys.lists(userId), listType] as const,
  collection: (userId?: string) => libraryKeys.list(userId, "collection"),
  saved: (userId?: string) => libraryKeys.list(userId, "saved"),
  public: (username: string, listType: LibraryListType) =>
    [...libraryKeys.all, "public", username, listType] as const,
  profileSearch: (query: string) => [...libraryKeys.all, "profile-search", query] as const,
  explore: (presetIds?: readonly string[]) =>
    [...libraryKeys.all, "explore", ...(presetIds?.length ? presetIds : ["all"])] as const,
  exploreSearch: (query: string) => [...libraryKeys.all, "explore-search", query] as const,
};
