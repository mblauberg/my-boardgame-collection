import type { Game } from "../../types/domain";

type GameDetailPanelProps = {
  game: Game;
};

export function GameDetailPanel({ game }: GameDetailPanelProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-3 gap-6">
        {game.imageUrl && (
          <div className="md:col-span-1">
            <img
              src={game.imageUrl}
              alt={game.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        <div className="md:col-span-2 space-y-4">
          <div>
            <span className="text-sm text-gray-500 uppercase">{game.status}</span>
            <h1 className="text-4xl font-bold mt-1">{game.name}</h1>
            {game.publishedYear && (
              <p className="text-gray-600">Published: {game.publishedYear}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {game.bggRating && (
              <div>
                <span className="text-sm text-gray-500">BGG Rating</span>
                <p className="text-xl font-semibold">{game.bggRating.toFixed(1)}</p>
              </div>
            )}
            {game.bggWeight && (
              <div>
                <span className="text-sm text-gray-500">Weight</span>
                <p className="text-xl font-semibold">{game.bggWeight.toFixed(1)}</p>
              </div>
            )}
            {game.playersMin && game.playersMax && (
              <div>
                <span className="text-sm text-gray-500">Players</span>
                <p className="text-xl font-semibold">
                  {game.playersMin}-{game.playersMax}
                </p>
              </div>
            )}
            {game.playTimeMin && game.playTimeMax && (
              <div>
                <span className="text-sm text-gray-500">Play Time</span>
                <p className="text-xl font-semibold">
                  {game.playTimeMin}-{game.playTimeMax} min
                </p>
              </div>
            )}
          </div>

          {game.bggUrl && (
            <a
              href={game.bggUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 hover:underline"
            >
              View on BoardGameGeek
            </a>
          )}

          {game.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: tag.colour || "#e5e7eb" }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {game.summary && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-3">Summary</h2>
          <p className="text-gray-700 leading-relaxed">{game.summary}</p>
        </div>
      )}

      {game.notes && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-3">Notes</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {game.notes}
          </p>
        </div>
      )}

      {game.recommendationVerdict && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-3">Recommendation</h2>
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: game.recommendationColour || "#f3f4f6",
            }}
          >
            <p className="text-gray-800">{game.recommendationVerdict}</p>
            {game.gapReason && (
              <p className="text-sm text-gray-600 mt-2">Gap: {game.gapReason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
