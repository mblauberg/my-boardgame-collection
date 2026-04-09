import type { GameFilters } from "../../features/shared/filters";

type AdvancedFiltersProps = {
  filters: GameFilters;
  onChange: (filters: Partial<GameFilters>) => void;
};

export function AdvancedFilters({ filters, onChange }: AdvancedFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange({ isLoved: !filters.isLoved ? true : undefined })}
        aria-pressed={filters.isLoved ?? false}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${
          filters.isLoved
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-outline-variant/15 bg-surface-container-lowest text-on-surface hover:border-primary/20"
        }`}
      >
        <span className={`material-symbols-outlined text-base ${filters.isLoved ? "filled" : ""}`}>
          favorite
        </span>
        <span>Loved</span>
      </button>

      <div className="flex items-center gap-1.5 rounded-lg border border-outline-variant/15 bg-surface-container-lowest px-2.5 py-1.5">
        <span className="material-symbols-outlined text-base text-on-surface-variant">group</span>
        <input
          type="number"
          min="1"
          max="20"
          value={filters.playersMin ?? ""}
          onChange={(e) => onChange({ playersMin: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Min"
          aria-label="Player count min"
          className="w-14 rounded border-0 bg-transparent px-1 py-0.5 text-sm text-on-surface outline-none focus:bg-surface-container-high"
        />
        <span className="text-xs text-on-surface-variant">–</span>
        <input
          type="number"
          min="1"
          max="20"
          value={filters.playersMax ?? ""}
          onChange={(e) => onChange({ playersMax: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Max"
          aria-label="Player count max"
          className="w-14 rounded border-0 bg-transparent px-1 py-0.5 text-sm text-on-surface outline-none focus:bg-surface-container-high"
        />
      </div>

      <div className="flex items-center gap-1.5 rounded-lg border border-outline-variant/15 bg-surface-container-lowest px-2.5 py-1.5">
        <span className="material-symbols-outlined text-base text-on-surface-variant">schedule</span>
        <input
          type="number"
          min="0"
          step="15"
          value={filters.playTimeMin ?? ""}
          onChange={(e) => onChange({ playTimeMin: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Min"
          aria-label="Play time min"
          className="w-14 rounded border-0 bg-transparent px-1 py-0.5 text-sm text-on-surface outline-none focus:bg-surface-container-high"
        />
        <span className="text-xs text-on-surface-variant">–</span>
        <input
          type="number"
          min="0"
          step="15"
          value={filters.playTimeMax ?? ""}
          onChange={(e) => onChange({ playTimeMax: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Max"
          aria-label="Play time max"
          className="w-14 rounded border-0 bg-transparent px-1 py-0.5 text-sm text-on-surface outline-none focus:bg-surface-container-high"
        />
      </div>

      <div className="flex items-center gap-1.5 rounded-lg border border-outline-variant/15 bg-surface-container-lowest px-2.5 py-1.5">
        <span className="material-symbols-outlined text-base text-on-surface-variant">weight</span>
        <input
          type="number"
          min="1"
          max="5"
          step="0.1"
          value={filters.weightMin ?? ""}
          onChange={(e) => onChange({ weightMin: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Min"
          aria-label="Weight min"
          className="w-14 rounded border-0 bg-transparent px-1 py-0.5 text-sm text-on-surface outline-none focus:bg-surface-container-high"
        />
        <span className="text-xs text-on-surface-variant">–</span>
        <input
          type="number"
          min="1"
          max="5"
          step="0.1"
          value={filters.weightMax ?? ""}
          onChange={(e) => onChange({ weightMax: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Max"
          aria-label="Weight max"
          className="w-14 rounded border-0 bg-transparent px-1 py-0.5 text-sm text-on-surface outline-none focus:bg-surface-container-high"
        />
      </div>
    </div>
  );
}
