import type { AccountSecuritySummary } from "../../features/auth/useAccountSecuritySummary";

type SignInMethodsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  summary: AccountSecuritySummary;
};

export function SignInMethodsPanelContent({ summary }: { summary: AccountSecuritySummary }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.5rem] border border-outline/10 bg-surface-container-low p-5 dark:bg-surface-container-high/45">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
              Passkeys
            </p>
            <h3 className="mt-2 text-xl font-black tracking-tight text-on-surface">
              {summary.passkeys.length > 0 ? "Trusted devices" : "Passkey not set up yet"}
            </h3>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${
              summary.passkeys.length > 0
                ? "border border-secondary/20 bg-secondary/10 text-secondary"
                : "border border-primary/20 bg-primary/10 text-primary"
            }`}
          >
            {summary.passkeys.length > 0 ? "Enabled" : "Recommended"}
          </span>
        </div>

        {summary.passkeys.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {summary.passkeys.map((passkey) => (
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
                    : `Registered ${new Date(passkey.created_at).toLocaleDateString()}`}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-on-surface-variant">
            No passkeys set up. Add one from your account settings to enable biometric sign-in.
          </p>
        )}
      </section>

      <section className="rounded-[1.5rem] border border-outline/10 bg-surface-container-low p-5 dark:bg-surface-container-high/45">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
          Linked providers
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
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
            <span className="text-sm text-on-surface-variant">No linked providers yet.</span>
          )}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-outline/10 bg-surface-container-low p-5 dark:bg-surface-container-high/45">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
          Email addresses
        </p>
        <div className="mt-4 space-y-3">
          {summary.emails.map((email) => (
            <div
              key={email.id}
              className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-outline/10 bg-surface-container-lowest/80 px-4 py-3 dark:bg-surface/40"
            >
              <div>
                <p className="text-sm font-bold text-on-surface">{email.value}</p>
                <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                  {email.isPrimary ? "Primary for sign-in" : "Additional owned email"}
                </p>
              </div>
              {email.isPrimary ? (
                <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
                  Primary
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SignInMethodsSheet({ isOpen, onClose, summary }: SignInMethodsSheetProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] hidden items-center justify-center bg-on-surface/20 p-6 backdrop-blur-xl md:flex"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Sign-in methods"
        className="glass-surface-panel max-h-[min(48rem,calc(100dvh-3rem))] w-full max-w-[44rem] overflow-hidden rounded-[2rem] border border-white/20 shadow-[0_32px_120px_rgba(0,0,0,0.25)] dark:border-white/10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-outline/10 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">
              Account security
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-on-surface">
              Sign-in methods
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign-in methods"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline/10 bg-surface-container-low text-on-surface-variant transition hover:text-on-surface dark:bg-surface-container-high/60"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto px-6 py-6">
          <SignInMethodsPanelContent summary={summary} />
        </div>
      </section>
    </div>
  );
}
