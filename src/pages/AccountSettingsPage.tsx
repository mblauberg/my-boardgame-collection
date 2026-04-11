import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { SignInMethodsSheet } from "../components/settings/SignInMethodsSheet";
import { SignInMethodsSummaryCard } from "../components/settings/SignInMethodsSummaryCard";
import { ErrorStatePanel } from "../components/ui/ErrorStatePanel";
import { StateMessagePanel } from "../components/ui/StateMessagePanel";
import { useAccountSecuritySummary } from "../features/auth/useAccountSecuritySummary";
import { useProfile } from "../features/auth/useProfile";
import { useUpdateProfileMutation } from "../features/profiles/useUpdateProfileMutation";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

type FormState = {
  username: string;
  isProfilePublic: boolean;
  isCollectionPublic: boolean;
  isSavedPublic: boolean;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.length > 0
  ) {
    return error.message;
  }

  return "Unable to save your settings right now.";
}

function getFormState(profile: ReturnType<typeof useProfile>["profile"]): FormState {
  return {
    username: profile?.username ?? "",
    isProfilePublic: profile?.is_profile_public ?? false,
    isCollectionPublic: profile?.is_collection_public ?? false,
    isSavedPublic: profile?.is_saved_public ?? false,
  };
}

function prefersMobileDetailSurface() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(max-width: 767px)").matches;
}

