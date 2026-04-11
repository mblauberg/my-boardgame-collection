import { PageHeader } from "../components/layout/PageHeader";
import { ScenarioAccordion } from "../components/scenarios/ScenarioAccordion";
import { ErrorStatePanel } from "../components/ui/ErrorStatePanel";
import { GameCardSkeleton } from "../components/ui/GameCardSkeleton";
import { useGamesQuery } from "../features/games/useGamesQuery";
import { buildScenarioPresetResults } from "../features/scenarios/scenarioMappers";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

export function ScenariosPage() {
  const { data: games, isLoading, error } = useGamesQuery();

  if (isLoading) {
    return (
      <>
        <PageHeader
          eyebrow="Scenarios"
          title={<>Collection-based <span className="text-primary">Suggestions</span></>}
          description="Loading scenario suggestions..."
          className="mb-3 md:mb-4"
        />
        <div className="editorial-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <GameCardSkeleton key={index} />
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <ErrorStatePanel
        title="Scenarios unavailable"
        description={getSupabaseQueryErrorMessage(error, "scenarios page")}
      />
    );
  }

  const presets = buildScenarioPresetResults(games || []);

  return (
    <div>
      <PageHeader
        eyebrow="Scenarios"
        title={<>Collection-based <span className="text-primary">Suggestions</span></>}
        description="Play suggestions grouped by situation, player count, and mood based on the catalog data in your collection."
        className="mb-3 md:mb-4"
      />
      <ScenarioAccordion presets={presets} />
    </div>
  );
}
