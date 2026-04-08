import type { AddGameWizardSelectedGame } from "./addGameWizard.types";

type AddGameDetailsStepProps = {
  game: AddGameWizardSelectedGame;
};

function formatRange(min: number | null, max: number | null, suffix = "") {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) return `${min}-${max}${suffix}`;
  return `${min ?? max}${suffix}`;
}

export function AddGameDetailsStep({ game }: AddGameDetailsStepProps) {
  const players = formatRange(game.playersMin, game.playersMax);
  const playTime = formatRange(game.playTimeMin, game.playTimeMax, " min");

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Game details</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
          Confirm the imported metadata before you choose where to save it.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <div className="overflow-hidden rounded-[1.75rem] bg-surface-container-low shadow-card">
          {game.imageUrl ? (
            <img src={game.imageUrl} alt={game.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex min-h-72 items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl">stadia_controller</span>
            </div>
          )}
        </div>

        <div className="rounded-[1.75rem] bg-surface-container-low p-6 shadow-card">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Selected Game</p>
            <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface">{game.name}</h3>
            {game.yearPublished ? (
              <p className="mt-2 text-sm text-on-surface-variant">Published {game.yearPublished}</p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {players ? (
              <div className="rounded-2xl bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                  Players
                </p>
                <p className="mt-2 text-base font-bold text-on-surface">{players}</p>
              </div>
            ) : null}

            {playTime ? (
              <div className="rounded-2xl bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                  Play Time
                </p>
                <p className="mt-2 text-base font-bold text-on-surface">{playTime}</p>
              </div>
            ) : null}

            {game.averageRating !== null ? (
              <div className="rounded-2xl bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                  Rating
                </p>
                <p className="mt-2 text-base font-bold text-on-surface">{game.averageRating.toFixed(1)}</p>
              </div>
            ) : null}

            {game.averageWeight !== null ? (
              <div className="rounded-2xl bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                  Weight
                </p>
                <p className="mt-2 text-base font-bold text-on-surface">{game.averageWeight.toFixed(1)}</p>
              </div>
            ) : null}
          </div>

          {game.summary ? (
            <div className="mt-6 rounded-2xl bg-white/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                Summary
              </p>
              <p className="mt-3 text-sm leading-6 text-on-surface">{game.summary}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
