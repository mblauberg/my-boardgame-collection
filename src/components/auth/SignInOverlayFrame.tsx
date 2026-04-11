import { type PropsWithChildren } from "react";

type SignInOverlayFrameProps = PropsWithChildren<{
  isStandalone?: boolean;
  onRequestClose: () => void;
}>;

export function SignInOverlayFrame({
  children,
  isStandalone = false,
  onRequestClose,
}: SignInOverlayFrameProps) {
  return (
    <div
      className={[
        "fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6",
        isStandalone
          ? "bg-[radial-gradient(circle_at_top,rgba(253,144,0,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.7),rgba(247,246,243,0.96))] dark:bg-[radial-gradient(circle_at_top,rgba(255,145,0,0.18),transparent_35%),linear-gradient(180deg,rgba(22,22,22,0.88),rgba(14,14,14,0.98))]"
          : "bg-on-surface/15 backdrop-blur-xl",
      ].join(" ")}
      onClick={onRequestClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
        className="glass-surface-panel relative flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-white/30 px-5 pb-6 pt-5 shadow-[0_32px_120px_rgba(0,0,0,0.24)] sm:max-h-[min(52rem,calc(100dvh-3rem))] sm:max-w-[34rem] sm:rounded-[2rem] sm:px-8 sm:pb-8 sm:pt-7 dark:border-white/10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.22em] text-primary">
              Account access
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
                Sign in
              </h1>
              <p className="max-w-md text-sm leading-6 text-on-surface-variant sm:text-[0.95rem]">
                Use email, OAuth, or a passkey to sign in quickly. You can manage sign-in methods in
                Settings anytime.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRequestClose}
            aria-label="Close sign in"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-outline/10 bg-surface-container-low/70 text-on-surface-variant transition hover:scale-[1.02] hover:text-on-surface dark:bg-surface-container-high/60"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="overflow-y-auto pr-1">{children}</div>
      </section>
    </div>
  );
}
