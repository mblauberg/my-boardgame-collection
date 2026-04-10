import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { SignInMethodsPanelContent } from "../components/settings/SignInMethodsSheet";
import { useAccountSecuritySummary } from "../features/auth/useAccountSecuritySummary";
import { useProfile } from "../features/auth/useProfile";

export function SignInMethodsPage() {
  const { isAuthenticated } = useProfile();
  const { data: summary, isLoading } = useAccountSecuritySummary();

  if (!isAuthenticated) {
    return (
      <div className="rounded-[2rem] border border-outline/10 bg-surface-container-lowest/90 p-8 text-center shadow-ambient dark:bg-surface-container-low/80">
        <p className="text-lg font-bold text-on-surface">Sign in to view your account security.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:hidden">
      <PageHeader
        eyebrow="Account security"
        title={<>Your <span className="text-primary">Sign-in Methods</span></>}
        description="A full-screen mobile view of passkeys, linked providers, and owned emails."
        actions={
          <Link
            to="/settings"
            className="rounded-full border border-outline/10 bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface transition hover:border-primary/20 hover:text-primary dark:bg-surface-container-high/60"
          >
            Back to settings
          </Link>
        }
      />

      <div className="rounded-[2rem] border border-outline/10 bg-surface-container-lowest/90 p-5 shadow-ambient dark:bg-surface-container-low/80">
        {isLoading || !summary ? (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-[1.5rem] bg-surface-container-high/60" />
            <div className="h-24 animate-pulse rounded-[1.5rem] bg-surface-container-high/40" />
            <div className="h-24 animate-pulse rounded-[1.5rem] bg-surface-container-high/40" />
          </div>
        ) : (
          <SignInMethodsPanelContent summary={summary} />
        )}
      </div>
    </div>
  );
}
