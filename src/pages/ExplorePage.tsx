import { useState, useEffect, useRef } from "react";
import { FloatingActionButton } from "../components/layout/FloatingActionButton";
import { PageHeader } from "../components/layout/PageHeader";
import { ExploreShelf } from "../components/library/ExploreShelf";
import { HorizontalShelf } from "../components/library/HorizontalShelf";
import { DiscoverSection } from "../components/library/DiscoverSection";
import { LibraryList } from "../components/library/LibraryList";
import { GameCardSkeleton } from "../components/ui/GameCardSkeleton";
import { useExploreQuery } from "../features/library/useExploreQuery";
import { useExploreSearch } from "../features/library/useExploreSearch";
import { useExploreSearchContext } from "../features/library/ExploreSearchContext";
import { useLibraryQuery } from "../features/library/useLibraryQuery";
import { getLibraryEntryForGame } from "../features/library/libraryState";
import { useDebounce } from "../lib/utils/useDebounce";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

const HERO_SHELF_IDS = ["trending", "new-releases", "top-rated", "quick-wins"] as const;
const DISCOVER_SECTION_IDS = ["by-player-count", "by-mechanic", "hidden-gems", "gateway-to-strategy"] as const;
const EXPLORE_SHELF_IDS = [...HERO_SHELF_IDS, ...DISCOVER_SECTION_IDS] as const;

type ExploreSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

function ExploreSearchBar({ value, onChange }: ExploreSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (value) setIsExpanded(true);
  }, [value]);

  return (
    <div className="explore-search-section mb-8">
      <div className="relative flex items-center justify-end">
        <div
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? "w-full opacity-100" : "w-14 opacity-0 pointer-events-none"
          }`}
        >
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
            ref={inputRef}
            id="explore-search"
            aria-label="Search game catalog"
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={() => !value && setIsExpanded(false)}
            placeholder="Search all games..."
            className="w-full rounded-full border border-outline-variant/20 bg-surface-container-low/70 py-3 pl-10 pr-4 text-base text-on-surface backdrop-blur-sm outline-none transition focus:border-primary-container focus:shadow-[0_0_10px_rgba(255,145,0,0.2)]"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-label="Open search"
          className={`group flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-low/70 backdrop-blur-sm transition hover:border-primary/30 hover:bg-surface-container-high/70 hover:shadow-[0_0_15px_rgba(255,145,0,0.15)] ${
            isExpanded ? "opacity-0 pointer-events-none absolute right-0" : "opacity-100"
          }`}
        >
          <span className="material-symbols-outlined text-3xl text-on-surface transition group-hover:text-primary">
            search
          </span>
        </button>
      </div>
    </div>
  );
}

export function ExplorePage() {
  const { query, setQuery } = useExploreSearchContext();
  const [localQuery, setLocalQuery] = useState(query);
  const debouncedQuery = useDebounce(localQuery, 300);
  const { data, isLoading, error } = useExploreQuery(EXPLORE_SHELF_IDS);
  const { data: searchResults, isLoading: isSearching, error: searchError } = useExploreSearch(debouncedQuery);
  const { data: libraryEntries } = useLibraryQuery();

  useEffect(() => {
    setQuery(debouncedQuery);
  }, [debouncedQuery, setQuery]);

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
          title={<>Find Your Next<br className="hidden md:block" /> <span className="text-primary">Big Thing</span></>}
          description="Loading curated shelves..."
        />
        <div className="mb-8 flex justify-end">
          <div className="h-14 w-14 animate-pulse rounded-full bg-surface-container-high/30" />
        </div>
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
      <div className="rounded-3xl border border-red-200 bg-red-50/80 p-8 text-center text-red-900">
        <p className="text-lg font-semibold">Explore unavailable</p>
        <p className="mt-2 text-sm leading-6">
          {getSupabaseQueryErrorMessage(error ?? searchError, "explore")}
        </p>
      </div>
    );
  }

  if (isSearchActive) {
    return (
      <>
        <PageHeader
          className="mb-3 md:mb-4"
          eyebrow={isSearching ? "Searching..." : "Search Results"}
          title={
            isSearching ? (
              <>Searching...</>
            ) : (
              <>
                {searchResults?.length ?? 0}{" "}
                {(searchResults?.length ?? 0) === 1 ? "Game" : "Games"} Found
              </>
            )
          }
          description={`Showing results for "${debouncedQuery}"`}
        />

        <ExploreSearchBar value={localQuery} onChange={setLocalQuery} />

        {isSearching ? (
          <div className="editorial-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <LibraryList
            entries={(searchResults ?? []).map((game) => {
              const entry = getLibraryEntryForGame(libraryEntries, game.id);
              return {
                id: entry?.id ?? `explore-${game.id}`,
                accountId: entry?.accountId,
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
        )}

        <FloatingActionButton />
      </>
    );
  }

  const heroShelves = data?.shelves.filter((shelf) =>
    (HERO_SHELF_IDS as readonly string[]).includes(shelf.id)
  ) ?? [];

  const discoverSections = data?.shelves.filter((shelf) =>
    (DISCOVER_SECTION_IDS as readonly string[]).includes(shelf.id)
  ) ?? [];

  return (
    <>
      <PageHeader
        className="mb-3 md:mb-4"
        eyebrow="Discovery"
        title={<>Find Your Next<br className="hidden md:block" /> <span className="text-primary">Big Thing</span></>}
        description="Curated shelves organized by mood, occasion, and player count. Discover the perfect game for any moment."
      />

      <ExploreSearchBar value={localQuery} onChange={setLocalQuery} />

      <div className="mb-20">
        {heroShelves.map((shelf) =>
          shelf.id === "new-releases" ? (
            <HorizontalShelf
              key={shelf.id}
              title={shelf.title}
              description={shelf.description}
              entries={shelf.entries}
            />
          ) : (
            shelf.entries.length > 0 && (
              <ExploreShelf
                key={shelf.id}
                title={shelf.title}
                entries={shelf.entries}
              />
            )
          )
        )}
      </div>

      <div className="mb-16">
        <div className="mb-8">
          <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-on-surface">
            Discover More
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">
            Dive deeper into specific mechanics, player counts, and hidden treasures.
          </p>
        </div>

        {discoverSections.map((shelf) => (
          <DiscoverSection
            key={shelf.id}
            title={shelf.title}
            emoji={shelf.emoji}
            description={shelf.description}
            shelves={shelf.sections.map((section) => ({
              id: section.id,
              title: section.label,
              description: section.description,
              entries: section.games,
            }))}
          />
        ))}
      </div>

      <FloatingActionButton />
    </>
  );
}
