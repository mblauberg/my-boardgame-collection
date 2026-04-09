import type { Game } from "../../types/domain";

type GameCardProps = {
  game: Game;
};

export function GameCard({ game }: GameCardProps) {
  return (
    <a
      href={`/game/${game.slug}`}
      className="block rounded-lg border border-outline-variant/15 bg-surface-container-lowest p-4 transition-shadow hover:shadow-lg"
    >
      {game.imageUrl && (
        <img
          src={game.imageUrl}
          alt=""
          className="w-full h-48 object-cover rounded mb-3"
        />
      )}
      <h3 className="font-semibold text-lg mb-1">{game.name}</h3>
      {game.bggRating && (
        <p className="text-sm text-on-surface-variant">Rating: {game.bggRating.toFixed(1)}</p>
      )}
      {game.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-1 rounded"
              style={{ backgroundColor: tag.colour || "var(--surface-container-highest)" }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
