import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function AdminPage() {
  return (
    <PlaceholderPage
      eyebrow="Admin"
      title="Owner-only content management"
      description="The admin surface will manage games, tags, priorities, notes, and recommendation fields from the browser while relying on Supabase RLS for real security."
      highlights={[
        "Build fast table actions for edit, archive, hide, and status changes.",
        "Support tag management and assignment without code edits.",
        "Keep destructive actions explicit and validated.",
      ]}
      footer="Execution details live in docs/plans/admin-crud-and-tags.md."
    />
  );
}
