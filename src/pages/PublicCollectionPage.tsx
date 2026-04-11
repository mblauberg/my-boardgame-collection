import { useParams } from "react-router-dom";
import { PublicLibraryPage } from "../components/library/PublicLibraryPage";
import { usePublicLibraryQuery } from "../features/library/usePublicLibraryQuery";

export function PublicCollectionPage() {
  const { username = "" } = useParams();
  const { data, isLoading, error } = usePublicLibraryQuery(username, "collection");

  return (
    <PublicLibraryPage
      username={username}
      data={data}
      isLoading={isLoading}
      error={error}
      header={{
        eyebrow: "Public Collection",
        description: "A public view of this account's collection.",
        loadingDescription: "Loading this public collection...",
        errorTitle: "Public collection unavailable",
        errorContext: "public collection",
        missingDescription: "This public collection could not be found.",
      }}
      getGameLinkState={(currentUsername) => ({ from: `/u/${currentUsername}/collection` })}
    />
  );
}
