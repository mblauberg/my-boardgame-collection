import { Link } from 'react-router-dom';
import type { ScenarioGame } from '../../config/scenarioPresets';

type ScenarioGameRowProps = {
  game: ScenarioGame;
};

export function ScenarioGameRow({ game }: ScenarioGameRowProps) {
  const statusColors = {
    owned: 'text-green-700',
    buy: 'text-blue-700',
    new_rec: 'text-purple-700',
    cut: 'text-gray-500',
    archived: 'text-gray-400',
  };

  const players = game.players_min && game.players_max
    ? game.players_min === game.players_max
      ? `${game.players_min}p`
      : `${game.players_min}-${game.players_max}p`
    : null;

  const time = game.play_time_min && game.play_time_max
    ? game.play_time_min === game.play_time_max
      ? `${game.play_time_min}m`
      : `${game.play_time_min}-${game.play_time_max}m`
    : null;

  const weight = game.bgg_weight ? `${game.bgg_weight.toFixed(1)}` : null;

  return (
    <div className="flex items-center justify-between border-b border-gray-200 py-2 last:border-0">
      <div className="flex-1">
        <Link to={`/game/${game.slug}`} className="font-medium text-blue-600 hover:underline">
          {game.name}
        </Link>
        <div className="mt-1 flex gap-3 text-sm text-gray-600">
          <span className={statusColors[game.status]}>{game.status}</span>
          {players && <span>{players}</span>}
          {time && <span>{time}</span>}
          {weight && <span>wt {weight}</span>}
        </div>
        {game.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {game.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
