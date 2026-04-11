import { useMemo } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { ExpandableSearchSection } from "../components/library/ExpandableSearchSection";
import { ExploreShelf } from "../components/library/ExploreShelf";
import { HorizontalShelf } from "../components/library/HorizontalShelf";
import { DiscoverSection } from "../components/library/DiscoverSection";
import { LibraryList } from "../components/library/LibraryList";
import { GameCardSkeleton } from "../components/ui/GameCardSkeleton";
import { ErrorStatePanel } from "../components/ui/ErrorStatePanel";
import { useExploreQuery } from "../features/library/useExploreQuery";
import { useExploreSearch } from "../features/library/useExploreSearch";
import { useExploreSearchContext } from "../features/library/ExploreSearchContext";
import { useLibraryQuery } from "../features/library/useLibraryQuery";
import { getLibraryEntryForGame } from "../features/library/libraryState";
import { useDebouncedTextInput } from "../lib/utils/useDebouncedTextInput";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

const HERO_SHELF_IDS = ["trending", "new-releases", "top-rated", "quick-wins"] as const;
const DISCOVER_SECTION_IDS = ["by-player-count", "by-mechanic", "hidden-gems", "gateway-to-strategy"] as const;
const EXPLORE_SHELF_IDS = [...HERO_SHELF_IDS, ...DISCOVER_SECTION_IDS] as const;

export function ExplorePage() {
  const { query, setQuery } = useExploreSearchContext();
  const { value: localQuery, setValue: setLocalQuery } = useDebouncedTextInput({
    value: query,
    delay: 300,
    onDebouncedChange: setQuery,
  });
  const { data, isLoading, error } = useExploreQuery(EXPLORE_SHELF_IDS);
  const { data: searchResults, isLoading: isSearching, error: searchError } = useExploreSearch(query);
  const { data: libraryEntries } = useLibraryQuery();
  const isSearchActive = query.trim().length > 0;
  const mappedSearchResults = useMemo(
    () =>
      (searchResults ?? []).map((game) => {
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
      }),
    [libraryEntries, searchResults],
  );

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
      <ErrorStatePanel
        title="Explore unavailable"
        description={getSupabaseQueryErrorMessage(error ?? searchError, "explore")}
      />
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
          description={`Showing results for "${query}"`}
        />

        <ExpandableSearchSection
          id="explore-search"
          value={localQuery}
          onChange={setLocalQuery}
          placeholder="Search all games..."
          inputLabel="Search game catalog"
          expandButtonLabel="Open search"
          sectionClassName="explore-search-section mb-8"
        />

        {isSearching ? (
          <div className="editorial-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <LibraryList
            entries={mappedSearchResults}
            getGameLinkState={() => ({ from: "/explore" })}
          />
        )}

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
        description="Curated shelves organised for you. Discover the perfect game for any moment."
      />

      <ExpandableSearchSection
        id="explore-search"
        value={localQuery}
        onChange={setLocalQuery}
        placeholder="Search all games..."
        inputLabel="Search game catalog"
        expandButtonLabel="Open search"
        sectionClassName="explore-search-section mb-8"
      />

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
    </>
  );
}
