import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function CollectionPage() {
  return (
    <PlaceholderPage
      eyebrow="Collection"
      title="Browse the live collection"
      description="This route will become the public front door for the collection, with search, filters, sorting, and card or row views driven by Supabase data."
      highlights={[
        "Connect list queries to the games, tags, and game_tags tables.",
        "Add filter state for status, tags, players, time, and weight.",
        "Support owner-only quick actions without exposing writes publicly.",
      ]}
      footer="Execution details live in docs/plans/collection-and-game-detail.md."
    />
  );
}
