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
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            Signed in as <strong>{profile.email}</strong>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Role: {profile.role === "owner" ? "Owner" : "Viewer"}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Username
          </p>
          <p className="mt-1 text-sm text-gray-700">
            {profile.username ? `@${profile.username}` : "Not set"}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Public sharing
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Profile: {profile.is_profile_public ? "Public" : "Private"} · Collection:{" "}
            {profile.is_collection_public ? "Public" : "Private"} · Wishlist:{" "}
            {profile.is_wishlist_public ? "Public" : "Private"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            disabled={status === "loading"}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {status === "loading" ? "Sending..." : "Send Magic Link"}
        </button>
      </form>

      {status === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            Check your email for a magic link to sign in!
          </p>
        </div>
      )}

      {status === "error" && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
