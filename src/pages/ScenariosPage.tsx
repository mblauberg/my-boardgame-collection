import { useGamesQuery } from '../features/games/useGamesQuery';
import { buildScenarioPresetResults } from '../features/scenarios/scenarioMappers';
import { ScenarioAccordion } from '../components/scenarios/ScenarioAccordion';
import { getSupabaseQueryErrorMessage } from '../lib/supabase/runtimeErrors';

export function ScenariosPage() {
  const { data: games, isLoading, error } = useGamesQuery();

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-on-surface-variant">Loading scenarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-error/20 bg-error/10 p-8 text-center text-on-surface">
        <p className="text-lg font-semibold">Scenarios unavailable</p>
        <p className="mt-2 text-sm leading-6">{getSupabaseQueryErrorMessage(error, "scenarios page")}</p>
      </div>
    );
  }

  const presets = buildScenarioPresetResults(games || []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface">Scenarios</h1>
        <p className="mt-2 text-on-surface-variant">
          Config-driven play suggestions matched to your collection
        </p>
      </div>
      <ScenarioAccordion presets={presets} />
    </div>
  );
}
