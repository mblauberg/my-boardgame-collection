import { scenarioPresets } from "../config/scenarioPresets";
import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function ScenariosPage() {
  return (
    <PlaceholderPage
      eyebrow="Scenarios"
      title="Config-driven play suggestions"
      description={`Scenario logic is already preserved in configuration. ${scenarioPresets.length} presets are ready to be wired to live game data and surfaced as dynamic sections.`}
      highlights={[
        "Map scenario rules to tags, status, player count, time, and weight.",
        "Render preset sections with dynamic matches instead of hard-coded game names.",
        "Show coverage states and empty guidance for thin categories.",
      ]}
      footer="Execution details live in docs/plans/scenarios-page.md."
    />
  );
}
