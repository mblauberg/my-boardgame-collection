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
  const hasPasskeys = summary.passkeys.length > 0;

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
          className="shrink-0 rounded-full border border-outline/10 bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface transition hover:border-primary/20 hover:text-primary dark:bg-surface-container-high/70"
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
              <div className="flex min-w-0 items-center gap-3">
                <span className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant">mail</span>
                <div className="min-w-0">
                  <p className="text-xs text-on-surface-variant">Email</p>
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {summary.primaryEmail ?? "—"}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
                Primary
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant">passkey</span>
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
                <span className="shrink-0 rounded-full border border-secondary/15 bg-secondary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-secondary">
                  Enabled
                </span>
              ) : (
                <span className="shrink-0 rounded-full border border-outline/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant/40">
                  None
                </span>
              )}
            </div>

            <div className="flex items-start gap-3 py-3">
              <span className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant mt-[0.2rem]">link</span>
              <div>
                <p className="text-xs text-on-surface-variant">Linked providers</p>
                {summary.identities.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {summary.identities.map((identity) => (
                      <span
                        key={identity.provider}
                        className="rounded-full border border-outline/10 bg-surface-container-lowest/85 px-3 py-1 text-xs font-bold text-on-surface dark:bg-surface/50"
                      >
                        {identity.label}
                      </span>
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
