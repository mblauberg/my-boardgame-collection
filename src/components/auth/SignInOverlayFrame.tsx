import { useEffect, type PropsWithChildren } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";

type SignInOverlayFrameProps = PropsWithChildren<{
  isStandalone?: boolean;
  onRequestClose: () => void;
}>;

export function SignInOverlayFrame({
  children,
  isStandalone = false,
  onRequestClose,
}: SignInOverlayFrameProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onRequestClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRequestClose]);

  return (
    <motion.div
      data-testid="sign-in-overlay-backdrop"
      data-motion="auth-backdrop"
      className={[
        "fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6",
        isStandalone
          ? "bg-gradient-to-b from-surface-container-lowest/90 to-surface-container-low/95 dark:from-surface dark:to-surface-container-low"
          : "bg-on-surface/15 backdrop-blur-xl",
      ].join(" ")}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
      transition={{
        duration: motionTokens.duration.base,
        ease: motionTokens.ease.standard,
      }}
      onClick={onRequestClose}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
        data-motion="auth-panel"
        className="glass-surface-panel relative flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-2xl border pt-5 shadow-ambient sm:max-h-[min(52rem,calc(100dvh-3rem))] sm:max-w-[34rem] sm:pt-7"
        initial={
          prefersReducedMotion
            ? false
            : {
                opacity: 0,
                y: isStandalone ? 28 : 20,
                scale: 0.98,
              }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={
          prefersReducedMotion
            ? undefined
            : {
                opacity: 0,
                y: isStandalone ? 20 : 12,
                scale: 0.985,
              }
        }
        transition={{
          duration: motionTokens.duration.slow,
          ease: motionTokens.ease.emphasized,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <motion.div
        className="mb-6 flex items-start justify-between gap-4 px-5 sm:px-8"
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.06,
                delayChildren: 0.04,
              },
            },
          }}
        >
          <div className="space-y-3">
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{
                duration: motionTokens.duration.base,
                ease: motionTokens.ease.standard,
              }}
              className="inline-flex items-center rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.22em] text-primary"
            >
              Account access
            </motion.span>
            <motion.div
              className="space-y-2"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{
                duration: motionTokens.duration.base,
                ease: motionTokens.ease.standard,
              }}
            >
              <h1 className="text-3xl font-black tracking-tight text-on-surface sm:text-4xl">
                Sign in
              </h1>
              <p className="max-w-md text-sm leading-6 text-on-surface-variant sm:text-[0.95rem]">
                Use email, OAuth, or a passkey to sign in quickly. You can manage sign-in methods in
                Settings anytime.
              </p>
            </motion.div>
          </div>

          <motion.button
            type="button"
            onClick={onRequestClose}
            aria-label="Close sign in"
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{
              duration: motionTokens.duration.base,
              ease: motionTokens.ease.standard,
            }}
            className="glass-action-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:scale-[1.02] hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </motion.button>
        </motion.div>

        <motion.div
          className="overflow-y-auto px-5 pb-8 pt-2 pr-4 sm:px-8 sm:pb-12 sm:pt-3 sm:pr-7"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.slow,
            ease: motionTokens.ease.standard,
            delay: prefersReducedMotion ? 0 : 0.08,
          }}
        >
          {children}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
