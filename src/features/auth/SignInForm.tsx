import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { signInSchema, type SignInFormData } from "./authSchemas";
import { useProfile } from "./useProfile";

export function SignInForm() {
  const supabase = getSupabaseBrowserClient();
  const { isAuthenticated, profile } = useProfile();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setStatus("loading");
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("success");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setStatus("idle");
  };

  if (isAuthenticated && profile) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-surface-container-low p-6">
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div>
          <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="block w-full rounded-xl border border-outline-variant/15 bg-surface-container-low px-4 py-3.5 text-base text-on-surface transition-shadow focus:border-primary focus:outline-none focus:shadow-[0_0_0_2px_rgba(138,76,0,0.2)]"
            disabled={status === "loading"}
            placeholder="collector@example.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm font-semibold text-primary">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-xl bg-gradient-to-tr from-primary to-primary-container px-6 py-3.5 text-base font-extrabold text-on-primary shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {status === "loading" ? "Sending..." : "Send Magic Link"}
        </button>
      </form>

      {status === "success" && (
        <div className="mt-6 rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p className="text-center text-sm font-bold text-secondary">
            Check your email for a magic link to sign in!
          </p>
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
