import type { Game, GameStatus } from "../../types/domain";

type Props = {
  game: Game;
  isOwner: boolean;
  onEdit: (game: Game) => void;
  onPromote: (id: string, status: GameStatus) => void;
};

export function RecommendationCard({ game, isOwner, onEdit, onPromote }: Props) {
  const players =
    game.playersMin && game.playersMax
      ? `${game.playersMin}–${game.playersMax} players`
      : null;
  const time =
    game.playTimeMin && game.playTimeMax
      ? `${game.playTimeMin}–${game.playTimeMax} min`
      : null;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-lg">{game.name}</h3>
        {game.recommendationVerdict && (
          <span
            className="text-sm px-2 py-1 rounded shrink-0"
            style={{ backgroundColor: game.recommendationColour ?? "#e5e7eb" }}
          >
            {game.recommendationVerdict}
          </span>
        )}
      </div>

      {game.summary && (
        <p className="text-sm text-gray-700">{game.summary}</p>
      )}

      {game.notes && (
        <p className="text-sm text-gray-500 italic">{game.notes}</p>
      )}

      {game.gapReason && (
        <p className="text-sm text-blue-700">{game.gapReason}</p>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {game.category && <span>{game.category}</span>}
        {game.bggWeight && <span>Weight: {game.bggWeight}</span>}
        {players && <span>{players}</span>}
        {time && <span>{time}</span>}
      </div>

      {game.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {game.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: tag.colour ?? "#e5e7eb" }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {isOwner && (
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => onEdit(game)}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onPromote(game.id, "buy")}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
          >
            Move to Buy
          </button>
          <button
            type="button"
            onClick={() => onPromote(game.id, "owned")}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
          >
            Mark Owned
          </button>
        </div>
      )}
    </div>
  );
}
