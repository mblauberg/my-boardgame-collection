import { useState, useEffect } from "react";
import { FloatingActionButton } from "../components/layout/FloatingActionButton";
import { PageHeader } from "../components/layout/PageHeader";
import { GameCardSkeleton } from "../components/ui/GameCardSkeleton";
import { ExploreShelf } from "../components/library/ExploreShelf";
import { DiscoverSection } from "../components/library/DiscoverSection";
import { HorizontalShelf } from "../components/library/HorizontalShelf";
import { LibraryList } from "../components/library/LibraryList";
import { useExploreQuery } from "../features/library/useExploreQuery";
import { useExploreSearch } from "../features/library/useExploreSearch";
import { useExploreSearchContext } from "../features/library/ExploreSearchContext";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";
import { useLibraryQuery } from "../features/library/useLibraryQuery";
import { getLibraryEntryForGame } from "../features/library/libraryState";
import { useDebounce } from "../lib/utils/useDebounce";

const HERO_SHELF_IDS = ['trending', 'new-releases', 'top-rated', 'quick-wins'];
const DISCOVER_SECTION_IDS = ['by-player-count', 'by-mechanic', 'hidden-gems', 'gateway-to-strategy'];
const SKIP_SHELF_IDS = ['for-you']; // Skip until we have user library data
const EXPLORE_SHELF_IDS = [...HERO_SHELF_IDS, ...DISCOVER_SECTION_IDS];

type ExploreSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

function ExploreSearchBar({ value, onChange }: ExploreSearchBarProps) {
  return (
    <div className="explore-search-section mb-8">
      <div className="relative">
        <span
          aria-hidden="true"
          className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-lg text-on-surface-variant"
        >
          search
        </span>
        <label htmlFor="explore-search" className="sr-only">
          Search game catalog
        </label>
        <input
          id="explore-search"
          aria-label="Search game catalog"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search all games..."
          className="w-full rounded-full border border-outline-variant/20 bg-surface-container-low/70 py-3 pl-10 pr-4 text-base text-on-surface backdrop-blur-sm outline-none transition focus:border-primary-container focus:shadow-[0_0_10px_rgba(255,145,0,0.2)]"
        />
      </div>
    </div>
  );
}

function SearchBarSkeleton() {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="h-11 flex-1 rounded-full border border-outline-variant/20 bg-surface-container-low/70 backdrop-blur-sm">
        <div className="h-full w-full animate-pulse rounded-full bg-surface-container-high/40" />
      </div>
      <div className="h-11 w-11 rounded-full border border-outline-variant/20 bg-surface-container-low/70 backdrop-blur-sm">
        <div className="h-full w-full animate-pulse rounded-full bg-surface-container-high/40" />
      </div>
    </div>
  );
}

export function ExplorePage() {
  const { query, setQuery } = useExploreSearchContext();
  const [localQuery, setLocalQuery] = useState(query);
  const debouncedQuery = useDebounce(localQuery, 1000);
  const { data, isLoading, error } = useExploreQuery(EXPLORE_SHELF_IDS);
  const { data: searchResults, isLoading: isSearching, error: searchError } = useExploreSearch(debouncedQuery);
  const { data: libraryEntries } = useLibraryQuery();

  // Sync debounced query to context
  useEffect(() => {
    setQuery(debouncedQuery);
  }, [debouncedQuery, setQuery]);

  // Sync with context
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const isSearchActive = debouncedQuery.trim().length > 0;

  if (isLoading) {
    return (
      <>
        <PageHeader
          className="mb-3 md:mb-4"
          eyebrow="Discovery"
          title={<>Find Your Next <br className="hidden sm:block" /><span className="text-primary">Big Thing</span></>}
          description="Loading curated shelves..."
        />
        <SearchBarSkeleton />
        <div className="editorial-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  if (error || searchError) {
    return (
      <div className="rounded-3xl border border-error/20 bg-error/10 p-8 text-center text-on-surface">
        <p className="text-lg font-semibold">Explore unavailable</p>
        <p className="mt-2 text-sm leading-6">
          {getSupabaseQueryErrorMessage(error || searchError, "explore")}
        </p>
      </div>
    );
  }

  if (isSearchActive) {
    if (isSearching) {
      return (
        <>
          <PageHeader
            className="mb-3 md:mb-4"
            eyebrow="Search Results"
            title="Searching..."
            description={`Looking for "${debouncedQuery}"`}
          />
          <SearchBarSkeleton />
          <div className="editorial-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        </>
      );
    }

    if (searchResults) {
      return (
        <>
          <PageHeader
            className="mb-3 md:mb-4"
            eyebrow="Search Results"
            title={<>{searchResults.length} {searchResults.length === 1 ? "Game" : "Games"} Found</>}
            description={`Showing results for "${debouncedQuery}"`}
          />

          <ExploreSearchBar
            value={localQuery}
            onChange={setLocalQuery}
          />

          <LibraryList 
            entries={searchResults.map(game => {
              const entry = getLibraryEntryForGame(libraryEntries, game.id);
              return {
                id: entry?.id ?? `explore-${game.id}`,
                userId: entry?.userId ?? "",
                gameId: game.id,
                game,
                isSaved: entry?.isSaved ?? false,
                isLoved: entry?.isLoved ?? false,
                isInCollection: entry?.isInCollection ?? false,
                sentiment: entry?.sentiment ?? null,
                notes: entry?.notes ?? null,
                priority: entry?.priority ?? null,
                sharedTags: game.tags,
                userTags: entry?.userTags ?? [],
              };
            })} 
            getGameLinkState={() => ({ from: "/explore" })} 
          />
        </>
      );
    }
  }

  const heroShelves = data?.shelves.filter(shelf => 
    HERO_SHELF_IDS.includes(shelf.id) && !SKIP_SHELF_IDS.includes(shelf.id)
  ) ?? [];
  const discoverSections = data?.shelves.filter(shelf => 
    DISCOVER_SECTION_IDS.includes(shelf.id) && !SKIP_SHELF_IDS.includes(shelf.id)
  ) ?? [];

  return (
    <>
      <PageHeader
        className="mb-3 md:mb-4"
        eyebrow="Discovery"
        title={<>Find Your Next <br className="hidden sm:block" /><span className="text-primary">Big Thing</span></>}
        description="Curated shelves organized by player count, mood, and occasion. Each collection is designed to help you discover the perfect game for any moment."
      />

      <ExploreSearchBar
        value={localQuery}
        onChange={setLocalQuery}
      />

      {/* Hero Shelves */}
      <div className="mb-20">
        {heroShelves.map((shelf) => (
          shelf.id === "new-releases" ? (
            <HorizontalShelf
              key={shelf.id}
              title={shelf.title}
              description={shelf.description}
              entries={shelf.entries}
            />
          ) : (
            <ExploreShelf 
              key={shelf.id} 
              title={shelf.title} 
              description={shelf.description}
              entries={shelf.entries} 
            />
          )
        ))}
      </div>

      {/* Discover More Section */}
      <div className="mb-16">
        <div className="mb-8">
          <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-on-surface">
            Discover More
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">
            Dive deeper into specific mechanics, player counts, and hidden treasures.
          </p>
        </div>

        {discoverSections.map((section) => {
          const shelves = section.sections?.map(s => ({
            id: s.id,
            title: s.label,
            description: s.description,
            entries: s.games ?? [],
          })) ?? [];

          return (
            <DiscoverSection
              key={section.id}
              title={section.title}
              emoji={section.emoji}
              description={section.description}
              shelves={shelves}
            />
          );
        })}
      </div>
    </>
  );
}
