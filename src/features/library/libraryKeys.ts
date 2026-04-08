import type { LibraryListType } from "./library.types";

export const libraryKeys = {
  all: ["library"] as const,
  lists: (userId?: string) => [...libraryKeys.all, "list", userId] as const,
  list: (userId: string | undefined, listType: LibraryListType) =>
    [...libraryKeys.lists(userId), listType] as const,
  collection: (userId?: string) => libraryKeys.list(userId, "collection"),
  wishlist: (userId?: string) => libraryKeys.list(userId, "wishlist"),
  public: (username: string, listType: LibraryListType) =>
    [...libraryKeys.all, "public", username, listType] as const,
  profileSearch: (query: string) => [...libraryKeys.all, "profile-search", query] as const,
  explore: (userId?: string) => [...libraryKeys.all, "explore", userId] as const,
};
