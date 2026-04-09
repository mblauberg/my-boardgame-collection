import { ScenarioGameRow } from './ScenarioGameRow';
import { ScenarioCoverageBadge } from './ScenarioCoverageBadge';
import type { ScenarioGame } from '../../config/scenarioPresets';

type ScenarioSectionProps = {
  label: string;
  description: string;
  games: ScenarioGame[];
};

export function ScenarioSection({ label, description, games }: ScenarioSectionProps) {
  if (games.length === 0) return null;

  const ownedCount = games.filter((g) => g.status === 'owned').length;
  const buyCount = games.filter((g) => g.status === 'buy').length;
  const recCount = games.filter((g) => g.status === 'new_rec').length;

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-baseline justify-between">
        <h4 className="text-lg font-semibold">{label}</h4>
        <ScenarioCoverageBadge ownedCount={ownedCount} buyCount={buyCount} recCount={recCount} />
      </div>
      <p className="mb-3 text-sm text-on-surface-variant-variant">{description}</p>
      <div className="space-y-1">
        {games.map((game) => (
          <ScenarioGameRow key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
