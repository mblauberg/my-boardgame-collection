import { useCallback, useEffect, useState } from "react";
import {
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/browser";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { useProfile } from "../features/auth/useProfile";
import { useUpdateProfileMutation } from "../features/profiles/useUpdateProfileMutation";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

type FormState = {
  username: string;
  isProfilePublic: boolean;
  isCollectionPublic: boolean;
  isSavedPublic: boolean;
};

type PasskeyListItem = {
  id: string;
  device_name: string | null;
  last_used_at: string | null;
  created_at: string;
};

type PasskeyListResponse = {
  passkeys?: PasskeyListItem[];
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

export function AccountSettingsPage() {
  const { profile, isLoading, isOwner, isAuthenticated, error } = useProfile();
  const { mutateAsync, isPending } = useUpdateProfileMutation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formState, setFormState] = useState<FormState>(() => getFormState(null));
  const [emailValue, setEmailValue] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string | null }>({
    type: "idle",
    message: null,
  });
  const [emailStatus, setEmailStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string | null;
  }>({
    type: "idle",
    message: null,
  });
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [passkeys, setPasskeys] = useState<PasskeyListItem[]>([]);
  const [isPasskeysLoading, setIsPasskeysLoading] = useState(false);
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState<{
    type: "idle" | "error";
    message: string | null;
  }>({
    type: "idle",
    message: null,
  });
  const [isSigningOut, setIsSigningOut] = useState(false);
  const wasMerged = searchParams.get("merged") === "true";

  async function getAuthHeaders() {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  }

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    navigate("/signin");
  }

  useEffect(() => {
    setFormState(getFormState(profile));
    setEmailValue(profile?.email ?? "");
  }, [
    profile?.id,
    profile?.email,
    profile?.username,
    profile?.is_profile_public,
    profile?.is_collection_public,
    profile?.is_saved_public,
  ]);

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

  const loadPasskeys = useCallback(async () => {
    if (!isAuthenticated) return;

    const supabase = getSupabaseBrowserClient();
    const authHeaders = await getAuthHeaders();
    setIsPasskeysLoading(true);
    setPasskeyStatus({ type: "idle", message: null });

    const { data, error: passkeyError } = await supabase.functions.invoke<PasskeyListResponse>("passkey-list", {
      headers: authHeaders,
    });
    if (passkeyError) {
      setPasskeyStatus({ type: "error", message: "Unable to load passkeys right now." });
      setIsPasskeysLoading(false);
      return;
    }

    setPasskeys(data?.passkeys ?? []);
    setIsPasskeysLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    void loadPasskeys();
  }, [loadPasskeys]);

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

  async function handleEmailUpdate() {
    if (!isAuthenticated || isUpdatingEmail) return;

    setIsUpdatingEmail(true);
    setEmailStatus({ type: "idle", message: null });
    const supabase = getSupabaseBrowserClient();
    const authHeaders = await getAuthHeaders();
    const { error: mergeRequestError } = await supabase.functions.invoke<{ ok: boolean }>(
      "email-merge-request",
      {
        headers: authHeaders,
        body: {
          newEmail: emailValue,
        },
      },
    );

    if (mergeRequestError) {
      setEmailStatus({
        type: "error",
        message: mergeRequestError.message || "Unable to request an email update right now.",
      });
      setIsUpdatingEmail(false);
      return;
    }

    setEmailStatus({
      type: "success",
      message: "Check your email to confirm the change.",
    });
    setIsUpdatingEmail(false);
  }

  async function handleDeletePasskey(passkeyId: string) {
    const supabase = getSupabaseBrowserClient();
    const authHeaders = await getAuthHeaders();
    const { error: deleteError } = await supabase.functions.invoke("passkey-delete", {
      headers: authHeaders,
      body: { passkeyId },
    });
    if (deleteError) {
      setPasskeyStatus({ type: "error", message: "Unable to remove this passkey." });
      return;
    }

    setPasskeys((current) => current.filter((passkey) => passkey.id !== passkeyId));
  }

  async function handleAddPasskey() {
    if (isAddingPasskey) return;

    setIsAddingPasskey(true);
    setPasskeyStatus({ type: "idle", message: null });
    const supabase = getSupabaseBrowserClient();
    const authHeaders = await getAuthHeaders();

    const { data: options, error: optionsError } =
      await supabase.functions.invoke<PublicKeyCredentialCreationOptionsJSON>("passkey-register-options", {
        headers: authHeaders,
      });
    if (optionsError || !options?.challenge) {
      setPasskeyStatus({ type: "error", message: "Unable to start passkey registration." });
      setIsAddingPasskey(false);
      return;
    }

    let credential;
    try {
      credential = await startRegistration({ optionsJSON: options });
    } catch (_error) {
      setPasskeyStatus({ type: "error", message: "Passkey registration was cancelled." });
      setIsAddingPasskey(false);
      return;
    }

    const { error: verifyError } = await supabase.functions.invoke("passkey-register-verify", {
      headers: authHeaders,
      body: { credential, challenge: options.challenge },
    });

    if (verifyError) {
      setPasskeyStatus({ type: "error", message: "Unable to save passkey." });
      setIsAddingPasskey(false);
      return;
    }

    await loadPasskeys();
    setIsAddingPasskey(false);
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading account settings...</div>;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-error/20 bg-error/10 p-8 text-center text-on-surface">
        <p className="text-lg font-semibold">Account settings unavailable</p>
        <p className="mt-2 text-sm leading-6">
          {error.message || "There was a problem loading your profile."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="rounded-3xl border border-outline/10 bg-surface-container-lowest p-8 text-center">
        <p className="text-lg font-semibold text-on-surface">Sign in to manage your account.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        className="mb-8"
        eyebrow="Account Settings"
        title={<>Manage Your <span className="text-primary">Account</span></>}
        description="Update your public identity and choose which parts of your library other players can see."
        actions={
          <div className="flex items-center gap-3">
            {profile.username && (
              <Link
                to={`/u/${profile.username}`}
                className="flex items-center gap-3 rounded-2xl bg-surface/70 px-5 py-3 shadow-ambient backdrop-blur-[24px] transition-all hover:bg-surface-bright/70 hover:shadow-ambient-lg dark:bg-[rgb(42_42_42/0.7)] dark:hover:bg-[rgb(58_58_58/0.7)]"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">visibility</span>
                <span className="text-sm font-semibold text-on-surface">View Profile</span>
              </Link>
            )}
          </div>
        }
      />

      {wasMerged ? (
        <div className="mb-6 rounded-2xl border border-secondary/20 bg-secondary/10 p-4 text-sm font-bold text-secondary">
          Accounts merged successfully. You are now signed in with your combined account.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
            <div className="space-y-6">
              <form
                className="space-y-6 rounded-3xl border border-outline/10 bg-surface-container-lowest p-8 shadow-ambient dark:bg-[rgb(28_27_27)]"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSave();
                }}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    Account Details
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface">
                    Profile and sharing
                  </h2>
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-on-surface">Email</span>
                  <input
                    aria-label="Email"
                    value={emailValue}
                    onChange={(event) => setEmailValue(event.target.value)}
                    className="mt-3 w-full rounded-2xl border border-outline/10 bg-surface-container-low px-4 py-3 text-sm text-on-surface dark:bg-[rgb(42_42_42)]"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handleEmailUpdate()}
                    disabled={isUpdatingEmail}
                    className="rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdatingEmail ? "Updating..." : "Update email"}
                  </button>
                  {emailStatus.message ? (
                    <p
                      className={`text-sm ${
                        emailStatus.type === "error" ? "text-error" : "text-secondary"
                      }`}
                    >
                      {emailStatus.message}
                    </p>
                  ) : null}
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
                    className="mt-3 w-full rounded-2xl border border-outline/15 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/30 focus:bg-surface-container-high dark:bg-[rgb(42_42_42)] dark:focus:bg-[rgb(58_58_58)]"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-outline/10 bg-surface-container-low p-4 dark:bg-[rgb(42_42_42)]">
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
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-bold text-on-surface">Public Profile</span>
                      <span className="mt-1 block text-xs leading-5 text-on-surface-variant">
                        Allow people to discover your profile page.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-outline/10 bg-surface-container-low p-4 dark:bg-[rgb(42_42_42)]">
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
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-bold text-on-surface">Public Collection</span>
                      <span className="mt-1 block text-xs leading-5 text-on-surface-variant">
                        Show your collection on your public profile.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-outline/10 bg-surface-container-low p-4 dark:bg-[rgb(42_42_42)]">
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
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-bold text-on-surface">Public Saved</span>
                      <span className="mt-1 block text-xs leading-5 text-on-surface-variant">
                        Let others browse the games you have saved for later.
                      </span>
                    </span>
                  </label>
                </div>

                {status.message ? (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                      status.type === "error"
                        ? "border border-error/20 bg-error/10 text-on-surface"
                        : "border border-secondary/20 bg-secondary/10 text-secondary"
                    }`}
                  >
                    {status.message}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline/10 pt-6">
                  <p className="text-sm text-on-surface-variant">
                    Public sharing requires a username when any visibility toggle is enabled.
                  </p>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-full bg-gradient-to-br from-primary to-primary-container px-5 py-3 text-sm font-bold text-on-primary transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>

              <div className="space-y-6 rounded-3xl border border-outline/10 bg-surface-container-lowest p-8 shadow-ambient dark:bg-[rgb(28_27_27)]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    Preferences
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface">
                    Notifications
                  </h2>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-outline/10 bg-surface-container-low p-4 dark:bg-[rgb(42_42_42)]">
                  <input type="checkbox" className="mt-1" />
                  <span>
                    <span className="block text-sm font-bold text-on-surface">Email Updates</span>
                    <span className="mt-1 block text-xs leading-5 text-on-surface-variant">
                      Receive occasional updates about new features and community highlights.
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-outline/10 bg-surface-container-low p-4 dark:bg-[rgb(42_42_42)]">
                  <input type="checkbox" className="mt-1" />
                  <span>
                    <span className="block text-sm font-bold text-on-surface">BGG Sync Alerts</span>
                    <span className="mt-1 block text-xs leading-5 text-on-surface-variant">
                      Get notified when BoardGameGeek data is refreshed for games in your collection.
                    </span>
                  </span>
                </label>
              </div>

              <div className="space-y-6 rounded-3xl border border-outline/10 bg-surface-container-lowest p-8 shadow-ambient dark:bg-[rgb(28_27_27)]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Security</p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface">Passkeys</h2>
                </div>

                {isPasskeysLoading ? (
                  <p className="text-sm text-on-surface-variant">Loading passkeys...</p>
                ) : passkeys.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No passkeys registered.</p>
                ) : (
                  <ul className="space-y-3">
                    {passkeys.map((passkey) => (
                      <li
                        key={passkey.id}
                        className="flex items-center justify-between rounded-2xl border border-outline/10 bg-surface-container-low px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-bold text-on-surface">
                            {passkey.device_name ?? "Unknown device"}
                          </p>
                          {passkey.last_used_at ? (
                            <p className="mt-0.5 text-xs text-on-surface-variant">
                              Last used {new Date(passkey.last_used_at).toLocaleDateString()}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleDeletePasskey(passkey.id)}
                          className="rounded-xl px-3 py-1.5 text-xs font-bold text-error hover:bg-error/10"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {passkeyStatus.message ? (
                  <p className="text-sm text-error">{passkeyStatus.message}</p>
                ) : null}

                <button
                  type="button"
                  onClick={() => void handleAddPasskey()}
                  disabled={isAddingPasskey}
                  className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-bold text-primary disabled:opacity-60"
                >
                  {isAddingPasskey ? "Adding passkey..." : "Add passkey"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-outline/10 bg-surface-container-low p-6 dark:bg-[rgb(28_27_27)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Account Summary
                </p>
                <dl className="mt-5 space-y-4">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      Role
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-on-surface">
                      {isOwner ? "Owner" : "Viewer"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      Public URL
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-on-surface">
                      {profile.username ? `@${profile.username}` : "Set a username to share publicly"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      Visibility
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-on-surface">
                      Profile: {formState.isProfilePublic ? "Public" : "Private"} · Collection:{" "}
                      {formState.isCollectionPublic ? "Public" : "Private"} · Saved:{" "}
                      {formState.isSavedPublic ? "Public" : "Private"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-3xl border border-outline/10 bg-surface-container-low p-6 dark:bg-[rgb(28_27_27)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Quick Tip
                </p>
                <h3 className="mt-2 text-xl font-bold text-on-surface">Share your collection</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  Enable public visibility and share your profile URL with friends to showcase your
                  board game library.
                </p>
              </div>
            </div>
          </div>

        <div className="mt-6 rounded-3xl border border-error/10 bg-surface-container-lowest p-6 shadow-ambient dark:bg-[rgb(28_27_27)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-error/70">
                Session
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                You are signed in as <span className="font-semibold text-on-surface">{profile.email}</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              className="flex items-center gap-2 rounded-full border border-error/20 bg-error/10 px-5 py-3 text-sm font-bold text-error backdrop-blur-[24px] transition-all hover:bg-error/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
    </>
  );
}
