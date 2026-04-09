import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { useSession } from "../../features/auth/useSession";
import { useBggSearchQuery } from "../../features/games/useBggSearchQuery";
import { useSaveBggGameToLibrary } from "../../features/library/useLibraryEntryMutations";
import { AddGameCollectionInfoStep } from "./AddGameCollectionInfoStep";
import { AddGameDetailsStep } from "./AddGameDetailsStep";
import { AddGameSearchStep } from "./AddGameSearchStep";
import type {
  AddGameWizardCollectionInfo,
  AddGameWizardDefaultListType,
  AddGameWizardDefaultState,
  AddGameWizardSelectedGame,
} from "./addGameWizard.types";

type AddGameWizardOverlayProps = {
  isOpen: boolean;
  defaultListType?: AddGameWizardDefaultListType;
  defaultState?: AddGameWizardDefaultState;
  onClose: () => void;
};

const stepLabels = ["Find your game", "Game details", "Collection info"] as const;

function getInitialState(
  defaultListType: AddGameWizardDefaultListType | undefined,
  defaultState?: AddGameWizardDefaultState,
): AddGameWizardCollectionInfo {
  if (defaultState) {
    return {
      ...defaultState,
      sentiment: null,
      notes: "",
    };
  }

  return {
    isSaved: defaultListType === "wishlist",
    isLoved: false,
    isInCollection: defaultListType !== "wishlist",
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
  defaultListType,
  defaultState,
  onClose,
}: AddGameWizardOverlayProps) {
  const { user, isAuthenticated } = useSession();
  const { mutateAsync, isPending } = useSaveBggGameToLibrary();
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<AddGameWizardSelectedGame | null>(null);
  const [collectionInfo, setCollectionInfo] = useState<AddGameWizardCollectionInfo>(
    getInitialState(defaultListType, defaultState),
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
    setCollectionInfo(getInitialState(defaultListType, defaultState));
    setSubmitError(null);
  }, [isOpen, defaultListType, defaultState]);

  function handleClose() {
    setStep(1);
    setQuery("");
    setSelectedGame(null);
    setCollectionInfo(getInitialState(defaultListType, defaultState));
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
      
      let finalImageUrl = selectedGame.customImageUrl || selectedGame.imageUrl;

      if (selectedGame.customImageFile) {
        const supabase = getSupabaseBrowserClient();
        const fileExt = selectedGame.customImageFile.name.split('.').pop() || 'tmp';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("game-images")
          .upload(filePath, selectedGame.customImageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("game-images")
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrlData.publicUrl;
      }

      await mutateAsync({
        userId: user.id,
        selectedGame: { ...selectedGame, imageUrl: finalImageUrl },
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

  const nextDisabled = (step === 1 && !selectedGame) || (step === 3 && (!user?.id || isPending));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-on-surface/20 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add new game"
        className="flex max-h-[min(46rem,90vh)] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-[0_32px_80px_rgba(46,47,45,0.18)] lg:flex-row"
      >
        <aside className="bg-surface-container-low px-6 py-8 lg:w-64">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            Step {String(step).padStart(2, "0")} of 03
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-primary">Add New Game</h1>

          <ol className="mt-8 space-y-4">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1;
              const active = stepNumber === step;
              const complete = stepNumber < step;

              return (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      active || complete
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {stepNumber}
                  </span>
                  <span
                    className={`text-sm ${
                      active ? "font-bold text-on-surface" : "text-on-surface-variant"
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </aside>

        <section className="flex min-h-[38rem] flex-1 flex-col px-6 py-8 sm:px-8">
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              aria-label="Close add game wizard"
              onClick={handleClose}
              className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
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

          {step === 2 && selectedGame ? (
            <AddGameDetailsStep 
              game={selectedGame} 
              onChange={(updates) => setSelectedGame((prev) => (prev ? { ...prev, ...updates } : null))}
            />
          ) : null}

          {step === 3 ? (
            <AddGameCollectionInfoStep
              value={collectionInfo}
              onChange={setCollectionInfo}
              submitError={submitError}
              isAuthenticated={isAuthenticated}
            />
          ) : null}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-outline/10 pt-6">
            <button
              type="button"
              onClick={() => (step === 1 ? handleClose() : setStep((current) => current - 1))}
              className="rounded-full px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((current) => current + 1)}
                disabled={nextDisabled}
                className="rounded-2xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={nextDisabled}
                className="rounded-2xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition disabled:cursor-not-allowed disabled:opacity-50"
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
