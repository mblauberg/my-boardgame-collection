import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AdvancedFilters } from "./AdvancedFilters";
import { ExpandableSearchSection } from "./ExpandableSearchSection";
import { QuickFilterPresets } from "./QuickFilterPresets";
import { PillSelector } from "../ui/PillSelector";
import type { LibraryFilters } from "../../features/library/libraryFilters";
import type { SortDirection, SortOption } from "../../features/shared/filters";
import { useDebouncedTextInput } from "../../lib/utils/useDebouncedTextInput";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";

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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { value: localSearch, setValue: setLocalSearch } = useDebouncedTextInput({
    value: filters.searchText ?? "",
    delay: 300,
    onDebouncedChange(searchText) {
      onFiltersChange({ searchText });
    },
  });

  const advancedFilterCount = useMemo(() => {
    let count = 0;
    if (filters.isLoved) count += 1;
    if (filters.playerCount != null) count += 1;
    if (filters.playTime != null) count += 1;
    if (filters.weight != null) count += 1;
    // Support legacy if counts are present but not the new ones
    if (filters.playerCount == null && (filters.playersMin != null || filters.playersMax != null)) count += 1;
    if (filters.playTime == null && (filters.playTimeMin != null || filters.playTimeMax != null)) count += 1;
    if (filters.weight == null && (filters.weightMin != null || filters.weightMax != null || filters.maxWeight != null)) count += 1;
    return count;
  }, [
    filters.isLoved,
    filters.playerCount,
    filters.playTime,
    filters.weight,
    filters.playersMin,
    filters.playersMax,
    filters.playTimeMin,
    filters.playTimeMax,
    filters.weightMin,
    filters.weightMax,
    filters.maxWeight,
  ]);

  return (
    <motion.div className="space-y-4" layout>
      <motion.div className="flex flex-wrap items-center gap-2" layout>
        {showSearch && (
          <ExpandableSearchSection
            id="library-search"
            value={localSearch}
            onChange={setLocalSearch}
            placeholder={searchPlaceholder}
            inputLabel="Search games"
            expandButtonLabel="Open search"
            sectionClassName="min-w-[240px] flex-1"
            containerClassName="relative flex items-center justify-end"
          />
        )}

        <button
          type="button"
          onClick={() => setIsAdvancedOpen((previous) => !previous)}
          aria-label={`Filters${advancedFilterCount > 0 ? ` (${advancedFilterCount})` : ""}`}
          className="glass-action-button group relative flex h-14 w-14 items-center justify-center rounded-full transition hover:border-primary/35"
        >
          <span className="material-symbols-outlined text-3xl text-on-surface transition group-hover:text-primary">
            tune
          </span>
          {advancedFilterCount > 0 && (
            <motion.span
              initial={prefersReducedMotion ? false : { scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={motionTokens.spring.soft}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary shadow-lg"
            >
              {advancedFilterCount}
            </motion.span>
          )}
        </button>
      </motion.div>
      {presets.length > 0 ? (
        <QuickFilterPresets presets={presets} onSelect={onFiltersChange} />
      ) : null}
      <motion.div
        data-testid="advanced-filters-container"
        className={`grid overflow-x-clip transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-top-right ${
          isAdvancedOpen
            ? "grid-rows-[1fr] opacity-100 scale-100 translate-y-0"
            : "grid-rows-[0fr] opacity-0 scale-95 -translate-y-4 pointer-events-none"
        }`}
        initial={false}
        animate={
          prefersReducedMotion
            ? { opacity: isAdvancedOpen ? 1 : 0 }
            : {
                opacity: isAdvancedOpen ? 1 : 0,
                y: isAdvancedOpen ? 0 : -10,
                scale: isAdvancedOpen ? 1 : 0.98,
              }
        }
        transition={{
          duration: motionTokens.duration.slow,
          ease: motionTokens.ease.emphasized,
        }}
      >
        <div className="overflow-hidden px-8 py-10 -mx-8 -my-10">
          <div className="glass-surface-panel mt-6 space-y-6 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50">
                Sort By
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <PillSelector
                  className="flex-1 md:flex-none"
                  options={SORT_OPTIONS.map((opt) => ({
                    ...opt,
                    icon:
                      opt.value === sortBy
                        ? sortDirection === "asc"
                          ? "arrow_upward"
                          : "arrow_downward"
                        : undefined,
                  }))}
                  activeValue={sortBy}
                  onChange={(value) => {
                    if (value === sortBy) {
                      onSortChange(sortBy, sortDirection === "asc" ? "desc" : "asc");
                    } else {
                      onSortChange(value, sortDirection);
                    }
                  }}
                />
              </div>
            </div>

            <div className="h-px bg-outline-variant/10" />

            <AdvancedFilters filters={filters} onChange={onFiltersChange} />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClearFilters}
                className="glass-action-button group flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary transition hover:text-primary"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                Reset all filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
