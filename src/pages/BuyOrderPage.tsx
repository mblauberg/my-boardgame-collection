import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function BuyOrderPage() {
  return (
    <PlaceholderPage
      eyebrow="Buy Order"
      title="Rank the next purchases"
      description="This route will surface wishlist items in priority order, support owner editing, and make status changes like buy-to-owned fast from the UI."
      highlights={[
        "Query buy-status games ordered by buy_priority.",
        "Add priority editing with optimistic updates when auth is in place.",
        "Surface collection gap summaries from category and tag heuristics.",
      ]}
      footer="Execution details live in docs/plans/buy-order-workflow.md."
    />
  );
}
