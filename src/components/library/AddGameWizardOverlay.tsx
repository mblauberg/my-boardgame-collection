import { useEffect, useState } from "react";
import { useSession } from "../../features/auth/useSession";
import { useBggSearchQuery } from "../../features/games/useBggSearchQuery";
import { useSaveBggGameToLibrary } from "../../features/library/useLibraryEntryMutations";
import { AddGameCollectionInfoStep } from "./AddGameCollectionInfoStep";
import { AddGameSearchStep } from "./AddGameSearchStep";
import type {
  AddGameWizardCollectionInfo,
  AddGameWizardDefaultState,
  AddGameWizardSelectedGame,
} from "./addGameWizard.types";

type AddGameWizardOverlayProps = {
  isOpen: boolean;
  defaultState?: AddGameWizardDefaultState;
  onClose: () => void;
};

const stepLabels = ["Find your game", "Collection info"] as const;

function getInitialState(defaultState?: AddGameWizardDefaultState): AddGameWizardCollectionInfo {
  if (defaultState) {
    return {
      ...defaultState,
      sentiment: null,
      notes: "",
    };
  }

  return {
    isSaved: false,
    isLoved: false,
    isInCollection: true,
    sentiment: null,
    notes: "",
  };
}

function normalizeSearchResult(result: Record<string, unknown>): AddGameWizardSelectedGame {
  const id = Number(result.id);
  const name = String(result.name ?? "");
  const yearPublished =
    typeof result.yearPublished === "number" ? result.yearPublished : null;

  return {
    id,
    name,
    yearPublished,
    bggUrl:
      typeof result.bggUrl === "string"
        ? result.bggUrl
        : `https://boardgamegeek.com/boardgame/${id}`,
    imageUrl: typeof result.imageUrl === "string" ? result.imageUrl : null,
    playersMin: typeof result.playersMin === "number" ? result.playersMin : null,
    playersMax: typeof result.playersMax === "number" ? result.playersMax : null,
    playTimeMin: typeof result.playTimeMin === "number" ? result.playTimeMin : null,
    playTimeMax: typeof result.playTimeMax === "number" ? result.playTimeMax : null,
    averageRating: typeof result.averageRating === "number" ? result.averageRating : null,
    averageWeight: typeof result.averageWeight === "number" ? result.averageWeight : null,
    summary: typeof result.summary === "string" ? result.summary : null,
    bggRank: typeof result.bggRank === "number" ? result.bggRank : null,
    bggBayesAverage: typeof result.bggBayesAverage === "number" ? result.bggBayesAverage : null,
    bggUsersRated: typeof result.bggUsersRated === "number" ? result.bggUsersRated : null,
    isExpansion: typeof result.isExpansion === "boolean" ? result.isExpansion : null,
  };
}

