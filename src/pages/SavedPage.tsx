import { useState } from "react";
import { AddGameWizardOverlay } from "../components/library/AddGameWizardOverlay";
import { FloatingActionButton } from "../components/layout/FloatingActionButton";
import { LibraryList } from "../components/library/LibraryList";
import { LibraryToolbar } from "../components/library/LibraryToolbar";
import { filterLibraryEntries, sortLibraryEntries } from "../features/library/libraryFilters";
import { useLibraryFilters } from "../features/library/useLibraryFilters";
import { useSavedQuery } from "../features/library/useSavedQuery";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

export function SavedPage() {
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const { data: entries, isLoading, error } = useSavedQuery();
  const { filters, sortBy, sortDirection, updateFilters, updateSort, clearFilters } =
    useLibraryFilters();

  if (isLoading) {
    return <div className="p-8 text-center">Loading saved games...</div>;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50/80 p-8 text-center text-red-900">
        <p className="text-lg font-semibold">Saved games unavailable</p>
        <p className="mt-2 text-sm leading-6">
          {getSupabaseQueryErrorMessage(error, "saved games")}
        </p>
      </div>
    );
  }

  const filteredEntries = filterLibraryEntries(entries ?? [], filters);
  const sortedEntries = sortLibraryEntries(filteredEntries, sortBy, sortDirection);

  return (
    <>
      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            On Your Radar
          </p>
          <h1 className="max-w-2xl text-5xl font-extrabold tracking-tight text-on-surface md:text-7xl">
            Your <span className="text-primary">Saved</span> Games
          </h1>
        </div>
      </header>

      <LibraryToolbar
        searchText={filters.searchText}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSearchTextChange={(value) => updateFilters({ searchText: value })}
        onSortChange={updateSort}
        onClear={clearFilters}
      />

      <LibraryList entries={sortedEntries} getGameLinkState={() => ({ from: "/saved" })} />
      <FloatingActionButton onClick={() => setIsAddGameOpen(true)} />
      <AddGameWizardOverlay
        isOpen={isAddGameOpen}
        defaultListType="wishlist"
        defaultState={{ isSaved: true, isLoved: false, isInCollection: false }}
        onClose={() => setIsAddGameOpen(false)}
      />
    </>
  );
}
