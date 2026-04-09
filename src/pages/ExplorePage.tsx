import { FloatingActionButton } from "../components/layout/FloatingActionButton";
import { ExploreShelf } from "../components/library/ExploreShelf";
import { DiscoverSection } from "../components/library/DiscoverSection";
import { HorizontalShelf } from "../components/library/HorizontalShelf";
import { LibraryList } from "../components/library/LibraryList";
import { useExploreQuery } from "../features/library/useExploreQuery";
import { useExploreSearch } from "../features/library/useExploreSearch";
import { useExploreSearchContext } from "../features/library/ExploreSearchContext";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

const HERO_SHELF_IDS = ['trending', 'new-releases', 'top-rated', 'quick-wins'];
const DISCOVER_SECTION_IDS = ['by-player-count', 'by-mechanic', 'hidden-gems', 'gateway-to-strategy'];
const SKIP_SHELF_IDS = ['for-you']; // Skip until we have user library data
const EXPLORE_SHELF_IDS = [...HERO_SHELF_IDS, ...DISCOVER_SECTION_IDS];

export function ExplorePage() {
  const { query } = useExploreSearchContext();
  const { data, isLoading, error } = useExploreQuery(EXPLORE_SHELF_IDS);
  const { data: searchResults, isLoading: isSearching, error: searchError } = useExploreSearch(query);

  const isSearchActive = query.trim().length > 0;

  if (isLoading || (isSearchActive && isSearching)) {
    return <div className="p-8 text-center">Loading explore shelves...</div>;
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

  if (isSearchActive && searchResults) {
    return (
      <>
        <header className="mb-12">
          <div className="rounded-3xl bg-surface-container-low p-12 md:p-16">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Search Results
            </p>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.1] tracking-tight text-on-surface md:text-7xl">
              {searchResults.length} {searchResults.length === 1 ? "Game" : "Games"} Found
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
              Showing results for "{query}"
            </p>
          </div>
        </header>

        <LibraryList 
          entries={searchResults.map(game => ({
            id: `explore-${game.id}`,
            userId: "",
            gameId: game.id,
            game,
            isSaved: false,
            isLoved: false,
            isInCollection: false,
            sentiment: null,
            notes: null,
            priority: null,
            sharedTags: game.tags,
            userTags: [],
          }))} 
          getGameLinkState={() => ({ from: "/explore" })} 
        />
      </>
    );
  }

  const heroShelves = data?.shelves.filter(shelf => 
    HERO_SHELF_IDS.includes(shelf.id) && !SKIP_SHELF_IDS.includes(shelf.id)
  ) ?? [];
  const discoverSections = data?.shelves.filter(shelf => 
    DISCOVER_SECTION_IDS.includes(shelf.id) && !SKIP_SHELF_IDS.includes(shelf.id)
  ) ?? [];

  return (
    <>
      <header className="mb-10 md:mb-16">
        <div className="bg-surface-container-low rounded-3xl p-6 md:p-12 lg:p-16">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary md:mb-3">
            Discovery
          </p>
          <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-on-surface md:text-5xl lg:text-7xl leading-[1.1]">
            Find Your Next <span className="text-primary">Obsession</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-on-surface-variant leading-relaxed md:mt-6 md:text-lg">
            Curated shelves organized by player count, mood, and occasion. 
            Each collection is designed to help you discover the perfect game for any moment.
          </p>
        </div>
      </header>

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
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-3">
            Discover More
          </h2>
          <p className="text-base text-on-surface-variant leading-relaxed max-w-2xl">
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
