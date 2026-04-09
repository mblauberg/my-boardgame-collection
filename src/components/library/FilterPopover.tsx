import { useState } from "react";
import type { SortDirection, SortOption } from "../../features/shared/filters";

type FilterPopoverProps = {
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortChange: (sortBy: SortOption, sortDirection: SortDirection) => void;
  onClear: () => void;
};

export function FilterPopover({
  sortBy,
  sortDirection,
  onSortChange,
  onClear,
}: FilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-colors ${
          isOpen
            ? "text-primary dark:text-dark-primary"
            : "text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-low dark:hover:bg-dark-surface-container-high"
        }`}
        aria-label="Filter options"
      >
        <span className="material-symbols-outlined">tune</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 min-w-[280px] rounded-xl bg-surface-bright/60 dark:bg-dark-surface-bright/60 backdrop-blur-[24px] p-6 shadow-[0_12px_40px_rgba(255,183,120,0.08)]">
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface dark:text-dark-on-surface mb-3">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as SortOption, sortDirection)}
                  className="w-full rounded-xl border-0 bg-surface-container-highest dark:bg-dark-surface-container-highest px-4 py-3 text-sm text-on-surface dark:text-dark-on-surface outline-none focus:ring-1 focus:ring-primary-container dark:focus:ring-dark-primary-container"
                >
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                  <option value="weight">Weight</option>
                  <option value="year">Year</option>
                  <option value="priority">Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.05em] text-on-surface dark:text-dark-on-surface mb-3">
                  Direction
                </label>
                <button
                  type="button"
                  onClick={() => onSortChange(sortBy, sortDirection === "asc" ? "desc" : "asc")}
                  className="w-full rounded-xl bg-surface-container-highest dark:bg-dark-surface-container-highest px-4 py-3 text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
                >
                  {sortDirection === "asc" ? "Ascending" : "Descending"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
                className="w-full rounded-xl bg-transparent border border-outline-variant/15 dark:border-dark-outline-variant/15 px-4 py-3 text-sm font-semibold text-on-surface-variant dark:text-dark-on-surface-variant hover:text-primary dark:hover:text-dark-primary transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
