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
            Quiet by default,
            <br />
            premium around passkeys.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-on-surface-variant">
            Keep your primary email visible, surface linked providers lightly, and make passkeys the
            standout security upgrade.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="rounded-full border border-outline/10 bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface transition hover:border-primary/20 hover:text-primary dark:bg-surface-container-high/70"
        >
          Sign-in methods
        </button>
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-surface-container-high/60" />
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-surface-container-high/40" />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.5rem] border border-outline/10 bg-surface-container-low p-4 dark:bg-surface-container-high/50">
            {hasPasskeys ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-on-surface">Passkey enabled</p>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                      {summary.passkeys.length === 1
                        ? "One trusted device is ready for faster sign-in."
                        : `${summary.passkeys.length} trusted devices are ready for faster sign-in.`}
                    </p>
                  </div>
                  <span className="rounded-full border border-secondary/15 bg-secondary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-secondary">
                    Enabled
                  </span>
                </div>
                <div className="grid gap-3">
                  {summary.passkeys.slice(0, 2).map((passkey) => (
                    <div
                      key={passkey.id}
                      className="rounded-[1.25rem] border border-outline/10 bg-surface-container-lowest/80 px-4 py-3 dark:bg-surface/40"
                    >
                      <p className="text-sm font-bold text-on-surface">
                        {passkey.device_name ?? "Trusted device"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                        {passkey.last_used_at
                          ? `Last used ${new Date(passkey.last_used_at).toLocaleDateString()}`
                          : "Recently registered"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <PasskeyRegistrationPrompt hasPasskeys={false} compact />
            )}
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-outline/10 bg-surface-container-low p-4 dark:bg-surface-container-high/45">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
                Primary email
              </p>
              <p className="mt-2 text-base font-bold text-on-surface">
                {summary.primaryEmail ?? "No primary email found"}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
                Linked providers
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {summary.identities.length > 0 ? (
                  summary.identities.map((identity) => (
                    <span
                      key={identity.provider}
                      className="rounded-full border border-outline/10 bg-surface-container-lowest/85 px-3 py-1.5 text-xs font-bold text-on-surface dark:bg-surface/50"
                    >
                      {identity.label}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-on-surface-variant">
                    Email link only for now. Provider linking UI lands with the next auth phase.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
