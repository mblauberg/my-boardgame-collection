import { PageHeader } from "../components/layout/PageHeader";
import { ScenarioAccordion } from "../components/scenarios/ScenarioAccordion";
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
      <div className="rounded-3xl border border-error/20 bg-error/10 p-8 text-center text-on-surface">
        <p className="text-lg font-semibold">Scenarios unavailable</p>
        <p className="mt-2 text-sm leading-6">{getSupabaseQueryErrorMessage(error, "scenarios page")}</p>
      </div>
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
