import type { Game, GameStatus } from "../../types/domain";
import { RecommendationCard } from "./RecommendationCard";

type Props = {
  games: Game[];
  isOwner: boolean;
  onEdit: (game: Game) => void;
  onPromote: (id: string, status: GameStatus) => void;
};

export function RecommendationList({ games, isOwner, onEdit, onPromote }: Props) {
  if (games.length === 0) {
    return <p className="text-gray-500">No recommendations yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {games.map((game) => (
        <li key={game.id}>
          <RecommendationCard
            game={game}
            isOwner={isOwner}
            onEdit={onEdit}
            onPromote={onPromote}
          />
        </li>
      ))}
    </ul>
  );
}
