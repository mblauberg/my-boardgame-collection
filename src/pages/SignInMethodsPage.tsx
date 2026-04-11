import { PageHeader } from "../components/layout/PageHeader";
import { SignInMethodsPanelContent } from "../components/settings/SignInMethodsSheet";
import { StateMessagePanel } from "../components/ui/StateMessagePanel";
import { useAccountSecuritySummary } from "../features/auth/useAccountSecuritySummary";
import { useProfile } from "../features/auth/useProfile";

export function SignInMethodsPage() {
  const { isAuthenticated } = useProfile();
  const { data: summary, isLoading } = useAccountSecuritySummary();

  if (!isAuthenticated) {
    return (
      <StateMessagePanel
        tone="neutral"
        description="Sign in to view your account security."
        align="center"
        className="shadow-ambient"
      />
    );
  }

  return (
    <div className="space-y-6 md:hidden">
      <PageHeader
        eyebrow="Account security"
        backTo={{ label: "Settings", href: "/settings" }}
        title={<>Your <span className="text-primary">Sign-in Methods</span></>}
        description="Review your passkeys, social accounts, and verified email addresses."
      />


      <div className="pb-8">
        {isLoading || !summary ? (
          <div className="space-y-4 rounded-[2rem] border border-outline/10 bg-surface-container-lowest/90 p-5 shadow-ambient dark:bg-surface-container-low/80">
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
