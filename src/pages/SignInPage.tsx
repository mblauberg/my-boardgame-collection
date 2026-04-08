import { PlaceholderPage } from "../components/ui/PlaceholderPage";

export function SignInPage() {
  return (
    <PlaceholderPage
      eyebrow="Owner Access"
      title="Magic-link sign in"
      description="Owner authentication will use Supabase Auth with a single editor profile and row-level security enforcing private writes."
      highlights={[
        "Wire a magic-link form with client-side validation.",
        "Resolve session and profile role state on load.",
        "Redirect non-owners away from admin routes and protected mutations.",
      ]}
      footer="Execution details live in docs/plans/auth-and-owner-access.md."
    />
  );
}
