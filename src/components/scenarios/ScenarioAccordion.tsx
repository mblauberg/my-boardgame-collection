import { useState } from 'react';
import { ScenarioSection } from './ScenarioSection';
import { ScenarioEmptyState } from './ScenarioEmptyState';
import type { ScenarioGame } from '../../config/scenarioPresets';

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
    <div className="space-y-4">
      {presets.map((preset) => {
        const isOpen = openPresets.has(preset.id);
        const totalGames = preset.sections.reduce((sum, s) => sum + s.games.length, 0);

        return (
          <div key={preset.id} className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-ambient">
            <button
              type="button"
              onClick={() => togglePreset(preset.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-container-low"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{preset.emoji}</span>
                  <h3 className="text-xl font-bold text-on-surface">{preset.label}</h3>
                  <span className="text-sm text-on-surface-variant">({totalGames} games)</span>
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">{preset.description}</p>
              </div>
              <span className="ml-4 text-on-surface-variant">{isOpen ? '▼' : '▶'}</span>
            </button>

            {isOpen && (
              <div className="border-t border-outline-variant/15 p-4">
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
