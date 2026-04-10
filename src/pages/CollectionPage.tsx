import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useProfile } from "../features/auth/useProfile";
import { getSignInRouteState } from "../features/auth/signInNavigation";

export function CollectionPage() {
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const { isAuthenticated } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: entries, isLoading, error } = useCollectionQuery();
  const { filters, sortBy, sortDirection, updateFilters, updateSort, clearFilters } =
    useLibraryFilters();

  if (isLoading) {
    return (
      <>
        <PageHeader
          className="mb-3 md:mb-4"
          eyebrow="Curated Collection"
          title={<>Your <span className="text-primary">Collection</span></>}
          description="Loading your collection..."
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
        className="mb-3 md:mb-4"
        eyebrow="Curated Collection"
        title={<>Your <span className="text-primary">Collection</span></>}
        description="Games you own and love. Build your personal library and track the titles that make it to your shelf."
      />

      {!isAuthenticated && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-on-surface">
          <span>You're browsing as a guest. Your collection is stored locally on this device.</span>
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
          presets={COLLECTION_PRESETS}
          searchPlaceholder="Search your collection..."
        />
      </div>

      <LibraryList entries={sortedEntries} totalCount={entries?.length ?? 0} cardContext="collection" getGameLinkState={() => ({ from: "/" })} />
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
          defaultState={{ isSaved: false, isLoved: false, isInCollection: true }}
          onClose={() => setIsAddGameOpen(false)}
        />
      )}
    </>
  );
}
