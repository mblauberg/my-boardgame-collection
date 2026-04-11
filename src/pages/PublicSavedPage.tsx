import { useParams } from "react-router-dom";
import { PublicLibraryPage } from "../components/library/PublicLibraryPage";
import { getPublicLibrarySurfaceConfig } from "../features/library/librarySurfaceConfigs";
import { usePublicLibraryQuery } from "../features/library/usePublicLibraryQuery";

export function PublicSavedPage() {
  const surfaceConfig = getPublicLibrarySurfaceConfig("saved");
  const { username = "" } = useParams();
  const { data, isLoading, error } = usePublicLibraryQuery(username, "saved");

  return (
    <PublicLibraryPage
      username={username}
      data={data}
      isLoading={isLoading}
      error={error}
      {...surfaceConfig}
    />
  );
}
