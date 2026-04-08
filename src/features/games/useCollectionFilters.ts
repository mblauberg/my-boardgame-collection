import { useSearchParams } from "react-router-dom";
import type { CollectionFilters, SortOption, SortDirection } from "./collectionFilters";
import type { GameStatus } from "../../types/domain";

export function useCollectionFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: CollectionFilters = {
    search: searchParams.get("search") || undefined,
    status: (searchParams.get("status") as GameStatus) || undefined,
    tagSlugs: searchParams.get("tags")?.split(",").filter(Boolean) || undefined,
    playersMin: searchParams.get("playersMin")
      ? Number(searchParams.get("playersMin"))
      : undefined,
    playersMax: searchParams.get("playersMax")
      ? Number(searchParams.get("playersMax"))
      : undefined,
    playTimeMin: searchParams.get("playTimeMin")
      ? Number(searchParams.get("playTimeMin"))
      : undefined,
    playTimeMax: searchParams.get("playTimeMax")
      ? Number(searchParams.get("playTimeMax"))
      : undefined,
    weightMin: searchParams.get("weightMin")
      ? Number(searchParams.get("weightMin"))
      : undefined,
    weightMax: searchParams.get("weightMax")
      ? Number(searchParams.get("weightMax"))
      : undefined,
  };

  const sortBy = (searchParams.get("sortBy") as SortOption) || "name";
  const sortDirection = (searchParams.get("sortDir") as SortDirection) || "asc";

  const updateFilters = (newFilters: Partial<CollectionFilters>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
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

  const updateSort = (newSortBy: SortOption, newDirection: SortDirection) => {
    const params = new URLSearchParams(searchParams);
    params.set("sortBy", newSortBy);
    params.set("sortDir", newDirection);
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
