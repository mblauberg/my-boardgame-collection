import { SAVED_PRESETS } from "../components/library/QuickFilterPresets";
import { OwnedLibraryPage } from "../components/library/OwnedLibraryPage";
import { useSavedQuery } from "../features/library/useSavedQuery";

export function SavedPage() {
  const { data: entries, isLoading, error } = useSavedQuery();

  return (
    <OwnedLibraryPage
      data={entries}
      isLoading={isLoading}
      error={error}
      header={{
        eyebrow: "On Your Radar",
        title: <>Your <span className="text-primary">Saved</span> Games</>,
        description:
          "Games you're interested in trying. Save titles to explore later and keep track of what's on your radar.",
        loadingDescription: "Loading saved games...",
        errorTitle: "Saved games unavailable",
        errorContext: "saved games",
      }}
      guestMessage="You're browsing as a guest. Your saves are stored locally on this device."
      presets={SAVED_PRESETS}
      searchPlaceholder="Search saved games..."
      cardContext="saved"
      addGameDefaultState={{ isSaved: true, isLoved: false, isInCollection: false }}
      getGameLinkState={() => ({ from: "/saved" })}
    />
  );
}
