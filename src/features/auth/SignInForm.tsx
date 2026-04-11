import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import {
  WebAuthnAbortService,
  startAuthentication,
  type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { syncAccountSession } from "./accountSecurityApi";
import { signInSchema, type SignInFormData } from "./authSchemas";
import { useTheme } from "../../lib/theme";

type SupportedOAuthProvider = "google" | "apple" | "github" | "discord";
type OAuthProviderAvailability = "checking" | "available" | "unavailable";
type OAuthProviderAvailabilityMap = Record<SupportedOAuthProvider, OAuthProviderAvailability>;

const INITIAL_PROVIDER_AVAILABILITY: OAuthProviderAvailabilityMap = {
  google: "checking",
  apple: "checking",
  github: "checking",
  discord: "checking",
};

const SUPPORTED_OAUTH_PROVIDERS: SupportedOAuthProvider[] = [
  "apple",
  "google",
  "discord",
  "github",
];

type PasskeyAuthOptionsResponse = PublicKeyCredentialRequestOptionsJSON;

type PasskeyAuthVerifyResponse = {
  token_hash?: string;
};

function getAuthRedirectUrl() {
  return `${window.location.origin}/auth/callback`;
}

function getPostSignInPath(needsPasskeyPrompt: boolean) {
  return needsPasskeyPrompt ? "/?passkey_prompt=1" : "/";
}

export function SignInForm() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [providerAvailability, setProviderAvailability] = useState<OAuthProviderAvailabilityMap>(
    INITIAL_PROVIDER_AVAILABILITY,
  );
  const hasConditionalPasskeyFlowRef = useRef(false);

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

    const checkProviderAvailability = async () => {
      const providerChecks = await Promise.all(
        SUPPORTED_OAUTH_PROVIDERS.map(async (provider) => {
          // Force apple to be unavailable/coming soon for now
          if (provider === "apple") {
            return [provider, "unavailable"] as const;
          }

          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: getAuthRedirectUrl(),
              skipBrowserRedirect: true,
            },
          });

          return [provider, error ? "unavailable" : "available"] as const;
        }),
      );

      if (!isActive) return;

      const nextAvailability = { ...INITIAL_PROVIDER_AVAILABILITY };
      providerChecks.forEach(([provider, availability]) => {
        nextAvailability[provider] = availability;
      });
      setProviderAvailability(nextAvailability);
    };

    void checkProviderAvailability();

    return () => {
      isActive = false;
    };
  }, [supabase]);

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

        navigate(getPostSignInPath(syncResult.needsPasskeyPrompt), { replace: true });
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
  }, [navigate, supabase]);

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
        emailRedirectTo: getAuthRedirectUrl(),
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
    if (providerAvailability[provider] !== "available") return;

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
        redirectTo: getAuthRedirectUrl(),
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="relative">
          <input
            id="email"
            type="email"
            {...register("email")}
            aria-label="Email"
            autoComplete="username webauthn"
            className="block w-full rounded-[1.4rem] border border-outline-variant/15 bg-surface-container-low px-5 py-4 pr-14 text-base text-on-surface transition-shadow focus:border-primary focus:outline-none focus:shadow-[0_0_0_2px_rgba(138,76,0,0.1)]"
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
          className="w-full rounded-[1.4rem] bg-primary px-5 py-3.5 text-sm font-bold text-on-primary transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue with email
        </button>
        {errors.email && (
          <p className="px-1 text-xs font-bold text-primary">{errors.email.message}</p>
        )}
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/30" />
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="bg-surface-container-lowest/95 px-4 text-on-surface-variant dark:bg-surface-container-low/95">
            OR
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {oauthProviders.map(({ provider, label, icon }) => {
          const isUnavailable = providerAvailability[provider] === "unavailable";
          return (
            <button
              key={provider}
              type="button"
              onClick={() => void handleOAuthSignIn(provider, label)}
              disabled={status === "loading" || isUnavailable}
              className={`glass-action-button flex w-full items-center justify-center gap-3 rounded-[1.4rem] px-4 py-4 text-sm font-bold transition-all disabled:cursor-not-allowed ${
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
      </div>

      {status === "success" && successMessage && (
        <div className="mt-6 rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p className="text-center text-sm font-bold text-secondary">{successMessage}</p>
        </div>
      )}

      {status === "error" && errorMessage && (
        <div className="mt-6 rounded-xl border border-error/20 bg-error/10 p-5">
          <p className="text-center text-sm font-bold text-on-surface">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
