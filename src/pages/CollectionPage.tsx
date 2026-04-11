import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { OwnedLibraryPage } from "../components/library/OwnedLibraryPage";
import { PasskeyRegistrationPrompt } from "../features/auth/PasskeyRegistrationPrompt";
import { useAccountSecuritySummary } from "../features/auth/useAccountSecuritySummary";
import { useProfile } from "../features/auth/useProfile";
import { getOwnedLibrarySurfaceConfig } from "../features/library/librarySurfaceConfigs";
import { useOwnedLibrarySurfaceQuery } from "../features/library/useOwnedLibrarySurfaceQuery";

export function CollectionPage() {
  const surfaceConfig = getOwnedLibrarySurfaceConfig("collection");
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPostSignInPasskeyPrompt, setShowPostSignInPasskeyPrompt] = useState(
    () => searchParams.get("passkey_prompt") === "1",
  );
  const { isAuthenticated } = useProfile();
  const { data: securitySummary, isLoading: isSecuritySummaryLoading } = useAccountSecuritySummary();
  const { data: entries, isLoading, error } = useOwnedLibrarySurfaceQuery("collection");

  useEffect(() => {
    if (searchParams.get("passkey_prompt") !== "1") {
      return;
    }

    setShowPostSignInPasskeyPrompt(true);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("passkey_prompt");
      return next;
    }, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <OwnedLibraryPage
      data={entries}
      isLoading={isLoading}
      error={error}
      {...surfaceConfig}
      extraContent={
        showPostSignInPasskeyPrompt && isAuthenticated && !isSecuritySummaryLoading ? (
          <div className="mb-6">
            <PasskeyRegistrationPrompt hasPasskeys={(securitySummary?.passkeys.length ?? 0) > 0} />
          </div>
        ) : undefined
      }
    />
  );
}
