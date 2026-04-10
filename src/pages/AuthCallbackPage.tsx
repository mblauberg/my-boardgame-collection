import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { syncAccountSession } from "../features/auth/accountSecurityApi";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let isActive = true;
    const url = new URL(window.location.href);
    const type = url.searchParams.get("type");
    const token = url.searchParams.get("token");
    const isEmailMergeFlow = type === "email_merge" && typeof token === "string" && token.length > 0;

    const readCallbackError = () => {
      const hashParams = new URLSearchParams(
        url.hash.startsWith("#") ? url.hash.slice(1) : url.hash,
      );

      return url.searchParams.get("error_description") ?? hashParams.get("error_description");
    };

    const runSecuritySync = async () => {
      try {
        await syncAccountSession();
        return true;
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Unable to finish account security sync.");
        }
        return false;
      }
    };

    const completeSignIn = async () => {

      if (isEmailMergeFlow && token) {
        const { data: mergeData, error: mergeError } = await supabase.functions.invoke<{
          token_hash?: string;
          merged?: boolean;
        }>("email-merge-verify", {
          body: { token },
        });

        if (!isActive) return;
        if (mergeError || !mergeData?.token_hash) {
          setErrorMessage("The confirmation link has expired or has already been used.");
          return;
        }

        const { error: sessionError } = await supabase.auth.verifyOtp({
          token_hash: mergeData.token_hash,
          type: "magiclink",
        });

        if (!isActive) return;
        if (sessionError) {
          setErrorMessage(sessionError.message);
          return;
        }

        const isSynced = await runSecuritySync();
        if (!isActive || !isSynced) return;

        navigate(mergeData.merged ? "/settings?merged=true" : "/settings", { replace: true });
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!isActive) return;

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        const isSynced = await runSecuritySync();
        if (!isActive || !isSynced) return;

        navigate("/signin", { replace: true });
        return;
      }

      const callbackError = readCallbackError();
      if (callbackError) {
        setErrorMessage(callbackError);
      }
    };

    const subscription = isEmailMergeFlow
      ? null
      : supabase.auth.onAuthStateChange((event, session) => {
          if (!isActive) return;

          if (event === "SIGNED_IN" && session) {
            void (async () => {
              const isSynced = await runSecuritySync();
              if (!isActive || !isSynced) return;

              navigate("/signin", { replace: true });
            })();
          }
        }).data.subscription;

    void completeSignIn();

    return () => {
      isActive = false;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="mx-auto max-w-md py-12 px-4">
      <div className="glass-surface-panel rounded-2xl p-6 shadow-ambient">
        <h1 className="text-2xl font-bold text-on-surface">Completing sign in</h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          This should only take a moment while your sign-in session is confirmed.
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-error/20 bg-error/10 p-4">
            <p className="text-sm text-on-surface">{errorMessage}</p>
            <Link
              to="/signin"
              className="mt-3 inline-flex text-sm font-semibold text-primary underline"
            >
              Return to sign in
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-sm text-on-surface-variant">
            If nothing changes, wait a few seconds and try your preferred sign-in option again.
          </p>
        )}
      </div>
    </div>
  );
}
