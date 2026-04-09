import type { AddGameWizardCollectionInfo } from "./addGameWizard.types";

type AddGameCollectionInfoStepProps = {
  value: AddGameWizardCollectionInfo;
  onChange: (value: AddGameWizardCollectionInfo) => void;
  submitError: string | null;
  isAuthenticated: boolean;
};

const sentimentOptions = [
  { value: "like", label: "Like" },
  { value: "neutral", label: "Neutral" },
  { value: "dislike", label: "Dislike" },
] as const;

const stateOptions = [
  { key: "isSaved", label: "Saved" },
  { key: "isLoved", label: "Loved" },
  { key: "isInCollection", label: "In Collection" },
] as const;

export function AddGameCollectionInfoStep({
  value,
  onChange,
  submitError,
  isAuthenticated,
}: AddGameCollectionInfoStepProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Library state</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
          Choose which states apply to this game and add any personal context you want to keep with it.
        </p>
      </div>

      <div className="space-y-6">
        <fieldset>
          <legend className="text-sm font-semibold text-on-surface">Apply states</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {stateOptions.map((option) => {
              const checked = value[option.key];

              return (
                <label
                  key={option.key}
                  className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
                    checked
                      ? "border-primary/30 bg-surface-container-high text-on-surface"
                      : "border-outline/10 bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  <input
                    type="checkbox"
                    name={option.key}
                    aria-label={option.label}
                    checked={checked}
                    onChange={() => onChange({ ...value, [option.key]: !checked })}
                    className="sr-only"
                  />
                  <span className="text-base font-bold">{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-on-surface">Sentiment</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {sentimentOptions.map((option) => {
              const checked = value.sentiment === option.value;

              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    checked
                      ? "border-primary/30 bg-primary text-on-primary"
                      : "border-outline/15 bg-surface-container-low text-on-surface"
                  }`}
                >
                  <input
                    type="radio"
                    name="sentiment"
                    value={option.value}
                    checked={checked}
                    onChange={() => onChange({ ...value, sentiment: option.value })}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-sm font-semibold text-on-surface">Notes</span>
          <textarea
            aria-label="Notes"
            value={value.notes}
            onChange={(event) => onChange({ ...value, notes: event.target.value })}
            rows={5}
            className="mt-3 w-full resize-none rounded-2xl border border-outline/15 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/30"
            placeholder="Optional notes about this game"
          />
        </label>

        {!isAuthenticated ? (
          <div className="rounded-2xl border border-error/20 bg-red-50 px-4 py-3 text-sm text-error">
            Sign in is required before you can save this game.
          </div>
        ) : null}

        {submitError ? (
          <div className="rounded-2xl border border-error/20 bg-red-50 px-4 py-3 text-sm text-error">
            {submitError}
          </div>
        ) : null}
      </div>
    </div>
  );
}
