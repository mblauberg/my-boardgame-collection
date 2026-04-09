import type { AddGameWizardSelectedGame } from "./addGameWizard.types";
import type { BggSearchSource } from "../../features/games/bgg.types";

type AddGameSearchStepProps = {
  query: string;
  onQueryChange: (value: string) => void;
  results: AddGameWizardSelectedGame[];
  source: BggSearchSource | null;
  selectedGameId: number | null;
  isLoading: boolean;
  errorMessage: string | null;
  onSelect: (game: AddGameWizardSelectedGame) => void;
};

function formatSourceDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function AddGameSearchStep({
  query,
  onQueryChange,
  results,
  source,
  selectedGameId,
  isLoading,
  errorMessage,
  onSelect,
}: AddGameSearchStepProps) {
  const showEmpty = query.trim().length >= 2 && !isLoading && !errorMessage && results.length === 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Find your game</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
          Search BoardGameGeek to import the game title, year, and any metadata already available.
        </p>
        {source?.kind === "snapshot" ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
            Using {source.label}
            {source.updatedAt ? ` • Updated ${formatSourceDate(source.updatedAt)}` : ""}
          </p>
        ) : null}
      </div>

      <label className="mb-6 block">
        <span className="sr-only">Search BoardGameGeek</span>
        <div className="flex items-center gap-3 rounded-2xl border border-outline/15 bg-surface-container-low px-4 py-3">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input
            type="search"
            aria-label="Search BoardGameGeek"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Type a game title"
            className="w-full border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-outline"
          />
        </div>
      </label>

      <div className="flex min-h-[16rem] flex-1 flex-col gap-3">
        {errorMessage ? (
          <div className="rounded-2xl border border-error/20 bg-error-container/20 px-4 py-3 text-sm text-error">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-outline/10 bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant">
            Searching BoardGameGeek...
          </div>
        ) : null}

        {showEmpty ? (
          <div className="rounded-2xl border border-outline/10 bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant">
            No matches yet. Try a different spelling or a shorter title.
          </div>
        ) : null}

        {results.map((game) => {
          const isSelected = game.id === selectedGameId;

          return (
            <button
              key={game.id}
              type="button"
              aria-label={`Select ${game.name}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(game)}
              className={`flex items-center gap-4 rounded-2xl border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-primary/30 bg-surface-container-high shadow-sm"
                  : "border-transparent bg-surface-container-low hover:border-outline/15"
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-surface-container">
                {game.imageUrl ? (
                  <img src={game.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant">stadia_controller</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-on-surface">{game.name}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                  {game.yearPublished ? (
                    <span className="rounded-full bg-secondary-fixed px-2 py-1 text-on-secondary-container">
                      {game.yearPublished}
                    </span>
                  ) : null}
                  <span>{source?.kind === "snapshot" ? "Local snapshot" : "BoardGameGeek"}</span>
                  {typeof game.bggRank === "number" ? <span>Rank #{game.bggRank}</span> : null}
                </div>
              </div>

              <span
                className={`material-symbols-outlined ${
                  isSelected ? "text-primary" : "text-outline-variant"
                }`}
              >
                {isSelected ? "check_circle" : "radio_button_unchecked"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
