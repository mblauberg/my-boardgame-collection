import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { AddGameWizardOverlay } from "./AddGameWizardOverlay";
import { FilterBar } from "./FilterBar";
import { LibraryList } from "./LibraryList";
import { FloatingActionButton } from "../layout/FloatingActionButton";
import { PageHeader } from "../layout/PageHeader";
import { GameCardSkeleton } from "../ui/GameCardSkeleton";
import { ErrorStatePanel } from "../ui/ErrorStatePanel";
import { filterLibraryEntries, sortLibraryEntries } from "../../features/library/libraryFilters";
import { useLibraryFilters } from "../../features/library/useLibraryFilters";
import { getSignInRouteState } from "../../features/auth/signInNavigation";
import { useProfile } from "../../features/auth/useProfile";
import { getSupabaseQueryErrorMessage } from "../../lib/supabase/runtimeErrors";
import type { LibraryEntry } from "../../features/library/library.types";
import type { LibraryFilters } from "../../features/library/libraryFilters";

type OwnedLibraryPageProps = {
  data: LibraryEntry[] | undefined;
  isLoading: boolean;
  error: unknown;
  header: {
    eyebrow: string;
    title: ReactNode;
    description: string;
    loadingDescription: string;
    errorTitle: string;
    errorContext: string;
  };
  guestMessage: string;
  presets: Array<{ label: string; filters: Partial<LibraryFilters> }>;
  searchPlaceholder: string;
  cardContext: "collection" | "saved";
  addGameDefaultState: {
    isSaved: boolean;
    isLoved: boolean;
    isInCollection: boolean;
  };
  getGameLinkState: () => { from: string };
  extraContent?: ReactNode;
};

function LoadingState({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
}) {
  return (
    <>
      <PageHeader
        className="mb-3 md:mb-4"
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <div className="mb-4 flex justify-end gap-2">
        <div className="h-14 w-14 animate-pulse rounded-full bg-surface-container-high/30" />
        <div className="h-14 w-14 animate-pulse rounded-full bg-surface-container-high/30" />
      </div>
      <div className="editorial-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <GameCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
}

export function OwnedLibraryPage({
  data,
  isLoading,
  error,
  header,
  guestMessage,
  presets,
  searchPlaceholder,
  cardContext,
  addGameDefaultState,
  getGameLinkState,
  extraContent,
}: OwnedLibraryPageProps) {
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const { isAuthenticated } = useProfile();
  const location = useLocation();
  const { filters, sortBy, sortDirection, updateFilters, updateSort, clearFilters } =
    useLibraryFilters();

  if (isLoading) {
    return (
      <LoadingState
        eyebrow={header.eyebrow}
        title={header.title}
        description={header.loadingDescription}
      />
    );
  }

  if (error) {
    return (
      <ErrorStatePanel
        title={header.errorTitle}
        description={getSupabaseQueryErrorMessage(error, header.errorContext)}
      />
    );
  }

  const filteredEntries = filterLibraryEntries(data ?? [], filters);
  const sortedEntries = sortLibraryEntries(filteredEntries, sortBy, sortDirection);

  return (
    <>
      <PageHeader
        className="mb-3 md:mb-4"
        eyebrow={header.eyebrow}
        title={header.title}
        description={header.description}
      />

      {!isAuthenticated && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-on-surface">
          <span>{guestMessage}</span>
          <Link
            to="/signin"
            state={getSignInRouteState(location)}
            className="shrink-0 font-semibold text-primary hover:underline"
          >
            Sign in to sync
          </Link>
        </div>
      )}

      {extraContent}

      <div className="library-search-section mb-8">
        <FilterBar
          filters={filters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onFiltersChange={updateFilters}
          onSortChange={updateSort}
          onClearFilters={clearFilters}
          presets={presets}
          searchPlaceholder={searchPlaceholder}
        />
      </div>

      <LibraryList
        entries={sortedEntries}
        totalCount={data?.length ?? 0}
        cardContext={cardContext}
        getGameLinkState={getGameLinkState}
      />
      <FloatingActionButton onClick={() => setIsAddGameOpen(true)} />
      <AddGameWizardOverlay
        isOpen={isAddGameOpen}
        defaultState={addGameDefaultState}
        onClose={() => setIsAddGameOpen(false)}
      />
    </>
  );
}
