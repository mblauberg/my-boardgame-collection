import { useState } from "react";
import { AddGameWizardOverlay } from "../components/library/AddGameWizardOverlay";
import { FloatingActionButton } from "../components/layout/FloatingActionButton";
import { LibraryList } from "../components/library/LibraryList";
import { LibraryToolbar } from "../components/library/LibraryToolbar";
import { filterLibraryEntries, sortLibraryEntries } from "../features/library/libraryFilters";
import { useMoveWishlistToCollection } from "../features/library/useLibraryEntryMutations";
import { useLibraryFilters } from "../features/library/useLibraryFilters";
import { useWishlistQuery } from "../features/library/useWishlistQuery";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

export function WishlistPage() {
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const { data: entries, isLoading, error } = useWishlistQuery();
  const moveToCollection = useMoveWishlistToCollection();
  const { filters, sortBy, sortDirection, updateFilters, updateSort, clearFilters } =
    useLibraryFilters();

  if (isLoading) {
    return <div className="p-8 text-center">Loading wishlist...</div>;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50/80 p-8 text-center text-red-900">
        <p className="text-lg font-semibold">Wishlist unavailable</p>
        <p className="mt-2 text-sm leading-6">
          {getSupabaseQueryErrorMessage(error, "wishlist")}
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
            Future Games
          </p>
          <h1 className="max-w-2xl text-5xl font-extrabold tracking-tight text-on-surface md:text-7xl">
            The <span className="text-primary">Wishlist</span>
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

      <LibraryList
        entries={sortedEntries}
        getGameLinkState={() => ({ from: "/wishlist" })}
        isMovePending={moveToCollection.isPending}
        onMoveToCollection={(entryId) => {
          const entry = sortedEntries.find((candidate) => candidate.id === entryId);
          if (!entry) return;

          moveToCollection.mutate({
            id: entryId,
            userId: entry.userId,
          });
        }}
      />
      <FloatingActionButton onClick={() => setIsAddGameOpen(true)} />
      <AddGameWizardOverlay
        isOpen={isAddGameOpen}
        defaultListType="wishlist"
        onClose={() => setIsAddGameOpen(false)}
      />
    </>
  );
}
