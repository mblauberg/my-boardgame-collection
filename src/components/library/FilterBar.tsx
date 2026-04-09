import { useEffect, useMemo, useRef, useState } from "react";
import { AdvancedFilters } from "./AdvancedFilters";
import type { LibraryFilters } from "../../features/library/libraryFilters";
import type { SortDirection, SortOption } from "../../features/shared/filters";

type FilterBarProps = {
  filters: LibraryFilters;
  sortBy: SortOption;
  sortDirection: SortDirection;
  onFiltersChange: (filters: Partial<LibraryFilters>) => void;
  onSortChange: (sortBy: SortOption, direction: SortDirection) => void;
  onClearFilters: () => void;
  presets?: Array<{ label: string; filters: Partial<LibraryFilters> }>;
  showSearch?: boolean;
  searchPlaceholder?: string;
};

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "rank", label: "Rank" },
  { value: "rating", label: "Rating" },
  { value: "weight", label: "Weight" },
  { value: "year", label: "Year" },
  { value: "name", label: "Name" },
];

export function FilterBar({
  filters,
  sortBy,
  sortDirection,
  onFiltersChange,
  onSortChange,
  onClearFilters,
  presets = [],
  showSearch = true,
  searchPlaceholder = "Search...",
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.searchText ?? "");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const isTypingRef = useRef(false);

  useEffect(() => {
    isTypingRef.current = true;
    const timer = setTimeout(() => {
      onFiltersChange({ searchText: localSearch });
      isTypingRef.current = false;
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  useEffect(() => {
    if (!isTypingRef.current && filters.searchText !== localSearch) {
      setLocalSearch(filters.searchText ?? "");
    }
  }, [filters.searchText, localSearch]);

  const advancedFilterCount = useMemo(() => {
    let count = 0;
    if (filters.isLoved) count += 1;
    if (filters.playersMin != null || filters.playersMax != null) count += 1;
    if (filters.playTimeMin != null || filters.playTimeMax != null) count += 1;
    if (filters.weightMin != null || filters.weightMax != null) count += 1;
    return count;
  }, [
    filters.isLoved,
    filters.playersMin,
    filters.playersMax,
    filters.playTimeMin,
    filters.playTimeMax,
    filters.weightMin,
    filters.weightMax,
  ]);

  const directionLabel = sortDirection === "asc" ? "ascending" : "descending";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {showSearch && (
          <div className="relative min-w-[240px] flex-1">
            <span
              aria-hidden="true"
              className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-lg text-on-surface-variant"
            >
              search
            </span>
            <label htmlFor="library-search" className="sr-only">
              Search games
            </label>
            <input
              id="library-search"
              aria-label="Search games"
              type="search"
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-full border border-outline-variant/20 bg-surface-container-low/70 py-3 pl-10 pr-4 text-base text-on-surface backdrop-blur-sm outline-none transition focus:border-primary-container focus:shadow-[0_0_10px_rgba(255,145,0,0.2)]"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsAdvancedOpen((previous) => !previous)}
          aria-label={`Filters${advancedFilterCount > 0 ? ` (${advancedFilterCount})` : ""}`}
          className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-low/70 backdrop-blur-sm transition hover:border-primary/30 hover:bg-surface-container-high/70 hover:shadow-[0_0_15px_rgba(255,145,0,0.15)]"
        >
          <span className="material-symbols-outlined text-xl text-on-surface transition group-hover:text-primary">
            tune
          </span>
          {advancedFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary shadow-lg">
              {advancedFilterCount}
            </span>
          )}
        </button>
      </div>

      {isAdvancedOpen && (
        <div className="space-y-4 rounded-2xl border border-outline-variant/15 bg-surface-container-low/50 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Sort"
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as SortOption, sortDirection)}
              className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-1.5 text-sm text-on-surface outline-none transition focus:border-primary/50"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              aria-label={`Sort direction ${directionLabel}`}
              onClick={() => onSortChange(sortBy, sortDirection === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-1.5 text-sm text-on-surface transition hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-base">
                {sortDirection === "asc" ? "arrow_upward" : "arrow_downward"}
              </span>
            </button>

            {presets.length > 0 && (
              <select
                defaultValue=""
                aria-label="Quick preset"
                onChange={(event) => {
                  const selected = presets.find((preset) => preset.label === event.target.value);
                  if (selected) {
                    onFiltersChange(selected.filters);
                  }
                  event.target.value = "";
                }}
                className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-1.5 text-sm text-on-surface outline-none transition focus:border-primary/50"
              >
                <option value="">Preset…</option>
                {presets.map((preset) => (
                  <option key={preset.label} value={preset.label}>
                    {preset.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <AdvancedFilters filters={filters} onChange={onFiltersChange} />

          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-semibold text-primary transition hover:opacity-70"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
