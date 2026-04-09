import { useState, useEffect } from "react";
import { FilterChip } from "./FilterChip";
import { SegmentedControl } from "./SegmentedControl";
import { AdvancedFilters } from "./AdvancedFilters";
import { QuickFilterPresets } from "./QuickFilterPresets";
import type { LibraryFilters } from "../../features/library/libraryFilters";
import type { SortOption, SortDirection } from "../../features/shared/filters";

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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ searchText: localSearch });
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Sync with external changes
  useEffect(() => {
    if (filters.searchText !== localSearch) {
      setLocalSearch(filters.searchText ?? "");
    }
  }, [filters.searchText]);

  const activeFilters: Array<{ label: string; key: string }> = [];

  if (filters.isLoved) {
    activeFilters.push({ label: "Loved", key: "loved" });
  }

  if (filters.playersMin || filters.playersMax) {
    const min = filters.playersMin ?? "";
    const max = filters.playersMax ?? "";
    activeFilters.push({
      label: `${min}${min && max ? "-" : ""}${max} Players`,
      key: "players",
    });
  }

  if (filters.playTimeMin || filters.playTimeMax) {
    const min = filters.playTimeMin ?? "";
    const max = filters.playTimeMax ?? "";
    activeFilters.push({
      label: `${min}${min && max ? "-" : ""}${max} min`,
      key: "playTime",
    });
  }

  if (filters.weightMin || filters.weightMax) {
    const min = filters.weightMin ?? "";
    const max = filters.weightMax ?? "";
    activeFilters.push({
      label: `Weight ${min}${min && max ? "-" : ""}${max}`,
      key: "weight",
    });
  }

  const handleRemoveFilter = (key: string) => {
    switch (key) {
      case "loved":
        onFiltersChange({ isLoved: undefined });
        break;
      case "players":
        onFiltersChange({ playersMin: undefined, playersMax: undefined });
        break;
      case "playTime":
        onFiltersChange({ playTimeMin: undefined, playTimeMax: undefined });
        break;
      case "weight":
        onFiltersChange({ weightMin: undefined, weightMax: undefined });
        break;
    }
  };

  return (
    <div className="space-y-4 rounded-xl bg-surface-container-low p-6 dark:bg-[#1c1b1b]">
      {/* Search and Presets Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {showSearch && (
          <input
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full sm:flex-1 sm:min-w-[200px] rounded-full border border-outline-variant/15 bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary-container focus:shadow-[0_0_12px_rgba(255,145,0,0.2)] dark:bg-surface-container-lowest dark:text-on-surface"
          />
        )}

        {presets.length > 0 && (
          <QuickFilterPresets
            presets={presets}
            onSelect={(presetFilters) => onFiltersChange(presetFilters)}
          />
        )}
      </div>

      {/* Active Filters and Clear */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant dark:text-on-surface-variant">
            Active:
          </span>
          {activeFilters.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              onRemove={() => handleRemoveFilter(filter.key)}
            />
          ))}
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-semibold text-on-surface-variant transition-colors hover:text-primary dark:text-on-surface-variant"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Sort and Advanced Filters Row */}
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex-1 min-w-[300px]">
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.05em] text-on-surface dark:text-on-surface">
            Sort By
          </label>
          <SegmentedControl
            value={sortBy}
            direction={sortDirection}
            onChange={onSortChange}
          />
        </div>

        <div className="flex-1 min-w-[240px]">
          <AdvancedFilters filters={filters} onChange={onFiltersChange} />
        </div>
      </div>
    </div>
  );
}
