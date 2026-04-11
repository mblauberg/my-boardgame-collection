import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useTheme } from "../../lib/theme";
import type { AccountSecuritySummary } from "../../features/auth/useAccountSecuritySummary";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";

type SignInMethodsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  summary: AccountSecuritySummary;
};

export function SignInMethodsPanelContent({ summary }: { summary: AccountSecuritySummary }) {
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionClassName = "glass-surface-panel rounded-2xl p-5 shadow-sm";
  const itemClassName =
    "flex items-center gap-4 rounded-xl border border-outline/10 bg-surface-container-lowest/80 px-4 py-3 dark:bg-surface/40";

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
    <motion.div
      className="space-y-6"
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
          },
        },
      }}
    >
      <motion.section
        className={sectionClassName}
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{
          duration: motionTokens.duration.base,
          ease: motionTokens.ease.standard,
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
              <span className="material-symbols-outlined text-[22px]">passkey</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
                Passkeys
              </p>
              <h3 className="mt-0.5 text-lg font-black tracking-tight text-on-surface">
                {summary.passkeys.length > 0 ? "Trusted devices" : "Biometric sign-in"}
              </h3>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
              summary.passkeys.length > 0
                ? "border border-secondary/20 bg-secondary/10 text-secondary"
                : "border border-primary/20 bg-primary/10 text-primary"
            }`}
          >
            {summary.passkeys.length > 0 ? "Enabled" : "Recommended"}
          </span>
        </div>

        {summary.passkeys.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {summary.passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className={itemClassName}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high/60 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">
                    {passkey.device_name?.toLowerCase().includes("iphone") ? "smartphone" : "devices"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-on-surface">
                    {passkey.device_name ?? "Trusted device"}
                  </p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    {passkey.last_used_at
                      ? `Last used ${new Date(passkey.last_used_at).toLocaleDateString()}`
                      : `Registered ${new Date(passkey.created_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-relaxed text-on-surface-variant">
            Enable faster, more secure sign-ins with your fingerprint, face, or screen lock.
          </p>
        )}
      </motion.section>

      <motion.section
        className={sectionClassName}
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{
          duration: motionTokens.duration.base,
          ease: motionTokens.ease.standard,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 text-secondary dark:bg-secondary/20">
            <span className="material-symbols-outlined text-[22px]">link</span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
              Connected
            </p>
            <h3 className="mt-0.5 text-lg font-black tracking-tight text-on-surface">
              Social accounts
            </h3>
          </div>
        </div>
        
        <div className="mt-5 flex flex-col gap-2">
          {summary.identities.length > 0 ? (
            summary.identities.map((identity) => (
              <div
                key={identity.provider}
                className={itemClassName}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high/60">
                  <Icon icon={getProviderIcon(identity.provider)} className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">{identity.label}</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">Linked account</p>
                </div>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant/30">
                  verified
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-outline/5 bg-surface-container-low/50 px-4 py-4 dark:bg-surface/20">
              <p className="text-sm text-on-surface-variant">No social accounts linked yet.</p>
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        className={sectionClassName}
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{
          duration: motionTokens.duration.base,
          ease: motionTokens.ease.standard,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-tertiary/10 text-tertiary dark:bg-tertiary/20">
            <span className="material-symbols-outlined text-[22px]">mail</span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">
              Identity
            </p>
            <h3 className="mt-0.5 text-lg font-black tracking-tight text-on-surface">
              Email addresses
            </h3>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {summary.emails.map((email) => (
            <div
              key={email.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-outline/10 bg-surface-container-lowest/80 px-4 py-3 dark:bg-surface/40"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-on-surface">{email.value}</p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  {email.isPrimary ? "Primary sign-in" : "Alternate email"}
                </p>
              </div>
              {email.isPrimary ? (
                <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                  Primary
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}


export function SignInMethodsSheet({ isOpen, onClose, summary }: SignInMethodsSheetProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!isOpen) {
    return null;
  }

  return (
    <motion.div
      data-testid="sign-in-methods-backdrop"
      data-motion="security-backdrop"
      className="fixed inset-0 z-[90] hidden items-center justify-center bg-on-surface/20 p-6 backdrop-blur-xl md:flex"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
      transition={{
        duration: motionTokens.duration.base,
        ease: motionTokens.ease.standard,
      }}
      onClick={onClose}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Sign-in methods"
        data-motion="security-panel"
        className="glass-surface-panel max-h-[min(48rem,calc(100dvh-3rem))] w-full max-w-[44rem] overflow-hidden rounded-2xl border shadow-ambient"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.99 }}
        transition={{
          duration: motionTokens.duration.slow,
          ease: motionTokens.ease.emphasized,
        }}
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
            className="glass-action-button flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto px-6 py-6">
          <SignInMethodsPanelContent summary={summary} />
        </div>
      </motion.section>
    </motion.div>
  );
}
