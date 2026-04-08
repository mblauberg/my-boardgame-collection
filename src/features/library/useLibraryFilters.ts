import { useSearchParams } from "react-router-dom";
import type {
  LibraryFilters,
  LibrarySortDirection,
  LibrarySortOption,
} from "./libraryFilters";

export function useLibraryFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: LibraryFilters = {
    searchText: searchParams.get("search") || undefined,
    sharedTagSlugs: searchParams.get("sharedTags")?.split(",").filter(Boolean) || undefined,
    userTagSlugs: searchParams.get("userTags")?.split(",").filter(Boolean) || undefined,
    playerCount: searchParams.get("players") ? Number(searchParams.get("players")) : undefined,
    playTime: searchParams.get("playTime") ? Number(searchParams.get("playTime")) : undefined,
    maxWeight: searchParams.get("maxWeight") ? Number(searchParams.get("maxWeight")) : undefined,
  };

  const sortBy = (searchParams.get("sortBy") as LibrarySortOption) || "name";
  const sortDirection = (searchParams.get("sortDir") as LibrarySortDirection) || "asc";

  const updateFilters = (nextFilters: Partial<LibraryFilters>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          params.delete(key);
        } else {
          params.set(key, value.join(","));
        }
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  };

  const updateSort = (nextSortBy: LibrarySortOption, nextDirection: LibrarySortDirection) => {
    const params = new URLSearchParams(searchParams);
    params.set("sortBy", nextSortBy);
    params.set("sortDir", nextDirection);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return {
    filters,
    sortBy,
    sortDirection,
    updateFilters,
    updateSort,
    clearFilters,
  };
}
