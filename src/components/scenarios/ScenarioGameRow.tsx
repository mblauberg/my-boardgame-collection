import { Link } from 'react-router-dom';
import type { ScenarioGame } from '../../config/scenarioPresets';

type ScenarioGameRowProps = {
  game: ScenarioGame;
};

export function ScenarioGameRow({ game }: ScenarioGameRowProps) {
  const statusColors = {
    owned: "text-secondary",
    buy: "text-primary",
    new_rec: "text-primary-container",
    cut: "text-on-surface-variant",
    archived: "text-on-surface-variant/70",
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
    <div className="flex items-center justify-between border-b border-outline-variant/15 py-2 last:border-0">
      <div className="flex-1">
        <Link to={`/game/${game.slug}`} className="font-medium text-primary hover:underline">
          {game.name}
        </Link>
        <div className="mt-1 flex gap-3 text-sm text-on-surface-variant">
          <span className={statusColors[game.status]}>{game.status}</span>
          {players && <span>{players}</span>}
          {time && <span>{time}</span>}
          {weight && <span>wt {weight}</span>}
        </div>
        {game.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {game.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-container-low px-2 py-0.5 text-xs text-on-surface"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