export function AccountSettingsPage() {
  const { profile, isLoading, isOwner, isAuthenticated, error } = useProfile();
  const { mutateAsync, isPending } = useUpdateProfileMutation();
  const { data: securitySummary, isLoading: isSecurityLoading } = useAccountSecuritySummary();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formState, setFormState] = useState<FormState>(() => getFormState(null));
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string | null }>({
    type: "idle",
    message: null,
  });
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMethodsOpen, setIsMethodsOpen] = useState(false);
  const wasMerged = searchParams.get("merged") === "true";

  useEffect(() => {
    setFormState(getFormState(profile));
  }, [profile]);

  useEffect(() => {
    if (!wasMerged) return;

    const timer = setTimeout(() => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.delete("merged");
        return next;
      }, { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [setSearchParams, wasMerged]);

  async function handleSave() {
    if (!profile?.id || isPending) return;

    try {
      setStatus({ type: "idle", message: null });
      await mutateAsync({
        accountId: profile.id,
        username: formState.username,
        is_profile_public: formState.isProfilePublic,
        is_collection_public: formState.isCollectionPublic,
        is_saved_public: formState.isSavedPublic,
      });
      setStatus({ type: "success", message: "Settings saved." });
    } catch (mutationError) {
      setStatus({
        type: "error",
        message: getErrorMessage(mutationError),
      });
    }
  }

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    navigate("/signin");
  }

  function handleOpenSignInMethods() {
    if (prefersMobileDetailSurface()) {
      navigate("/settings/sign-in-methods");
      return;
    }

    setIsMethodsOpen(true);
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading account settings...</div>;
  }

  if (error) {
    return (
      <ErrorStatePanel
        title="Account settings unavailable"
        description={error.message || "There was a problem loading your profile."}
      />
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <StateMessagePanel
        tone="neutral"
        description="Sign in to manage your account."
        align="center"
        className="shadow-ambient"
      />
    );
  }

  const summary = securitySummary ?? {
    primaryEmail: profile.email,
    emails: profile.email
      ? [{ id: profile.email, value: profile.email, isPrimary: true }]
      : [],
    identities: [],
    passkeys: [],
  };

  return (
    <>
      <PageHeader
        className="mb-8"
        eyebrow="Account"
        title={<>Your <span className="text-primary">Account</span></>}
        description="Manage your username, public visibility, and sign-in methods."
        actions={
          profile.username ? (
            <Link
              to={`/u/${profile.username}`}
              className="rounded-full border border-outline/15 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface transition hover:border-primary/20 hover:text-primary dark:bg-surface-container-high/60"
            >
              View profile
            </Link>

          ) : undefined
        }
      />

      {wasMerged ? (
        <StateMessagePanel
          tone="success"
          title="Accounts merged successfully."
          description="You are now signed in with your combined account."
          size="compact"
          className="mb-6"
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <form
          className="space-y-6 rounded-[2rem] border border-outline/10 bg-surface-container-lowest/90 p-6 shadow-ambient dark:bg-surface-container-low/80"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              Profile and sharing
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-on-surface">
              Public profile
            </h2>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-on-surface">Username</span>
            <input
              aria-label="Username"
              value={formState.username}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              placeholder="Choose a public username"
              className="mt-3 w-full rounded-[1.4rem] border border-outline/15 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/30 focus:bg-surface-container-high dark:bg-surface-container-high/60"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            <label className={`flex cursor-pointer flex-col gap-3 rounded-[1.5rem] border p-4 transition-all duration-200 ${
              formState.isProfilePublic
                ? "border-primary/25 bg-primary/5 dark:bg-primary/10"
                : "border-outline/10 bg-surface-container-low hover:border-outline/25 dark:bg-surface-container-high/45"
            }`}>
              <input
                type="checkbox"
                aria-label="Public profile"
                checked={formState.isProfilePublic}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    isProfilePublic: event.target.checked,
                  }))
                }
                className="sr-only"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-on-surface">Public profile</span>
                <span className={`material-symbols-outlined text-[20px] transition-colors duration-200 ${formState.isProfilePublic ? "text-primary" : "text-on-surface-variant/30"}`}>
                  {formState.isProfilePublic ? "check_circle" : "radio_button_unchecked"}
                </span>
              </div>
              <span className="text-xs leading-5 text-on-surface-variant">
                Allow people to discover your profile page.
              </span>
            </label>

            <label className={`flex cursor-pointer flex-col gap-3 rounded-[1.5rem] border p-4 transition-all duration-200 ${
              formState.isCollectionPublic
                ? "border-primary/25 bg-primary/5 dark:bg-primary/10"
                : "border-outline/10 bg-surface-container-low hover:border-outline/25 dark:bg-surface-container-high/45"
            }`}>
              <input
                type="checkbox"
                aria-label="Public collection"
                checked={formState.isCollectionPublic}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    isCollectionPublic: event.target.checked,
                  }))
                }
                className="sr-only"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-on-surface">Public collection</span>
                <span className={`material-symbols-outlined text-[20px] transition-colors duration-200 ${formState.isCollectionPublic ? "text-primary" : "text-on-surface-variant/30"}`}>
                  {formState.isCollectionPublic ? "check_circle" : "radio_button_unchecked"}
                </span>
              </div>
              <span className="text-xs leading-5 text-on-surface-variant">
                Show your collection on your public profile.
              </span>
            </label>

            <label className={`flex cursor-pointer flex-col gap-3 rounded-[1.5rem] border p-4 transition-all duration-200 ${
              formState.isSavedPublic
                ? "border-primary/25 bg-primary/5 dark:bg-primary/10"
                : "border-outline/10 bg-surface-container-low hover:border-outline/25 dark:bg-surface-container-high/45"
            }`}>
              <input
                type="checkbox"
                aria-label="Public saved"
                checked={formState.isSavedPublic}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    isSavedPublic: event.target.checked,
                  }))
                }
                className="sr-only"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-on-surface">Public saved</span>
                <span className={`material-symbols-outlined text-[20px] transition-colors duration-200 ${formState.isSavedPublic ? "text-primary" : "text-on-surface-variant/30"}`}>
                  {formState.isSavedPublic ? "check_circle" : "radio_button_unchecked"}
                </span>
              </div>
              <span className="text-xs leading-5 text-on-surface-variant">
                Let others browse the games you have saved for later.
              </span>
            </label>
          </div>

          <p className="text-xs leading-5 text-on-surface-variant">
            Public sharing requires a username when any visibility toggle is enabled.
          </p>

          {status.message ? (
            <StateMessagePanel
              tone={status.type === "error" ? "error" : "success"}
              description={status.message}
              size="compact"
            />
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline/10 pt-6">
            <div>
              <p className="text-sm font-semibold text-on-surface">{isOwner ? "Owner" : "Viewer"} account</p>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-gradient-to-br from-primary to-primary-container px-5 py-3 text-sm font-bold text-on-primary transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save settings"}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <SignInMethodsSummaryCard
            isLoading={isSecurityLoading}
            onOpen={handleOpenSignInMethods}
            summary={summary}
          />

          <section className="rounded-[2rem] border border-error/10 bg-surface-container-lowest/90 p-6 shadow-ambient dark:bg-surface-container-low/80">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-error/70">Session</p>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Signed in as <span className="font-semibold text-on-surface">{summary.primaryEmail}</span>.
            </p>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              className="mt-5 flex items-center gap-2 rounded-full border border-error/20 bg-error/10 px-5 py-3 text-sm font-bold text-error transition-all hover:bg-error/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </section>
        </div>
      </div>

      <SignInMethodsSheet
        isOpen={isMethodsOpen}
        onClose={() => setIsMethodsOpen(false)}
        summary={summary}
      />
    </>
  );
}
