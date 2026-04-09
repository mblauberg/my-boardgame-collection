import { useState } from "react";
import type { GameFilters } from "../../features/shared/filters";

type AdvancedFiltersProps = {
  filters: GameFilters;
  onChange: (filters: Partial<GameFilters>) => void;
};

export function AdvancedFilters({ filters, onChange }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary dark:text-on-surface-variant"
      >
        <span className="material-symbols-outlined text-base">
          {isExpanded ? "expand_less" : "expand_more"}
        </span>
        More Filters
      </button>

      {isExpanded && (
        <div className="space-y-6 rounded-xl bg-surface-container-lowest p-6 dark:bg-[#0e0e0e]">
          {/* Loved Filter */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isLoved ?? false}
                onChange={(e) => onChange({ isLoved: e.target.checked || undefined })}
                className="h-5 w-5 rounded border-outline-variant/15 bg-surface-container-highest text-primary focus:ring-2 focus:ring-primary-container dark:bg-surface-container-highest"
              />
              <span className="text-sm font-semibold text-on-surface dark:text-on-surface">
                Loved Only
              </span>
            </label>
          </div>

          {/* Player Count */}
          <div>
            <label className="mb-3 block text-xs font-bold uppercase tracking-[0.05em] text-on-surface dark:text-on-surface">
              Player Count
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max="20"
                value={filters.playersMin ?? ""}
                onChange={(e) => onChange({ playersMin: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Min"
                className="w-20 rounded-lg border border-outline-variant/15 bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:shadow-[0_0_8px_rgba(255,145,0,0.2)] dark:bg-surface-container-highest dark:text-on-surface"
              />
              <span className="text-on-surface-variant dark:text-on-surface-variant">to</span>
              <input
                type="number"
                min="1"
                max="20"
                value={filters.playersMax ?? ""}
                onChange={(e) => onChange({ playersMax: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Max"
                className="w-20 rounded-lg border border-outline-variant/15 bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:shadow-[0_0_8px_rgba(255,145,0,0.2)] dark:bg-surface-container-highest dark:text-on-surface"
              />
            </div>
          </div>

          {/* Play Time */}
          <div>
            <label className="mb-3 block text-xs font-bold uppercase tracking-[0.05em] text-on-surface dark:text-on-surface">
              Play Time (minutes)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                step="15"
                value={filters.playTimeMin ?? ""}
                onChange={(e) => onChange({ playTimeMin: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Min"
                className="w-20 rounded-lg border border-outline-variant/15 bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:shadow-[0_0_8px_rgba(255,145,0,0.2)] dark:bg-surface-container-highest dark:text-on-surface"
              />
              <span className="text-on-surface-variant dark:text-on-surface-variant">to</span>
              <input
                type="number"
                min="0"
                step="15"
                value={filters.playTimeMax ?? ""}
                onChange={(e) => onChange({ playTimeMax: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Max"
                className="w-20 rounded-lg border border-outline-variant/15 bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:shadow-[0_0_8px_rgba(255,145,0,0.2)] dark:bg-surface-container-highest dark:text-on-surface"
              />
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="mb-3 block text-xs font-bold uppercase tracking-[0.05em] text-on-surface dark:text-on-surface">
              Complexity Weight
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={filters.weightMin ?? ""}
                onChange={(e) => onChange({ weightMin: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Min"
                className="w-20 rounded-lg border border-outline-variant/15 bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:shadow-[0_0_8px_rgba(255,145,0,0.2)] dark:bg-surface-container-highest dark:text-on-surface"
              />
              <span className="text-on-surface-variant dark:text-on-surface-variant">to</span>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={filters.weightMax ?? ""}
                onChange={(e) => onChange({ weightMax: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Max"
                className="w-20 rounded-lg border border-outline-variant/15 bg-surface-container-highest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:shadow-[0_0_8px_rgba(255,145,0,0.2)] dark:bg-surface-container-highest dark:text-on-surface"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
