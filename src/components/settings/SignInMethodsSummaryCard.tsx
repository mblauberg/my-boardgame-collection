import { Icon } from "@iconify/react";
import { useTheme } from "../../lib/theme";
import { PasskeyRegistrationPrompt } from "../../features/auth/PasskeyRegistrationPrompt";
import type { AccountSecuritySummary } from "../../features/auth/useAccountSecuritySummary";

type SignInMethodsSummaryCardProps = {
  isLoading?: boolean;
  onOpen: () => void;
  summary: AccountSecuritySummary;
};

export function SignInMethodsSummaryCard({
  isLoading = false,
  onOpen,
  summary,
}: SignInMethodsSummaryCardProps) {
  const { theme } = useTheme();
  const hasPasskeys = summary.passkeys.length > 0;

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "google":
        return "logos:google-icon";
      case "apple":
        return theme === "dark" ? "ri:apple-fill" : "logos:apple";
      case "github":
        return theme === "dark" ? "ri:github-fill" : "logos:github-icon";
      case "discord":
        return "logos:discord-icon";
      default:
        return "material-symbols:link";
    }
  };

  return (
    <section className="rounded-[2rem] border border-outline/10 bg-surface-container-lowest/90 p-6 shadow-ambient dark:bg-surface-container-low/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">
            Sign-in methods
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-on-surface">
            How you sign in
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 rounded-full border border-outline/15 bg-surface-container-low px-5 py-2.5 text-sm font-bold text-on-surface transition hover:border-primary/20 hover:text-primary dark:bg-surface-container-high/70"
        >
          Manage
        </button>
      </div>

      {isLoading ? (
        <div className="mt-5 space-y-3">
          <div className="h-12 animate-pulse rounded-[1.25rem] bg-surface-container-high/60" />
          <div className="h-12 animate-pulse rounded-[1.25rem] bg-surface-container-high/40" />
          <div className="h-12 animate-pulse rounded-[1.25rem] bg-surface-container-high/30" />
        </div>
      ) : (
        <>
          <div className="mt-5 divide-y divide-outline/10">
            <div className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tertiary/10 text-tertiary">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-on-surface-variant">Email</p>
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {summary.primaryEmail ?? "—"}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-primary/15 bg-primary/10 px-3 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                Primary
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[18px]">passkey</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Passkeys</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {hasPasskeys
                      ? summary.passkeys.length === 1
                        ? "1 trusted device"
                        : `${summary.passkeys.length} trusted devices`
                      : "Not set up"}
                  </p>
                </div>
              </div>
              {hasPasskeys ? (
                <span className="shrink-0 rounded-full border border-secondary/15 bg-secondary/10 px-3 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-secondary">
                  Enabled
                </span>
              ) : (
                <span className="shrink-0 rounded-full border border-outline/10 px-3 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
                  None
                </span>
              )}
            </div>

            <div className="flex items-start gap-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined text-[18px]">link</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-on-surface-variant">Linked providers</p>
                {summary.identities.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {summary.identities.map((identity) => (
                      <div
                        key={identity.provider}
                        className="flex items-center gap-2 rounded-full border border-outline/10 bg-surface-container-lowest/85 py-1 pl-1.5 pr-3 text-[11px] font-bold text-on-surface dark:bg-surface/50"
                      >
                        <Icon icon={getProviderIcon(identity.provider)} className="h-3.5 w-3.5" />
                        <span>{identity.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-on-surface">None</p>
                )}
              </div>
            </div>
          </div>

          {!hasPasskeys && (
            <div className="mt-2 border-t border-outline/10 pt-4">
              <PasskeyRegistrationPrompt hasPasskeys={false} compact />
            </div>
          )}
        </>
      )}
    </section>
  );
}

