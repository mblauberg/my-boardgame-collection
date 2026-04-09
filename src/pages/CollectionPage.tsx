import { useState } from "react";
import { AddGameWizardOverlay } from "../components/library/AddGameWizardOverlay";
import { FloatingActionButton } from "../components/layout/FloatingActionButton";
import { PageHeader } from "../components/layout/PageHeader";
import { LibraryList } from "../components/library/LibraryList";
import { FilterBar } from "../components/library/FilterBar";
import { GameCardSkeleton } from "../components/ui/GameCardSkeleton";
import { COLLECTION_PRESETS } from "../components/library/QuickFilterPresets";
import { filterLibraryEntries, sortLibraryEntries } from "../features/library/libraryFilters";
import { useCollectionQuery } from "../features/library/useCollectionQuery";
import { useLibraryFilters } from "../features/library/useLibraryFilters";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

export function CollectionPage() {
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const { data: entries, isLoading, error } = useCollectionQuery();
  const { filters, sortBy, sortDirection, updateFilters, updateSort, clearFilters } =
    useLibraryFilters();

  if (isLoading) {
    return (
      <>
        <PageHeader
          eyebrow="Curated Collection"
          title={<>Your <span className="text-primary">Collection</span></>}
          description="Loading your collection..."
        />
        <div className="mb-8 rounded-xl bg-surface-container-low p-6 dark:bg-[#1c1b1b]">
          <div className="h-10 bg-surface-container rounded-full animate-pulse" />
        </div>
        <div className="editorial-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-error/20 bg-error/10 p-8 text-center text-on-surface">
        <p className="text-lg font-semibold">Collection unavailable</p>
        <p className="mt-2 text-sm leading-6">
          {getSupabaseQueryErrorMessage(error, "collection")}
        </p>
      </div>
    );
  }

  const filteredEntries = filterLibraryEntries(entries ?? [], filters);
  const sortedEntries = sortLibraryEntries(filteredEntries, sortBy, sortDirection);

  return (
    <>
      <PageHeader
        eyebrow="Curated Collection"
        title={<>Your <span className="text-primary">Collection</span></>}
        description="Games you own and love. Build your personal library and track the titles that make it to your shelf."
      />

      <div className="mb-8">
        <FilterBar
          filters={filters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onFiltersChange={updateFilters}
          onSortChange={updateSort}
          onClearFilters={clearFilters}
          presets={COLLECTION_PRESETS}
          searchPlaceholder="Search your collection..."
        />
      </div>

      <LibraryList entries={sortedEntries} cardContext="collection" getGameLinkState={() => ({ from: "/" })} />
      <FloatingActionButton onClick={() => setIsAddGameOpen(true)} />
      <AddGameWizardOverlay
        isOpen={isAddGameOpen}
        defaultState={{ isSaved: false, isLoved: false, isInCollection: true }}
        onClose={() => setIsAddGameOpen(false)}
      />
    </>
  );
}
