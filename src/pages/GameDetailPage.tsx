import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function GameDetailPage() {
  return (
    <PlaceholderPage
      eyebrow="Game Detail"
      title="Inspect a single game record"
      description="This route will present a focused view of one game, including metadata, notes, recommendation context, tags, and eventual owner actions."
      highlights={[
        "Fetch a single game by slug and map joined tags into the domain model.",
        "Render BGG fields, summary, notes, and recommendation details.",
        "Allow owner-only quick edits once auth and mutation hooks exist.",
      ]}
      footer="Execution details live in docs/plans/collection-and-game-detail.md."
    />
  );
}
