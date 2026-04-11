import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { COLLECTION_PRESETS } from "../components/library/QuickFilterPresets";
import { OwnedLibraryPage } from "../components/library/OwnedLibraryPage";
import { useCollectionQuery } from "../features/library/useCollectionQuery";
import { PasskeyRegistrationPrompt } from "../features/auth/PasskeyRegistrationPrompt";
import { useAccountSecuritySummary } from "../features/auth/useAccountSecuritySummary";
import { useProfile } from "../features/auth/useProfile";

export function CollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPostSignInPasskeyPrompt, setShowPostSignInPasskeyPrompt] = useState(
    () => searchParams.get("passkey_prompt") === "1",
  );
  const { isAuthenticated } = useProfile();
  const { data: securitySummary, isLoading: isSecuritySummaryLoading } = useAccountSecuritySummary();
  const { data: entries, isLoading, error } = useCollectionQuery();

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
      header={{
        eyebrow: "Curated Collection",
        title: <>Your <span className="text-primary">Collection</span></>,
        description:
          "Games you own and love. Build your personal library and track the titles that make it to your shelf.",
        loadingDescription: "Loading your collection...",
        errorTitle: "Collection unavailable",
        errorContext: "collection",
      }}
      guestMessage="You're browsing as a guest. Your collection is stored locally on this device."
      presets={COLLECTION_PRESETS}
      searchPlaceholder="Search your collection..."
      cardContext="collection"
      addGameDefaultState={{ isSaved: false, isLoved: false, isInCollection: true }}
      getGameLinkState={() => ({ from: "/" })}
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
