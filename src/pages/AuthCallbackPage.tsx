import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StateMessagePanel } from "../components/ui/StateMessagePanel";
import { syncAccountSession } from "../features/auth/accountSecurityApi";
import { getPostSignInPath } from "../features/auth/signInNavigation";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

async function readFunctionErrorMessage(error: unknown): Promise<string | null> {
  const maybeContext =
    typeof error === "object" && error !== null && "context" in error
      ? (error as { context?: unknown }).context
      : null;

  if (maybeContext instanceof Response) {
    try {
      const payload = (await maybeContext.clone().json()) as { error?: unknown };
      if (typeof payload.error === "string" && payload.error.trim().length > 0) {
        return payload.error;
      }
    } catch (_error) {
      // Ignore non-JSON error bodies and fall back below.
    }

    try {
      const text = await maybeContext.clone().text();
      if (text.trim().length > 0) {
        return text;
      }
    } catch (_error) {
      // Ignore unreadable error bodies and fall back below.
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return null;
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let isActive = true;
    const url = new URL(window.location.href);
    const returnTo = url.searchParams.get("next") ?? "/";
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
        return await syncAccountSession();
      } catch (error) {
        await supabase.auth.signOut();
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Unable to finish account security sync.");
        }
        return null;
      }
    };

    const completeSignIn = async () => {
      if (isEmailMergeFlow && token) {
        const { data: mergeData, error: mergeError } = await supabase.functions.invoke<{
          token_hash?: string;
          merged?: boolean;
          error?: string;
        }>("email-merge-verify", {
          body: { token },
        });

        if (!isActive) return;
        if (mergeError || !mergeData?.token_hash) {
          const mergeErrorMessage =
            (mergeError ? await readFunctionErrorMessage(mergeError) : null) ??
            mergeData?.error ??
            "The confirmation link has expired or has already been used.";
          setErrorMessage(mergeErrorMessage);
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

        const syncResult = await runSecuritySync();
        if (!isActive || !syncResult) return;

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
        const syncResult = await runSecuritySync();
        if (!isActive || !syncResult) return;

        navigate(getPostSignInPath(syncResult.needsPasskeyPrompt, returnTo), { replace: true });
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
              const syncResult = await runSecuritySync();
              if (!isActive || !syncResult) return;

              navigate(getPostSignInPath(syncResult.needsPasskeyPrompt, returnTo), { replace: true });
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
          <StateMessagePanel
            tone="error"
            description={errorMessage}
            size="compact"
            className="mt-4"
            actions={
              <Link to="/signin" className="inline-flex text-sm font-semibold text-primary underline">
                Return to sign in
              </Link>
            }
          />
        ) : (
          <p className="mt-4 text-sm text-on-surface-variant">
            If nothing changes, wait a few seconds and try your preferred sign-in option again.
          </p>
        )}
      </div>
    </div>
  );
}
