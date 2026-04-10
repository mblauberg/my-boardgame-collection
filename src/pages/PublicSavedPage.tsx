import { useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { LibraryList } from "../components/library/LibraryList";
import { GameCardSkeleton } from "../components/ui/GameCardSkeleton";
import { usePublicLibraryQuery } from "../features/library/usePublicLibraryQuery";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

export function PublicSavedPage() {
  const { username = "" } = useParams();
  const { data, isLoading, error } = usePublicLibraryQuery(username, "saved");

  if (isLoading) {
    return (
      <>
        <PageHeader
          eyebrow="Public Saved"
          title={<>@{username}</>}
          description="Loading this public saved list..."
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
      <div className="rounded-3xl border border-error/20 bg-error/10 p-8 text-center text-on-surface">
        <p className="text-lg font-semibold">Public saved games unavailable</p>
        <p className="mt-2 text-sm leading-6">
          {error
            ? getSupabaseQueryErrorMessage(error, "public saved games")
            : "This public saved list could not be found."}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <PageHeader
        eyebrow="Public Saved"
        title={<>@{data.username}</>}
        description="A public view of this account's saved games."
        className="mb-3 md:mb-4"
      />
      <LibraryList
        entries={data.entries}
        getGameLinkState={() => ({ from: `/u/${data.username}/saved` })}
      />
    </section>
  );
}
