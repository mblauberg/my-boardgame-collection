import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import {
  startAuthentication,
  type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { signInSchema, type SignInFormData } from "./authSchemas";
import { useProfile } from "./useProfile";
import { PasskeyRegistrationPrompt } from "./PasskeyRegistrationPrompt";

type SupportedOAuthProvider = "google" | "apple" | "github" | "discord";
type OAuthProviderAvailability = "checking" | "available" | "unavailable";
type OAuthProviderAvailabilityMap = Record<SupportedOAuthProvider, OAuthProviderAvailability>;

const OAUTH_PROVIDERS: Array<{ provider: SupportedOAuthProvider; label: string; icon: string }> = [
  { provider: "apple", label: "Apple", icon: "logos:apple" },
  { provider: "google", label: "Google", icon: "logos:google-icon" },
  { provider: "discord", label: "Discord", icon: "logos:discord-icon" },
  { provider: "github", label: "GitHub", icon: "logos:github-icon" },
];

const INITIAL_PROVIDER_AVAILABILITY: OAuthProviderAvailabilityMap = {
  google: "checking",
  apple: "checking",
  github: "checking",
  discord: "checking",
};

type PasskeyAuthOptionsResponse = PublicKeyCredentialRequestOptionsJSON;

type PasskeyAuthVerifyResponse = {
  token_hash?: string;
};

type PasskeyListResponse = {
  passkeys?: Array<{ id: string }>;
};

function getAuthRedirectUrl() {
  return `${window.location.origin}/auth/callback`;
}

export function SignInForm() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { isAuthenticated, profile } = useProfile();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [providerAvailability, setProviderAvailability] = useState<OAuthProviderAvailabilityMap>(
    INITIAL_PROVIDER_AVAILABILITY,
  );
  const [hasPasskeys, setHasPasskeys] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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
        OAUTH_PROVIDERS.map(async ({ provider }) => {
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

    const loadPasskeys = async () => {
      if (!isAuthenticated) {
        if (isActive) setHasPasskeys(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke<PasskeyListResponse>("passkey-list");
      if (!isActive) return;

      if (error) {
        setHasPasskeys(false);
        return;
      }

      setHasPasskeys((data?.passkeys?.length ?? 0) > 0);
    };

    void loadPasskeys();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, supabase]);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    let isActive = true;

    const runConditional = async () => {
      const { data: options, error: optionsError } =
        await supabase.functions.invoke<PasskeyAuthOptionsResponse>("passkey-auth-options");

      if (optionsError || !options?.challenge) {
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

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
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
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
      }
    };

    void runConditional();

    return () => {
      isActive = false;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, [isAuthenticated, supabase]);

  const onSubmit = async (data: SignInFormData) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

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

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

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

  const handleLinkIdentity = async (provider: SupportedOAuthProvider, label: string) => {
    if (providerAvailability[provider] !== "available") return;

    setStatus("loading");
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.linkIdentity({ provider });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("success");
    setSuccessMessage(`Linking ${label} to this account...`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setStatus("idle");
    setSuccessMessage(null);
  };

  if (isAuthenticated && profile) {
    return (
      <div className="space-y-6">
        <div className="glass-surface-panel rounded-2xl p-6">
          <p className="text-base text-on-surface">
            Signed in as <strong className="font-extrabold">{profile.email}</strong>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Role</p>
              <p className="mt-1 text-sm font-medium text-on-surface">
                {profile.role === "owner" ? "Owner" : "Viewer"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Username</p>
              <p className="mt-1 text-sm font-medium text-on-surface">
                {profile.username ? `@${profile.username}` : "Not set"}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Public sharing
            </p>
            <p className="mt-1 text-sm font-medium text-on-surface">
              Profile: {profile.is_profile_public ? "Public" : "Private"} · Collection:{" "}
              {profile.is_collection_public ? "Public" : "Private"} · Saved:{" "}
              {profile.is_saved_public ? "Public" : "Private"}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/45 p-4">
          <p className="text-sm font-semibold text-on-surface">Link another sign-in method</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Use the same email and Supabase will merge linked identities into this account.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {OAUTH_PROVIDERS.map(({ provider, label, icon }) => {
              const isUnavailable = providerAvailability[provider] === "unavailable";
              return (
                <button
                  key={provider}
                  type="button"
                  onClick={() => void handleLinkIdentity(provider, label)}
                  disabled={status === "loading" || isUnavailable}
                  className={`glass-action-button flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all disabled:cursor-not-allowed ${
                    isUnavailable
                      ? "bg-surface-container-high/40 text-on-surface-variant/50 opacity-60 grayscale shadow-none"
                      : "text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  <Icon icon={icon} className={`h-4 w-4 ${isUnavailable ? "opacity-40" : ""}`} />
                  <span>Link {label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <PasskeyRegistrationPrompt hasPasskeys={hasPasskeys} />
        {status === "success" && successMessage ? (
          <div className="rounded-xl border border-secondary/20 bg-secondary/10 p-4">
            <p className="text-center text-sm font-bold text-secondary">{successMessage}</p>
          </div>
        ) : null}
        {status === "error" && errorMessage ? (
          <div className="rounded-xl border border-error/20 bg-error/10 p-4">
            <p className="text-center text-sm font-bold text-on-surface">{errorMessage}</p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full rounded-xl border border-outline-variant/15 bg-transparent px-6 py-3.5 text-base font-extrabold text-primary transition-colors hover:bg-surface-container-high"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-2 text-center">
        <h1 className="text-2xl font-black tracking-tight text-on-surface md:text-3xl">
          Sign In to<br />My Board Game Collection
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="relative">
          <input
            id="email"
            type="email"
            {...register("email")}
            aria-label="Email"
            autoComplete="username webauthn"
            className="block w-full rounded-2xl border border-outline-variant/15 bg-surface-container-low px-5 py-4 pr-14 text-base text-on-surface transition-shadow focus:border-primary focus:outline-none focus:shadow-[0_0_0_2px_rgba(138,76,0,0.1)]"
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
          className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
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
          <span className="bg-[#f0f0f0] px-4 text-on-surface-variant dark:bg-[#1a1a1a]">OR</span>
        </div>
      </div>

      <div className="space-y-3">
        {OAUTH_PROVIDERS.map(({ provider, label, icon }) => {
          const isUnavailable = providerAvailability[provider] === "unavailable";
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
              <span>Continue with {label}</span>
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