export function AddGameWizardOverlay({
  isOpen,
  defaultState,
  onClose,
}: AddGameWizardOverlayProps) {
  const { user, isAuthenticated } = useSession();
  const { mutateAsync, isPending } = useSaveBggGameToLibrary();
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<AddGameWizardSelectedGame | null>(null);
  const [collectionInfo, setCollectionInfo] = useState<AddGameWizardCollectionInfo>(
    getInitialState(defaultState),
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const search = useBggSearchQuery(query);
  const results = Array.isArray(search.data?.results)
    ? search.data.results.map((result) => normalizeSearchResult(result as Record<string, unknown>))
    : [];

  useEffect(() => {
    if (!isOpen) return;

    setStep(1);
    setQuery("");
    setSelectedGame(null);
    setCollectionInfo(getInitialState(defaultState));
    setSubmitError(null);
  }, [isOpen, defaultState]);

  function handleClose() {
    setStep(1);
    setQuery("");
    setSelectedGame(null);
    setCollectionInfo(getInitialState(defaultState));
    setSubmitError(null);
    onClose();
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelectedGame(null);
    setSubmitError(null);
  }

  async function handleSubmit() {
    if (!user?.id || !selectedGame || isPending) return;

    try {
      setSubmitError(null);
      await mutateAsync({
        userId: user.id,
        selectedGame,
        isSaved: collectionInfo.isSaved,
        isLoved: collectionInfo.isLoved,
        isInCollection: collectionInfo.isInCollection,
        sentiment: collectionInfo.sentiment,
        notes: collectionInfo.notes,
      });
      handleClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save this game.");
    }
  }

  if (!isOpen) return null;

  const nextDisabled = (step === 1 && !selectedGame) || (step === 2 && (!user?.id || isPending));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-on-surface/20 backdrop-blur-sm md:px-4 md:py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add new game"
        className="flex h-full w-full flex-col overflow-hidden bg-surface-container-lowest shadow-[0_32px_80px_rgba(46,47,45,0.18)] md:h-auto md:max-h-[min(46rem,90vh)] md:max-w-4xl md:rounded-[2rem] lg:flex-row"
      >
        <aside className="bg-surface-container-low px-4 py-6 md:px-6 md:py-8 lg:w-64">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant-variant md:text-[11px]">
            Step {String(step).padStart(2, "0")} of 02
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-primary md:text-3xl">Add New Game</h1>

          <ol className="mt-6 space-y-3 md:mt-8 md:space-y-4">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1;
              const active = stepNumber === step;
              const complete = stepNumber < step;

              return (
                <li key={label} className="flex items-center gap-2 md:gap-3">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold md:h-6 md:w-6 ${
                      active || complete
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant-variant"
                    }`}
                  >
                    {stepNumber}
                  </span>
                  <span
                    className={`text-xs md:text-sm ${
                      active ? "font-bold text-on-surface" : "text-on-surface-variant-variant"
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </aside>

        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-6 md:min-h-[38rem] md:px-6 md:pt-8 sm:px-8">
          <div className="mb-4 flex justify-end md:mb-6">
            <button
              type="button"
              aria-label="Close add game wizard"
              onClick={handleClose}
              className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl">close</span>
            </button>
          </div>

          {step === 1 ? (
            <AddGameSearchStep
              query={query}
              onQueryChange={handleQueryChange}
              results={results}
              source={search.data?.source ?? null}
              selectedGameId={selectedGame?.id ?? null}
              isLoading={search.isLoading}
              errorMessage={search.error instanceof Error ? search.error.message : null}
              onSelect={(game) => setSelectedGame(game)}
            />
          ) : null}

          {step === 2 ? (
            <AddGameCollectionInfoStep
              value={collectionInfo}
              onChange={setCollectionInfo}
              submitError={submitError}
              isAuthenticated={isAuthenticated}
            />
          ) : null}

          <div className={`mt-6 flex items-center justify-between gap-3 border-t border-outline/10 pt-4 pb-6 md:mt-8 md:pt-6 md:pb-8 ${step === 1 && selectedGame ? 'sticky bottom-0 -mx-4 bg-surface-container-lowest px-4 md:-mx-6 md:px-6 sm:-mx-8 sm:px-8' : ''}`}>
            <button
              type="button"
              onClick={() => (step === 1 ? handleClose() : setStep((current) => current - 1))}
              className="rounded-full px-3 py-2 text-xs font-semibold text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface md:px-4 md:text-sm"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>

            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep((current) => current + 1)}
                disabled={nextDisabled}
                className="rounded-2xl bg-gradient-to-r from-primary to-primary-container px-5 py-2.5 text-xs font-bold text-on-primary shadow-lg shadow-primary/20 transition disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-3 md:text-sm"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={nextDisabled}
                className="rounded-2xl bg-gradient-to-r from-primary to-primary-container px-5 py-2.5 text-xs font-bold text-on-primary shadow-lg shadow-primary/20 transition disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-3 md:text-sm"
              >
                {isPending ? "Adding..." : "Add game"}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
