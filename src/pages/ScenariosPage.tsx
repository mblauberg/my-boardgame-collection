import { useGamesQuery } from '../features/games/useGamesQuery';
import { buildScenarioPresetResults } from '../features/scenarios/scenarioMappers';
import { ScenarioAccordion } from '../components/scenarios/ScenarioAccordion';
import { getSupabaseQueryErrorMessage } from '../lib/supabase/runtimeErrors';

export function ScenariosPage() {
  const { data: games, isLoading, error } = useGamesQuery();

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading scenarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50/80 p-8 text-center text-red-900">
        <p className="text-lg font-semibold">Scenarios unavailable</p>
        <p className="mt-2 text-sm leading-6">{getSupabaseQueryErrorMessage(error, "scenarios page")}</p>
      </div>
    );
  }

  const presets = buildScenarioPresetResults(games || []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Scenarios</h1>
        <p className="mt-2 text-gray-600">
          Config-driven play suggestions matched to your collection
        </p>
      </div>
      <ScenarioAccordion presets={presets} />
    </div>
  );
}
