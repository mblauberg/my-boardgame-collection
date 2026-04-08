type ScenarioCoverageBadgeProps = {
  ownedCount: number;
  buyCount: number;
  recCount: number;
};

export function ScenarioCoverageBadge({ ownedCount, buyCount, recCount }: ScenarioCoverageBadgeProps) {
  const total = ownedCount + buyCount + recCount;

  if (total === 0) {
    return <span className="text-sm text-gray-500">No matches</span>;
  }

  return (
    <div className="flex gap-2 text-sm">
      {ownedCount > 0 && (
        <span className="text-green-700">
          {ownedCount} owned
        </span>
      )}
      {buyCount > 0 && (
        <span className="text-blue-700">
          {buyCount} to buy
        </span>
      )}
      {recCount > 0 && (
        <span className="text-purple-700">
          {recCount} rec
        </span>
      )}
    </div>
  );
}
