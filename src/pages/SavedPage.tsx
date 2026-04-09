import { useState } from "react";
import { AddGameWizardOverlay } from "../components/library/AddGameWizardOverlay";
import { FloatingActionButton } from "../components/layout/FloatingActionButton";
import { PageHeader } from "../components/layout/PageHeader";
import { LibraryList } from "../components/library/LibraryList";
import { FilterBar } from "../components/library/FilterBar";
import { GameCardSkeleton } from "../components/ui/GameCardSkeleton";
import { SAVED_PRESETS } from "../components/library/QuickFilterPresets";
import { filterLibraryEntries, sortLibraryEntries } from "../features/library/libraryFilters";
import { useLibraryFilters } from "../features/library/useLibraryFilters";
import { useSavedQuery } from "../features/library/useSavedQuery";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";
import { useProfile } from "../features/auth/useProfile";
import { SignInPrompt } from "../components/auth/SignInPrompt";

export function SavedPage() {
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const { isAuthenticated } = useProfile();
  const { data: entries, isLoading, error } = useSavedQuery();
  const { filters, sortBy, sortDirection, updateFilters, updateSort, clearFilters } =
    useLibraryFilters();

  if (!isAuthenticated) {
    return (
      <SignInPrompt
        title="Save Your Favorites"
        description="Sign in to save games you're interested in and keep track of what's on your radar. Your saved list will be waiting for you across all your devices."
      />
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader
          className="mb-3 md:mb-4"
          eyebrow="On Your Radar"
          title={<>Your <span className="text-primary">Saved</span> Games</>}
          description="Loading saved games..."
        />
        <div className="mb-4 flex items-center gap-2">
          <div className="h-11 flex-1 rounded-full border border-outline-variant/20 bg-surface-container-low/70 backdrop-blur-sm">
            <div className="h-full w-full animate-pulse rounded-full bg-surface-container-high/40" />
          </div>
          <div className="h-11 w-11 rounded-full border border-outline-variant/20 bg-surface-container-low/70 backdrop-blur-sm">
            <div className="h-full w-full animate-pulse rounded-full bg-surface-container-high/40" />
          </div>
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
      <PageHeader
        className="mb-3 md:mb-4"
        eyebrow="On Your Radar"
        title={<>Your <span className="text-primary">Saved</span> Games</>}
        description="Games you're interested in trying. Save titles to explore later and keep track of what's on your radar."
      />

      <div className="library-search-section mb-8">
        <FilterBar
          filters={filters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onFiltersChange={updateFilters}
          onSortChange={updateSort}
          onClearFilters={clearFilters}
          presets={SAVED_PRESETS}
          searchPlaceholder="Search saved games..."
        />
      </div>

      <LibraryList entries={sortedEntries} totalCount={entries?.length ?? 0} cardContext="saved" getGameLinkState={() => ({ from: "/saved" })} />
      <FloatingActionButton onClick={() => setIsAddGameOpen(true)} />
      <AddGameWizardOverlay
        isOpen={isAddGameOpen}
        defaultState={{ isSaved: true, isLoved: false, isInCollection: false }}
        onClose={() => setIsAddGameOpen(false)}
      />
    </>
  );
}
