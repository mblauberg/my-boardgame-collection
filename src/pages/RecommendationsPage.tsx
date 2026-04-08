import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function RecommendationsPage() {
  return (
    <PlaceholderPage
      eyebrow="Recommendations"
      title="Track new additions worth considering"
      description="Recommendations will be curated separately from the buy list so rationale, verdicts, and overlap notes can stay explicit before a game is promoted into the backlog."
      highlights={[
        "Show new_rec items with verdict badges and owner notes.",
        "Allow owner actions to convert recommendations to buy or owned.",
        "Keep overlap text nuanced instead of implying false uniqueness.",
      ]}
      footer="Execution details live in docs/plans/recommendations-workflow.md."
    />
  );
}
