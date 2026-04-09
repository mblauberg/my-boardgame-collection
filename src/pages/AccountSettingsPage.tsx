import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AddGameWizardOverlay } from "../components/library/AddGameWizardOverlay";
import { useProfile } from "../features/auth/useProfile";
import { useUpdateProfileMutation } from "../features/profiles/useUpdateProfileMutation";

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

export function AccountSettingsPage() {
  const { profile, isLoading, isOwner, isAuthenticated, error } = useProfile();
  const { mutateAsync, isPending } = useUpdateProfileMutation();
  const [formState, setFormState] = useState<FormState>(() => getFormState(null));
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string | null }>({
    type: "idle",
    message: null,
  });

  useEffect(() => {
    setFormState(getFormState(profile));
  }, [
    profile?.id,
    profile?.username,
    profile?.is_profile_public,
    profile?.is_collection_public,
    profile?.is_saved_public,
  ]);

  async function handleSave() {
    if (!profile?.id || isPending) return;

    try {
      setStatus({ type: "idle", message: null });
      await mutateAsync({
        id: profile.id,
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

  if (isLoading) {
    return <div className="p-8 text-center">Loading account settings...</div>;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50/80 p-8 text-center text-red-900">
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
      <div className="mt-2 flex flex-col gap-8 md:flex-row">
        <aside className="w-full flex-shrink-0 md:w-64">
          <div className="flex h-full flex-col rounded-xl bg-surface-container-low p-6 dark:bg-[#121212]">
            <div className="mb-8">
              <h2 className="font-headline text-xl font-black uppercase tracking-widest text-primary">
                My Board Game Collection
              </h2>
              <p className="text-sm font-medium text-on-surface-variant">Curated Board Gaming</p>
            </div>

            <nav className="space-y-2">
              <Link
                to="/settings"
                className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-primary shadow-sm transition-all duration-200 dark:bg-[#2e2f2d] dark:text-primary-fixed"
              >
                <span
                  className="material-symbols-outlined shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_circle
                </span>
                <span>Account Details</span>
              </Link>
              <Link
                to={profile.username ? `/u/${profile.username}` : "/settings"}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-on-surface transition-all duration-200 hover:bg-surface-container-highest hover:pl-6 dark:text-outline-variant dark:hover:bg-[#2e2f2d]"
              >
                <span className="material-symbols-outlined shrink-0">visibility</span>
                <span>Public Profile</span>
              </Link>
              <Link
                to="/"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-on-surface transition-all duration-200 hover:bg-surface-container-highest hover:pl-6 dark:text-outline-variant dark:hover:bg-[#2e2f2d]"
              >
                <span className="material-symbols-outlined shrink-0">inventory_2</span>
                <span>Collection</span>
              </Link>
              <Link
                to="/saved"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-on-surface transition-all duration-200 hover:bg-surface-container-highest hover:pl-6 dark:text-outline-variant dark:hover:bg-[#2e2f2d]"
              >
                <span className="material-symbols-outlined shrink-0">bookmark</span>
                <span>Saved</span>
              </Link>
            </nav>

            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={() => setIsAddGameOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container py-4 font-bold text-on-primary shadow-lg transition-all hover:scale-[0.98] hover:shadow-primary/20 active:scale-95"
              >
                <span className="material-symbols-outlined shrink-0">add</span>
                Add New Game
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1 space-y-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
                Account Settings
              </span>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tighter text-on-surface md:text-5xl">
                Manage your account details.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
                Update your public identity and choose which parts of your library other players can
                see.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 rounded-full bg-secondary-fixed px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-secondary"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-on-secondary-container">
                  {isOwner ? "Owner Mode" : "Player Mode"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
            <form
              className="space-y-6 rounded-3xl border border-outline/10 bg-surface-container-lowest p-8 shadow-sm"
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
                  value={profile.email ?? ""}
                  disabled
                  readOnly
                  className="mt-3 w-full rounded-2xl border border-outline/10 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant"
                />
              </label>

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
                  className="mt-3 w-full rounded-2xl border border-outline/15 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/30"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-outline/10 bg-surface-container-low p-4">
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

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-outline/10 bg-surface-container-low p-4">
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

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-outline/10 bg-surface-container-low p-4">
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
                      ? "border border-error/20 bg-red-50 text-error"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-900"
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
                  className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              <div className="rounded-3xl border border-outline/10 bg-surface-container-low p-6">
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

              <div className="rounded-3xl border border-outline/10 bg-surface-container-low p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  Next Step
                </p>
                <h3 className="mt-2 text-xl font-bold text-on-surface">Add a game straight to your shelf</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  The account CTA now opens the add-game wizard in collection mode so new entries land
                  in your library by default.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <AddGameWizardOverlay
        isOpen={isAddGameOpen}
        defaultState={{ isSaved: false, isLoved: false, isInCollection: true }}
        onClose={() => setIsAddGameOpen(false)}
      />
    </>
  );
}
