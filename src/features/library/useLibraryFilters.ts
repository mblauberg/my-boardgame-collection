import { useLocation, useSearchParams } from "react-router-dom";
import type { SortDirection, SortOption } from "../shared/filters";
import type { LibraryFilters } from "./libraryFilters";

export function useLibraryFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const filters: LibraryFilters = {
    searchText: searchParams.get("search") || undefined,
    sharedTagSlugs: searchParams.get("sharedTags")?.split(",").filter(Boolean) || undefined,
    userTagSlugs: searchParams.get("userTags")?.split(",").filter(Boolean) || undefined,
    playerCount: searchParams.get("playerCount") ? Number(searchParams.get("playerCount")) : undefined,
    playTime: searchParams.get("playTime") ? Number(searchParams.get("playTime")) : undefined,
    weight: searchParams.get("weight") ? Number(searchParams.get("weight")) : undefined,
    playersMin: searchParams.get("playersMin") ? Number(searchParams.get("playersMin")) : undefined,
    playersMax: searchParams.get("playersMax") ? Number(searchParams.get("playersMax")) : undefined,
    playTimeMin: searchParams.get("playTimeMin") ? Number(searchParams.get("playTimeMin")) : undefined,
    playTimeMax: searchParams.get("playTimeMax") ? Number(searchParams.get("playTimeMax")) : undefined,
    weightMin: searchParams.get("weightMin") ? Number(searchParams.get("weightMin")) : undefined,
    weightMax: searchParams.get("weightMax") ? Number(searchParams.get("weightMax")) : undefined,
    maxWeight: searchParams.get("maxWeight") ? Number(searchParams.get("maxWeight")) : undefined,
    isLoved: searchParams.get("loved") === "true" ? true : undefined,
  };

  const sortBy = (searchParams.get("sortBy") as SortOption) || "rank";
  const sortDirection = (searchParams.get("sortDir") as SortDirection) || "asc";

  const updateFilters = (nextFilters: Partial<LibraryFilters>) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      
      Object.entries(nextFilters).forEach(([key, value]) => {
        const paramKey = key === "searchText" ? "search" : key === "isLoved" ? "loved" : key;
        
        if (value === undefined || value === null || value === "") {
          params.delete(paramKey);
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            params.delete(paramKey);
          } else {
            params.set(paramKey, value.join(","));
          }
        } else {
          params.set(paramKey, String(value));
        }
      });
      
      return params;
    }, { replace: true, state: location.state });
  };

  const updateSort = (nextSortBy: SortOption, nextDirection: SortDirection) => {
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
