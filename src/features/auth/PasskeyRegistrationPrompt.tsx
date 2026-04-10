import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/browser";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";

const SUPPRESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
export const PASSKEY_PROMPT_SUPPRESSION_KEY = "passkey_prompt_suppressed_at";

type RegistrationOptionsResponse = PublicKeyCredentialCreationOptionsJSON;

interface PasskeyRegistrationPromptProps {
  hasPasskeys: boolean;
  compact?: boolean;
}

function isSuppressed(): boolean {
  const stored = localStorage.getItem(PASSKEY_PROMPT_SUPPRESSION_KEY);
  if (!stored) return false;

  const parsed = Number(stored);
  if (!Number.isFinite(parsed)) return false;

  return Date.now() - parsed < SUPPRESSION_DURATION_MS;
}

export function PasskeyRegistrationPrompt({
  hasPasskeys,
  compact = false,
}: PasskeyRegistrationPromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  if (hasPasskeys || dismissed || isSuppressed()) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(PASSKEY_PROMPT_SUPPRESSION_KEY, Date.now().toString());
    setDismissed(true);
  };

  const handleCreatePasskey = async () => {
    setStatus("loading");
    const supabase = getSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (!accessToken) {
      setStatus("idle");
      return;
    }

    const { data: options, error: optionsError } =
      await supabase.functions.invoke<RegistrationOptionsResponse>("passkey-register-options", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    if (optionsError || !options?.challenge) {
      setStatus("idle");
      return;
    }

    let credential;
    try {
      credential = await startRegistration({ optionsJSON: options });
    } catch (_error) {
      setStatus("idle");
      return;
    }

    const { error: verifyError } = await supabase.functions.invoke("passkey-register-verify", {
      body: { credential, challenge: options.challenge },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (verifyError) {
      setStatus("idle");
      return;
    }

    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="rounded-[1.5rem] border border-secondary/20 bg-secondary/10 p-4 text-center text-sm font-bold text-secondary">
        Passkey enabled
      </div>
    );
  }

  return (
    <div
      className={`rounded-[1.5rem] border p-5 ${
        compact
          ? "border-primary/15 bg-[linear-gradient(145deg,rgba(253,144,0,0.12),rgba(253,144,0,0.03))]"
          : "border-primary/20 bg-primary/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon icon="mdi:passkey" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-on-surface">Set up passkey</p>
            {compact ? (
              <span className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-primary">
                Recommended
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs leading-5 text-on-surface-variant">
            Use Face ID, Touch ID, or your device PIN instead of waiting on an email link.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => void handleCreatePasskey()}
              disabled={status === "loading"}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary disabled:opacity-60"
            >
              {status === "loading" ? "Setting up..." : "Set up passkey"}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-xl px-4 py-2 text-xs font-bold text-on-surface-variant"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
