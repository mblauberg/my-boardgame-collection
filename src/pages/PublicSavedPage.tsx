import { useParams } from "react-router-dom";
import { PublicLibraryPage } from "../components/library/PublicLibraryPage";
import { usePublicLibraryQuery } from "../features/library/usePublicLibraryQuery";

export function PublicSavedPage() {
  const { username = "" } = useParams();
  const { data, isLoading, error } = usePublicLibraryQuery(username, "saved");

  return (
    <PublicLibraryPage
      username={username}
      data={data}
      isLoading={isLoading}
      error={error}
      header={{
        eyebrow: "Public Saved",
        description: "A public view of this account's saved games.",
        loadingDescription: "Loading this public saved list...",
        errorTitle: "Public saved games unavailable",
        errorContext: "public saved games",
        missingDescription: "This public saved list could not be found.",
      }}
      getGameLinkState={(currentUsername) => ({ from: `/u/${currentUsername}/saved` })}
    />
  );
}
