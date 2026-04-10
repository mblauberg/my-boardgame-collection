import type { LibraryListType } from "./library.types";

export const libraryKeys = {
  all: ["library"] as const,
  library: (accountId?: string) => [...libraryKeys.all, "entries", accountId] as const,
  lists: (accountId?: string) => [...libraryKeys.all, "list", accountId] as const,
  list: (accountId: string | undefined, listType: LibraryListType) =>
    [...libraryKeys.lists(accountId), listType] as const,
  collection: (accountId?: string) => libraryKeys.list(accountId, "collection"),
  saved: (accountId?: string) => libraryKeys.list(accountId, "saved"),
  wishlist: (accountId?: string) => libraryKeys.list(accountId, "wishlist"),
  public: (username: string, listType: LibraryListType) =>
    [...libraryKeys.all, "public", username, listType] as const,
  profileSearch: (query: string) => [...libraryKeys.all, "profile-search", query] as const,
  explore: (scope?: string | readonly string[]) => [...libraryKeys.all, "explore", scope] as const,
  exploreSearch: (query: string) => [...libraryKeys.all, "explore-search", query] as const,
};
