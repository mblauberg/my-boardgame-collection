import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  WebAuthnAbortService,
  startAuthentication,
  type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";
import { readPublicEnv } from "../../lib/env";
import { type SupportedOAuthProvider } from "../../lib/auth/oauthProviders";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { syncAccountSession } from "./accountSecurityApi";
import { signInSchema, type SignInFormData } from "./authSchemas";
import {
  buildAuthRedirectUrl,
  getPostSignInPath,
  getReturnToFromState,
} from "./signInNavigation";
import { useTheme } from "../../lib/theme";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";

type PasskeyAuthOptionsResponse = PublicKeyCredentialRequestOptionsJSON;

type PasskeyAuthVerifyResponse = {
  token_hash?: string;
};

export function SignInForm() {
  const { enabledOAuthProviders } = useMemo(() => readPublicEnv(), []);
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const hasConditionalPasskeyFlowRef = useRef(false);
  const enabledOAuthProviderSet = useMemo(
    () => new Set<SupportedOAuthProvider>(enabledOAuthProviders),
    [enabledOAuthProviders],
  );
  const returnTo = useMemo(() => getReturnToFromState(location.state), [location.state]);
  const authRedirectUrl = useMemo(() => buildAuthRedirectUrl(returnTo), [returnTo]);

  const oauthProviders = useMemo(() => {
    return [
      {
        provider: "apple" as const,
        label: "Apple",
        icon: theme === "dark" ? "ri:apple-fill" : "logos:apple",
      },
      { provider: "google" as const, label: "Google", icon: "logos:google-icon" },
      { provider: "discord" as const, label: "Discord", icon: "logos:discord-icon" },
      {
        provider: "github" as const,
        label: "GitHub",
        icon: theme === "dark" ? "ri:github-fill" : "logos:github-icon",
      },
    ];
  }, [theme]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    let isActive = true;

    const runConditional = async () => {
      const { data: options, error: optionsError } =
        await supabase.functions.invoke<PasskeyAuthOptionsResponse>("passkey-auth-options");

      if (optionsError || !options?.challenge) {
        return;
      }

      hasConditionalPasskeyFlowRef.current = true;

      let credential;
      try {
        credential = await startAuthentication({
          optionsJSON: options,
          useBrowserAutofill: true,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        return;
      } finally {
        hasConditionalPasskeyFlowRef.current = false;
      }

      if (!isActive) {
        return;
      }

      const { data: verifyData, error: verifyError } =
        await supabase.functions.invoke<PasskeyAuthVerifyResponse>("passkey-auth-verify", {
          body: { credential, challenge: options.challenge },
        });
      if (verifyError || !verifyData?.token_hash) {
        return;
      }

      const { error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: verifyData.token_hash,
        type: "magiclink",
      });
      if (sessionError && isActive) {
        setStatus("error");
        setErrorMessage("Passkey sign-in failed. Please try another method.");
        return;
      }

      try {
        const syncResult = await syncAccountSession();
        if (!isActive) return;

        navigate(getPostSignInPath(syncResult.needsPasskeyPrompt, returnTo), { replace: true });
      } catch (_error) {
        if (isActive) {
          await supabase.auth.signOut();
          setStatus("error");
          setErrorMessage("Passkey sign-in failed. Please try another method.");
        }
      }
    };

    void runConditional();

    return () => {
      isActive = false;
      if (hasConditionalPasskeyFlowRef.current) {
        WebAuthnAbortService.cancelCeremony();
      }
      hasConditionalPasskeyFlowRef.current = false;
    };
  }, [navigate, returnTo, supabase]);

  const onSubmit = async (data: SignInFormData) => {
    if (hasConditionalPasskeyFlowRef.current) {
      WebAuthnAbortService.cancelCeremony();
      hasConditionalPasskeyFlowRef.current = false;
    }

    setStatus("loading");
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: authRedirectUrl,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("success");
      setSuccessMessage("Check your email for a magic link to sign in.");
    }
  };

  const handleOAuthSignIn = async (provider: SupportedOAuthProvider, label: string) => {
    if (provider === "apple" || !enabledOAuthProviderSet.has(provider)) return;

    if (hasConditionalPasskeyFlowRef.current) {
      WebAuthnAbortService.cancelCeremony();
      hasConditionalPasskeyFlowRef.current = false;
    }

    setStatus("loading");
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: authRedirectUrl,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("success");
    setSuccessMessage(`Continuing with ${label}...`);
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
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{
          duration: motionTokens.duration.base,
          ease: motionTokens.ease.standard,
        }}
      >
        <div className="relative">
          <input
            id="email"
            type="email"
            {...register("email")}
            aria-label="Email"
            autoComplete="username webauthn"
            className="glass-input-field block w-full rounded-2xl px-5 py-4 pr-14 text-base text-on-surface focus:outline-none"
            disabled={status === "loading"}
            placeholder="your@email.com"
          />
          <div
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
            aria-hidden
          >
            <Icon icon="material-symbols:passkey" className="h-6 w-6" />
          </div>
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="glass-action-button-active w-full rounded-2xl px-5 py-3.5 text-sm font-bold text-on-primary transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue with email
        </button>
        {errors.email && (
          <p className="px-1 text-xs font-bold text-primary">{errors.email.message}</p>
        )}
      </motion.form>

      <motion.div
        className="relative my-8"
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{
          duration: motionTokens.duration.base,
          ease: motionTokens.ease.standard,
        }}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/30" />
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="bg-surface-container-lowest/95 px-4 text-on-surface-variant dark:bg-surface-container-low/95">
            OR
          </span>
        </div>
      </motion.div>

      <motion.div
        className="space-y-3"
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{
          duration: motionTokens.duration.base,
          ease: motionTokens.ease.standard,
        }}
      >
        {oauthProviders.map(({ provider, label, icon }) => {
          const isUnavailable = provider === "apple" || !enabledOAuthProviderSet.has(provider);
          return (
            <button
              key={provider}
              type="button"
              onClick={() => void handleOAuthSignIn(provider, label)}
              disabled={status === "loading" || isUnavailable}
              className={`glass-action-button flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold transition-all disabled:cursor-not-allowed ${
                isUnavailable
                  ? "bg-surface-container-lowest/30 text-on-surface-variant/40 border border-outline-variant/10 opacity-50 grayscale shadow-none"
                  : "text-on-surface hover:scale-[1.01] active:scale-[0.99] hover:bg-surface-container-high"
              }`}
            >
              <Icon icon={icon} className={`h-5 w-5 ${isUnavailable ? "opacity-20" : ""}`} />
              <div className="flex items-center gap-2">
                <span>Continue with {label}</span>
                {provider === "apple" && (
                  <span className="inline-flex items-center rounded-full bg-outline-variant/15 px-2 py-0.5 text-[10px] uppercase tracking-wider opacity-70">
                    Coming Soon
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence initial={false} mode="wait">
        {status === "success" && successMessage ? (
          <motion.div
            key="success"
            data-testid="auth-status-panel"
            data-motion="auth-status"
            className="glass-surface-panel mt-6 rounded-2xl border border-secondary/20 bg-secondary/10 p-5"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{
              duration: motionTokens.duration.base,
              ease: motionTokens.ease.standard,
            }}
          >
            <p className="text-center text-sm font-bold text-secondary">{successMessage}</p>
          </motion.div>
        ) : null}

        {status === "error" && errorMessage ? (
          <motion.div
            key="error"
            data-testid="auth-status-panel"
            data-motion="auth-status"
            className="glass-surface-panel mt-6 rounded-2xl border border-error/20 bg-error/10 p-5"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{
              duration: motionTokens.duration.base,
              ease: motionTokens.ease.standard,
            }}
          >
            <p className="text-center text-sm font-bold text-on-surface">{errorMessage}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
