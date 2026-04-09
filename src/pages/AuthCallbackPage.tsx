import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let isActive = true;

    const readCallbackError = () => {
      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(
        url.hash.startsWith("#") ? url.hash.slice(1) : url.hash,
      );

      return url.searchParams.get("error_description") ?? hashParams.get("error_description");
    };

    const completeSignIn = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!isActive) return;

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        navigate("/signin", { replace: true });
        return;
      }

      const callbackError = readCallbackError();
      if (callbackError) {
        setErrorMessage(callbackError);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) return;

      if (event === "SIGNED_IN" && session) {
        navigate("/signin", { replace: true });
      }
    });

    void completeSignIn();

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="mx-auto max-w-md py-12 px-4">
      <div className="rounded-lg border border-gray-200 bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-on-surface">Completing sign in</h1>
        <p className="mt-3 text-sm text-on-surface-variant-variant">
          This should only take a moment while your magic link session is confirmed.
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{errorMessage}</p>
            <Link
              to="/signin"
              className="mt-3 inline-flex text-sm font-semibold text-red-700 underline"
            >
              Return to sign in
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            If nothing changes, wait a few seconds and request a new magic link.
          </p>
        )}
      </div>
    </div>
  );
}
