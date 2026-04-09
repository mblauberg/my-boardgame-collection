type ScenarioCoverageBadgeProps = {
  ownedCount: number;
  buyCount: number;
  recCount: number;
};

export function ScenarioCoverageBadge({ ownedCount, buyCount, recCount }: ScenarioCoverageBadgeProps) {
  const total = ownedCount + buyCount + recCount;

  if (total === 0) {
    return <span className="text-sm text-on-surface-variant">No matches</span>;
  }

  return (
    <div className="flex gap-2 text-sm">
      {ownedCount > 0 && (
        <span className="text-secondary">
          {ownedCount} owned
        </span>
      )}
      {buyCount > 0 && (
        <span className="text-primary">
          {buyCount} to buy
        </span>
      )}
      {recCount > 0 && (
        <span className="text-primary-container">
          {recCount} rec
        </span>
      )}
    </div>
  );
}
