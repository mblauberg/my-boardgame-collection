import type { Game } from "../../types/domain";
import { GameCard } from "./GameCard";

type GameListProps = {
  games: Game[];
};

export function GameList({ games }: GameListProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No games found matching your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
