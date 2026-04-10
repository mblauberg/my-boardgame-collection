import type { AddGameWizardSelectedGame } from "./addGameWizard.types";

type AddGameDetailsStepProps = {
  game: AddGameWizardSelectedGame;
  onChange: (updates: Partial<AddGameWizardSelectedGame>) => void;
};

export function AddGameDetailsStep({ game, onChange }: AddGameDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Game details</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Confirm details before adding <span className="font-semibold text-on-surface">{game.name}</span>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-on-surface">
          Custom image URL
          <input
            type="url"
            value={game.customImageUrl ?? ""}
            onChange={(event) => onChange({ customImageUrl: event.target.value || null })}
            placeholder="https://example.com/game-image.jpg"
            className="rounded-xl border border-outline/30 bg-surface px-3 py-2 text-on-surface"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-on-surface">
          Upload image
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              onChange({ customImageFile: event.target.files?.[0] ?? null })
            }
            className="rounded-xl border border-outline/30 bg-surface px-3 py-2 text-on-surface file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-on-primary"
          />
        </label>
      </div>
    </div>
  );
}
