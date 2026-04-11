import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScenarioSection } from "./ScenarioSection";
import { ScenarioEmptyState } from "./ScenarioEmptyState";
import type { ScenarioGame } from "../../config/scenarioPresets";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";

type ScenarioPresetResult = {
  id: string;
  emoji: string;
  label: string;
  description: string;
  sections: Array<{
    id: string;
    label: string;
    description: string;
    games: ScenarioGame[];
  }>;
};

type ScenarioAccordionProps = {
  presets: ScenarioPresetResult[];
};

export function ScenarioAccordion({ presets }: ScenarioAccordionProps) {
  const [openPresets, setOpenPresets] = useState<Set<string>>(new Set());
  const prefersReducedMotion = usePrefersReducedMotion();

  const togglePreset = (id: string) => {
    setOpenPresets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <motion.div
      className="space-y-4"
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
      {presets.map((preset) => {
        const isOpen = openPresets.has(preset.id);
        const totalGames = preset.sections.reduce((sum, s) => sum + s.games.length, 0);

        return (
          <motion.div
            key={preset.id}
            className="glass-surface-panel overflow-hidden rounded-2xl shadow-ambient"
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{
              duration: motionTokens.duration.base,
              ease: motionTokens.ease.standard,
            }}
          >
            <button
              type="button"
              onClick={() => togglePreset(preset.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-primary/5"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{preset.emoji}</span>
                  <h3 className="text-xl font-bold text-on-surface">{preset.label}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{totalGames}</span>
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">{preset.description}</p>
              </div>
              <motion.span
                className="material-symbols-outlined ml-4 text-primary"
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{
                  duration: motionTokens.duration.fast,
                  ease: motionTokens.ease.standard,
                }}
              >
                chevron_right
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  className="border-t border-primary/15 p-4"
                  initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{
                    duration: motionTokens.duration.base,
                    ease: motionTokens.ease.standard,
                  }}
                >
                  {totalGames === 0 ? (
                    <ScenarioEmptyState presetLabel={preset.label} />
                  ) : (
                    preset.sections.map((section) => (
                      <ScenarioSection
                        key={section.id}
                        label={section.label}
                        description={section.description}
                        games={section.games}
                      />
                    ))
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
