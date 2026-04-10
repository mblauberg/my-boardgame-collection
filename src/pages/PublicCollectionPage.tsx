import { useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { LibraryList } from "../components/library/LibraryList";
import { GameCardSkeleton } from "../components/ui/GameCardSkeleton";
import { usePublicLibraryQuery } from "../features/library/usePublicLibraryQuery";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

export function PublicCollectionPage() {
  const { username = "" } = useParams();
  const { data, isLoading, error } = usePublicLibraryQuery(username, "collection");

  if (isLoading) {
    return (
      <>
        <PageHeader
          eyebrow="Public Collection"
          title={<>@{username}</>}
          description="Loading this public collection..."
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
        <p className="text-lg font-semibold">Public collection unavailable</p>
        <p className="mt-2 text-sm leading-6">
          {error
            ? getSupabaseQueryErrorMessage(error, "public collection")
            : "This public collection could not be found."}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <PageHeader
        eyebrow="Public Collection"
        title={<>@{data.username}</>}
        description="A public view of this account's collection."
        className="mb-3 md:mb-4"
      />
      <LibraryList
        entries={data.entries}
        getGameLinkState={() => ({ from: `/u/${data.username}/collection` })}
      />
    </section>
  );
}
