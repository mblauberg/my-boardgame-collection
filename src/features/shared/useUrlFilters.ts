import { useSearchParams } from "react-router-dom";
import type { SortDirection } from "./filters";

type UrlFilterConfig<T extends Record<string, unknown>> = {
  defaultSort: { sortBy: string; direction: SortDirection };
  parseFilters: (searchParams: URLSearchParams) => T;
};

export function useUrlFilters<T extends Record<string, unknown>, S extends string>(
  config: UrlFilterConfig<T>
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = config.parseFilters(searchParams);
  const sortBy = (searchParams.get("sortBy") as S) || (config.defaultSort.sortBy as S);
  const sortDirection = (searchParams.get("sortDir") as SortDirection) || config.defaultSort.direction;

  const updateFilters = (nextFilters: Partial<T>) => {
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

  const updateSort = (nextSortBy: S, nextDirection: SortDirection) => {
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
