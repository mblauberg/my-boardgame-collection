import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";
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
  const prefersReducedMotion = usePrefersReducedMotion();

  if (presets.length === 0) return null;

  return (
    <motion.div
      className="flex flex-wrap gap-2"
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {presets.map((preset) => (
        <motion.button
          key={preset.label}
          type="button"
          onClick={() => onSelect(preset.filters)}
          className="glass-action-button rounded-full px-4 py-1.5 text-sm font-semibold text-on-surface transition-transform hover:scale-105"
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{
            duration: motionTokens.duration.fast,
            ease: motionTokens.ease.standard,
          }}
        >
          {preset.label}
        </motion.button>
      ))}
    </motion.div>
  );
}

// Preset definitions for different contexts
export const COLLECTION_PRESETS: Preset[] = [
  { label: "Around 30m", filters: { playTime: 30 } },
  { label: "Plays at 5", filters: { playerCount: 5 } },
  { label: "Solo", filters: { playerCount: 1 } },
  { label: "Weight ~4", filters: { weight: 4 } },
];

export const SAVED_PRESETS: Preset[] = [
  { label: "Around 30m", filters: { playTime: 30 } },
  { label: "Plays at 5", filters: { playerCount: 5 } },
  { label: "Solo", filters: { playerCount: 1 } },
  { label: "Weight ~2", filters: { weight: 2 } },
];
