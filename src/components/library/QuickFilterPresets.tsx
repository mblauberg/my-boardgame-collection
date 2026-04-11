import type { GameFilters } from "../../features/shared/filters";

type Preset = {
  label: string;
  filters: Partial<GameFilters>;
};

type QuickFilterPresetsProps = {
  presets: Preset[];
  onSelect: (filters: Partial<GameFilters>) => void;
};

export function QuickFilterPresets({ presets, onSelect }: QuickFilterPresetsProps) {
  if (presets.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onSelect(preset.filters)}
          className="glass-action-button rounded-full px-4 py-1.5 text-sm font-semibold text-on-surface transition-transform hover:scale-105"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

// Preset definitions for different contexts
export const COLLECTION_PRESETS: Preset[] = [
  { label: "Quick Wins", filters: { playTimeMax: 30 } },
  { label: "Party Games", filters: { playersMin: 5 } },
  { label: "Solo", filters: { playersMin: 1, playersMax: 1 } },
  { label: "Heavy Strategy", filters: { weightMin: 3.5 } },
];

export const SAVED_PRESETS: Preset[] = [
  { label: "Quick Wins", filters: { playTimeMax: 30 } },
  { label: "Party Games", filters: { playersMin: 5 } },
  { label: "Solo", filters: { playersMin: 1, playersMax: 1 } },
  { label: "Light Games", filters: { weightMax: 2 } },
];
