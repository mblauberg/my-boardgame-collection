import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { getSignInRouteState } from "../features/auth/signInNavigation";

export function SavedPage() {
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const { isAuthenticated } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: entries, isLoading, error } = useSavedQuery();
  const { filters, sortBy, sortDirection, updateFilters, updateSort, clearFilters } =
    useLibraryFilters();

  if (isLoading) {
    return (
      <>
        <PageHeader
          className="mb-3 md:mb-4"
          eyebrow="On Your Radar"
          title={<>Your <span className="text-primary">Saved</span> Games</>}
          description="Loading saved games..."
        />
        <div className="mb-4 flex justify-end gap-2">
          <div className="h-14 w-14 rounded-full bg-surface-container-high/30 animate-pulse" />
          <div className="h-14 w-14 rounded-full bg-surface-container-high/30 animate-pulse" />
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

      {!isAuthenticated && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-on-surface">
          <span>You're browsing as a guest. Your saves are stored locally on this device.</span>
          <Link
            to="/signin"
            state={getSignInRouteState(location)}
            className="shrink-0 font-semibold text-primary hover:underline"
          >
            Sign in to sync
          </Link>
        </div>
      )}

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
      <FloatingActionButton
        onClick={
          isAuthenticated
            ? () => setIsAddGameOpen(true)
            : () => navigate("/signin", { state: getSignInRouteState(location) })
        }
      />
      {isAuthenticated && (
        <AddGameWizardOverlay
          isOpen={isAddGameOpen}
          defaultState={{ isSaved: true, isLoved: false, isInCollection: false }}
          onClose={() => setIsAddGameOpen(false)}
        />
      )}
    </>
  );
}
