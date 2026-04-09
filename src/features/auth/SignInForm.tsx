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
        <div className="rounded-xl bg-[#f1f1ee] p-6">
          <p className="text-base text-[#2e2f2d]">
            Signed in as <strong className="font-extrabold">{profile.email}</strong>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2e2f2d]/60">Role</p>
              <p className="mt-1 text-sm font-medium text-[#2e2f2d]">
                {profile.role === "owner" ? "Owner" : "Viewer"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2e2f2d]/60">Username</p>
              <p className="mt-1 text-sm font-medium text-[#2e2f2d]">
                {profile.username ? `@${profile.username}` : "Not set"}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2e2f2d]/60">
              Public sharing
            </p>
            <p className="mt-1 text-sm font-medium text-[#2e2f2d]">
              Profile: {profile.is_profile_public ? "Public" : "Private"} · Collection:{" "}
              {profile.is_collection_public ? "Public" : "Private"} · Saved:{" "}
              {profile.is_saved_public ? "Public" : "Private"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full rounded-xl bg-transparent border-none text-[#8a4c00] px-6 py-3.5 text-base font-extrabold hover:bg-[#ddddda] transition-colors"
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
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-[#2e2f2d]/70 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="block w-full rounded-xl bg-[#f1f1ee] border-none px-4 py-3.5 text-[#2e2f2d] focus:ring-0 focus:outline-none focus:shadow-[0_0_0_2px_#8a4c00] transition-shadow text-base"
            disabled={status === "loading"}
            placeholder="collector@example.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm font-semibold text-[#8a4c00]">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-xl bg-gradient-to-tr from-[#8a4c00] to-[#fd9000] px-6 py-3.5 text-base font-extrabold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {status === "loading" ? "Sending..." : "Send Magic Link"}
        </button>
      </form>

      {status === "success" && (
        <div className="rounded-xl bg-[#00675c]/10 p-5 mt-6">
          <p className="text-sm font-bold text-[#00675c] text-center">
            Check your email for a magic link to sign in!
          </p>
        </div>
      )}

      {status === "error" && errorMessage && (
        <div className="rounded-xl bg-amber-100 p-5 mt-6">
          <p className="text-sm font-bold text-amber-900 text-center">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
