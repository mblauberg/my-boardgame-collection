import { LibraryList } from "./LibraryList";
import { PageHeader } from "../layout/PageHeader";
import { GameCardSkeleton } from "../ui/GameCardSkeleton";
import { ErrorStatePanel } from "../ui/ErrorStatePanel";
import { getSupabaseQueryErrorMessage } from "../../lib/supabase/runtimeErrors";
import type { LibraryEntry } from "../../features/library/library.types";

type PublicLibraryPageProps = {
  username: string;
  data: { username: string; entries: LibraryEntry[] } | null | undefined;
  isLoading: boolean;
  error: unknown;
  header: {
    eyebrow: string;
    description: string;
    loadingDescription: string;
    errorTitle: string;
    errorContext: string;
    missingDescription: string;
  };
  getGameLinkState: (username: string) => { from: string };
};

export function PublicLibraryPage({
  username,
  data,
  isLoading,
  error,
  header,
  getGameLinkState,
}: PublicLibraryPageProps) {
  if (isLoading) {
    return (
      <>
        <PageHeader
          eyebrow={header.eyebrow}
          title={<>@{username}</>}
          description={header.loadingDescription}
          className="mb-3 md:mb-4"
        />
        <div className="editorial-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <GameCardSkeleton key={index} />
          ))}
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <ErrorStatePanel
        title={header.errorTitle}
        description={
          error
            ? getSupabaseQueryErrorMessage(error, header.errorContext)
            : header.missingDescription
        }
      />
    );
  }

  return (
    <section className="space-y-4">
      <PageHeader
        eyebrow={header.eyebrow}
        title={<>@{data.username}</>}
        description={header.description}
        className="mb-3 md:mb-4"
      />
      <LibraryList
        entries={data.entries}
        getGameLinkState={() => getGameLinkState(data.username)}
      />
    </section>
  );
}
