import { OwnedLibraryPage } from "../components/library/OwnedLibraryPage";
import { getOwnedLibrarySurfaceConfig } from "../features/library/librarySurfaceConfigs";
import { useOwnedLibrarySurfaceQuery } from "../features/library/useOwnedLibrarySurfaceQuery";

export function SavedPage() {
  const surfaceConfig = getOwnedLibrarySurfaceConfig("saved");
  const { data: entries, isLoading, error } = useOwnedLibrarySurfaceQuery("saved");

  return (
    <OwnedLibraryPage
      data={entries}
      isLoading={isLoading}
      error={error}
      {...surfaceConfig}
    />
  );
}
