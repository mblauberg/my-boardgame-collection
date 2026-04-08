import { useGamesQuery } from '../features/games/useGamesQuery';
import { buildScenarioPresetResults } from '../features/scenarios/scenarioMappers';
import { ScenarioAccordion } from '../components/scenarios/ScenarioAccordion';

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
      <div className="p-8">
        <p className="text-red-600">Error loading scenarios: {error.message}</p>
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
