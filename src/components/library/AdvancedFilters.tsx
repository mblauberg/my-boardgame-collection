import { PillSelector, type PillOption } from "../ui/PillSelector";
import type { GameFilters } from "../../features/shared/filters";

type AdvancedFiltersProps = {
  filters: GameFilters;
  onChange: (filters: Partial<GameFilters>) => void;
};

const PLAYER_OPTIONS: PillOption<number | undefined>[] = [
  { label: "ANY", value: undefined },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8+", value: 8 },
];

const TIME_OPTIONS: PillOption<number | undefined>[] = [
  { label: "ANY", value: undefined },
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "45m", value: 45 },
  { label: "1h", value: 60 },
  { label: "1h 15", value: 75 },
  { label: "1h 30", value: 90 },
  { label: "1h 45", value: 105 },
  { label: "2h", value: 120 },
  { label: "2h 15", value: 135 },
  { label: "2h 30", value: 150 },
  { label: "2h 45", value: 165 },
  { label: "3h+", value: 180 },
];

const WEIGHT_OPTIONS: PillOption<number | undefined>[] = [
  { label: "ANY", value: undefined },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
];

export function AdvancedFilters({ filters, onChange }: AdvancedFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-6">
        {/* Loved Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-on-surface-variant/70">favorite</span>
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50">
              Favorites
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onChange({ isLoved: !filters.isLoved ? true : undefined })}
            aria-pressed={filters.isLoved ?? false}
            className={`flex min-h-[44px] w-full items-center justify-center gap-3 rounded-full transition-all duration-300 font-medium text-sm ${
              filters.isLoved
                ? "glass-action-button-active text-on-primary"
                : "glass-action-button text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className={`material-symbols-outlined text-lg ${filters.isLoved ? "filled" : ""}`}>
              favorite
            </span>
            <span>Loved Games</span>
          </button>
        </div>

        {/* Player Count */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-on-surface-variant/70">group</span>
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50">
              Player Count
            </h4>
          </div>
          <PillSelector
            options={PLAYER_OPTIONS}
            activeValue={filters.playerCount}
            onChange={(val) => onChange({ playerCount: val })}
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Approx Weight */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-on-surface-variant/70">fitness_center</span>
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50">
              Complexity (Weight)
            </h4>
          </div>
          <PillSelector
            options={WEIGHT_OPTIONS}
            activeValue={filters.weight}
            onChange={(val) => onChange({ weight: val })}
          />
        </div>

        {/* Play Time */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-on-surface-variant/70">schedule</span>
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50">
              Approx Play Time
            </h4>
          </div>
          <PillSelector
            options={TIME_OPTIONS}
            activeValue={filters.playTime}
            onChange={(val) => onChange({ playTime: val })}
          />
        </div>
      </div>
    </div>
  );
}
