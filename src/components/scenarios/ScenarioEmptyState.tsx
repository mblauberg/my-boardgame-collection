type ScenarioEmptyStateProps = {
  presetLabel: string;
};

export function ScenarioEmptyState({ presetLabel }: ScenarioEmptyStateProps) {
  return (
    <div className="py-8 text-center text-gray-500">
      <p>No games match the {presetLabel} scenario yet.</p>
      <p className="mt-2 text-sm">
        Check your buy list or recommendations for potential additions.
      </p>
    </div>
  );
}
