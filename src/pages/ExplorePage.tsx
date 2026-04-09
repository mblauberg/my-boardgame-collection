import { FloatingActionButton } from "../components/layout/FloatingActionButton";
import { ExploreShelf } from "../components/library/ExploreShelf";
import { useExploreQuery } from "../features/library/useExploreQuery";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

export function ExplorePage() {
  const { data, isLoading, error } = useExploreQuery();

  if (isLoading) {
    return <div className="p-8 text-center">Loading explore shelves...</div>;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50/80 p-8 text-center text-red-900">
        <p className="text-lg font-semibold">Explore unavailable</p>
        <p className="mt-2 text-sm leading-6">
          {getSupabaseQueryErrorMessage(error, "explore")}
        </p>
      </div>
    );
  }

  return (
    <>
      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Discovery
          </p>
          <h1 className="max-w-2xl text-5xl font-extrabold tracking-tight text-on-surface md:text-7xl">
            Find Your Next <span className="text-primary">Obsession</span>
          </h1>
        </div>
      </header>

      {data?.shelves.map((shelf) => (
        <ExploreShelf key={shelf.id} title={shelf.title} entries={shelf.entries} />
      ))}
    </>
  );
}
