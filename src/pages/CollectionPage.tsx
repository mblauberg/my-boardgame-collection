import { useGamesQuery } from "../features/games/useGamesQuery";
import { useCollectionFilters } from "../features/games/useCollectionFilters";
import { filterGames, sortGames } from "../features/games/collectionFilters";
import { CollectionToolbar } from "../components/games/CollectionToolbar";
import { GameList } from "../components/games/GameList";

export function CollectionPage() {
  const { data: games, isLoading, error } = useGamesQuery();
  const { filters, sortBy, sortDirection } = useCollectionFilters();

  if (isLoading) {
    return <div className="p-8 text-center">Loading collection...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error loading games</div>;
  }

  const filteredGames = games ? filterGames(games, filters) : [];
  const sortedGames = sortGames(filteredGames, sortBy, sortDirection);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Board Game Collection</h1>
      <CollectionToolbar />
      <GameList games={sortedGames} />
    </div>
  );
}
