import { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import type { SortDirection, SortOption } from "../shared/filters";
import type { LibraryFilters } from "./libraryFilters";

const DEPRECATED_RANGE_PARAM_KEYS = [
  "playersMin",
  "playersMax",
  "playTimeMin",
  "playTimeMax",
  "weightMin",
  "weightMax",
  "maxWeight",
] as const;

export function useLibraryFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const hasDeprecatedRangeParams = DEPRECATED_RANGE_PARAM_KEYS.some((paramKey) => searchParams.has(paramKey));

  const filters: LibraryFilters = {
    searchText: searchParams.get("search") || undefined,
    sharedTagSlugs: searchParams.get("sharedTags")?.split(",").filter(Boolean) || undefined,
    userTagSlugs: searchParams.get("userTags")?.split(",").filter(Boolean) || undefined,
    playerCount: searchParams.get("playerCount") ? Number(searchParams.get("playerCount")) : undefined,
    playTime: searchParams.get("playTime") ? Number(searchParams.get("playTime")) : undefined,
    weight: searchParams.get("weight") ? Number(searchParams.get("weight")) : undefined,
    isLoved: searchParams.get("loved") === "true" ? true : undefined,
  };

  const sortBy = (searchParams.get("sortBy") as SortOption) || "rank";
  const sortDirection = (searchParams.get("sortDir") as SortDirection) || "asc";

  useEffect(() => {
    if (!hasDeprecatedRangeParams) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    DEPRECATED_RANGE_PARAM_KEYS.forEach((paramKey) => {
      params.delete(paramKey);
    });
    setSearchParams(params, { replace: true, state: location.state });
  }, [hasDeprecatedRangeParams, location.state, searchParams, setSearchParams]);

  const updateFilters = (nextFilters: Partial<LibraryFilters>) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);

      DEPRECATED_RANGE_PARAM_KEYS.forEach((paramKey) => {
        params.delete(paramKey);
      });
      
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
    DEPRECATED_RANGE_PARAM_KEYS.forEach((paramKey) => {
      params.delete(paramKey);
    });
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
