import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { useAccount } from "../../features/accounts/useAccount";
import { useProfile } from "../../features/auth/useProfile";
import { useBggSearchQuery } from "../../features/games/useBggSearchQuery";
import {
  createGuestImportedGameId,
  hasAnyLibraryState,
} from "../../features/library/libraryState";
import { useLibraryQuery } from "../../features/library/useLibraryQuery";
import { useSaveBggGameToLibrary } from "../../features/library/useLibraryEntryMutations";
import { useLibraryStateActions } from "../../features/library/useLibraryStateActions";
import { slugify } from "../../lib/utils/slugify";
import type { Game } from "../../types/domain";
import { AddGameCollectionInfoStep } from "./AddGameCollectionInfoStep";
import { AddGameDetailsStep } from "./AddGameDetailsStep";
import { AddGameSearchStep } from "./AddGameSearchStep";
import type {
  AddGameWizardCollectionInfo,
  AddGameWizardDefaultListType,
  AddGameWizardDefaultState,
  AddGameWizardSelectedGame,
} from "./addGameWizard.types";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";

type AddGameWizardOverlayProps = {
  isOpen: boolean;
  defaultListType?: AddGameWizardDefaultListType;
  defaultState?: AddGameWizardDefaultState;
  onClose: () => void;
};

const stepLabels = ["Find your game", "Game details", "Collection info"] as const;

function isHttpsUrl(value: string | null | undefined) {
  return !!value && value.startsWith("https://");
}

async function readFileAsDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

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

function buildGuestImportedGame(
  selectedGame: AddGameWizardSelectedGame,
  imageUrl: string | null,
): Game {
  const timestamp = new Date().toISOString();

  return {
    id: createGuestImportedGameId(selectedGame.id),
    name: selectedGame.name,
    slug: `${slugify(selectedGame.name)}-guest-bgg-${selectedGame.id}`,
    bggId: selectedGame.id,
    bggUrl: selectedGame.bggUrl,
    status: "archived",
    buyPriority: null,
    bggRating: selectedGame.averageRating,
    bggWeight: selectedGame.averageWeight,
    bggRank: selectedGame.bggRank ?? null,
    bggBayesAverage: selectedGame.bggBayesAverage ?? null,
    bggUsersRated: selectedGame.bggUsersRated ?? null,
    isExpansion: selectedGame.isExpansion ?? null,
    abstractsRank: null,
    cgsRank: null,
    childrensGamesRank: null,
    familyGamesRank: null,
    partyGamesRank: null,
    strategyGamesRank: null,
    thematicRank: null,
    wargamesRank: null,
    bggDataSource: "guest_bgg_search",
    bggDataUpdatedAt: null,
    bggSnapshotPayload: null,
    playersMin: selectedGame.playersMin,
    playersMax: selectedGame.playersMax,
    playTimeMin: selectedGame.playTimeMin,
    playTimeMax: selectedGame.playTimeMax,
    category: null,
    summary: selectedGame.summary,
    notes: null,
    recommendationVerdict: null,
    recommendationColour: null,
    gapReason: null,
    isExpansionIncluded: false,
    imageUrl,
    publishedYear: selectedGame.yearPublished,
    hidden: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    tags: [],
  };
}

export function AddGameWizardOverlay({
  isOpen,
  defaultListType,
  defaultState,
  onClose,
}: AddGameWizardOverlayProps) {
  const { account, isAuthenticated } = useAccount();
  const { isOwner } = useProfile();
  const { data: libraryEntries } = useLibraryQuery();
  const libraryStateActions = useLibraryStateActions();
  const { mutateAsync, isPending } = useSaveBggGameToLibrary();
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<AddGameWizardSelectedGame | null>(null);
  const [collectionInfo, setCollectionInfo] = useState<AddGameWizardCollectionInfo>(
    getInitialState(defaultListType, defaultState),
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const search = useBggSearchQuery(query);
  const results = Array.isArray(search.data?.results)
    ? search.data.results.map((result) => normalizeSearchResult(result as Record<string, unknown>))
    : [];
  const canUploadImageFiles = !isAuthenticated || isOwner;
  const imageUploadHelpText = !isAuthenticated
    ? "Guest image uploads stay local on this device until you sign in and sync."
    : isOwner
      ? "Owner uploads are stored in the shared game image bucket."
      : "Custom image file uploads are restricted to guest-local saves or owner accounts. Use a custom HTTPS image URL instead.";
  const existingLibraryEntry = selectedGame
    ? (libraryEntries ?? []).find((entry) => entry.game.bggId === selectedGame.id) ?? null
    : null;

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
    if (!selectedGame || isPending || !hasAnyLibraryState(collectionInfo)) return;

    try {
      setSubmitError(null);

      let finalImageUrl = selectedGame.customImageUrl?.trim() || selectedGame.imageUrl;

      if (selectedGame.customImageFile) {
        if (!canUploadImageFiles) {
          setSubmitError(imageUploadHelpText);
          return;
        }

        if (isAuthenticated && account?.id && isOwner) {
          const supabase = getSupabaseBrowserClient();
          const fileExt = selectedGame.customImageFile.name.split(".").pop() || "tmp";
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${account.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("game-images")
            .upload(filePath, selectedGame.customImageFile);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("game-images")
            .getPublicUrl(filePath);

          finalImageUrl = publicUrlData.publicUrl;
        } else {
          finalImageUrl = await readFileAsDataUrl(selectedGame.customImageFile);
        }
      }

      if (existingLibraryEntry) {
        libraryStateActions.applyStatePatch(existingLibraryEntry.game, existingLibraryEntry, {
          isSaved: collectionInfo.isSaved,
          isLoved: collectionInfo.isLoved,
          isInCollection: collectionInfo.isInCollection,
        });
        handleClose();
        return;
      }

      if (isAuthenticated && account?.id) {
        if (finalImageUrl && !isHttpsUrl(finalImageUrl)) {
          setSubmitError("Synced game images must use an HTTPS URL.");
          return;
        }

        await mutateAsync({
          accountId: account.id,
          selectedGame: { ...selectedGame, imageUrl: finalImageUrl },
          isSaved: collectionInfo.isSaved,
          isLoved: collectionInfo.isLoved,
          isInCollection: collectionInfo.isInCollection,
          sentiment: collectionInfo.sentiment,
          notes: collectionInfo.notes,
        });
        handleClose();
        return;
      }

      libraryStateActions.applyStatePatch(
        buildGuestImportedGame(selectedGame, finalImageUrl),
        null,
        {
          isSaved: collectionInfo.isSaved,
          isLoved: collectionInfo.isLoved,
          isInCollection: collectionInfo.isInCollection,
        },
      );
      handleClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save this game.");
    }
  }

  if (!isOpen) return null;

  const nextDisabled =
    (step === 1 && !selectedGame) ||
    (step === 3 && (!hasAnyLibraryState(collectionInfo) || isPending));

  return (
    <motion.div
      data-testid="add-game-wizard-backdrop"
      data-motion="wizard-backdrop"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-on-surface/20 px-4 py-6 backdrop-blur-sm"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
      transition={{
        duration: motionTokens.duration.base,
        ease: motionTokens.ease.standard,
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Add new game"
        data-motion="wizard-panel"
        className="glass-surface-panel flex max-h-[min(46rem,90vh)] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] shadow-[0_32px_80px_rgba(46,47,45,0.18)] lg:flex-row"
        initial={
          prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.985 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={
          prefersReducedMotion ? undefined : { opacity: 0, y: 16, scale: 0.99 }
        }
        transition={{
          duration: motionTokens.duration.slow,
          ease: motionTokens.ease.emphasized,
        }}
      >
        <aside className="border-b border-outline/10 bg-surface-container-low/70 px-6 py-8 lg:w-64 lg:border-b-0 lg:border-r">
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
                <motion.li key={label} className="flex items-center gap-3" layout>
                  <motion.span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      active || complete
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                    animate={
                      prefersReducedMotion
                        ? undefined
                        : active || complete
                          ? { scale: 1.04 }
                          : { scale: 1 }
                    }
                    transition={motionTokens.spring.soft}
                  >
                    {stepNumber}
                  </motion.span>
                  <motion.span
                    className={`text-sm ${
                      active ? "font-bold text-on-surface" : "text-on-surface-variant"
                    }`}
                    animate={{ opacity: active || complete ? 1 : 0.72 }}
                    transition={{
                      duration: motionTokens.duration.fast,
                      ease: motionTokens.ease.standard,
                    }}
                  >
                    {label}
                  </motion.span>
                </motion.li>
              );
            })}
          </ol>
        </aside>

        <section className="flex min-h-[38rem] flex-1 flex-col overflow-y-auto px-6 pt-8 sm:px-8">
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              aria-label="Close add game wizard"
              onClick={handleClose}
              className="glass-action-button rounded-full p-2 text-on-surface-variant transition hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`wizard-step-${step}`}
              data-testid="add-game-wizard-step"
              data-motion="wizard-step"
              className="flex-1"
              initial={
                prefersReducedMotion ? false : { opacity: 0, x: step === 1 ? 0 : 24 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={
                prefersReducedMotion ? undefined : { opacity: 0, x: -18 }
              }
              transition={{
                duration: motionTokens.duration.base,
                ease: motionTokens.ease.standard,
              }}
            >
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
                  canUploadImageFiles={canUploadImageFiles}
                  imageUploadHelpText={imageUploadHelpText}
                  onChange={(updates) =>
                    setSelectedGame((prev) => (prev ? { ...prev, ...updates } : null))
                  }
                />
              ) : null}

              {step === 3 ? (
                <AddGameCollectionInfoStep
                  value={collectionInfo}
                  onChange={setCollectionInfo}
                  submitError={submitError}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div
            className={`mt-8 flex items-center justify-between gap-3 border-t border-outline/10 pt-6 pb-8 ${
              step === 1 && selectedGame
                ? "sticky bottom-0 -mx-6 bg-surface-container-lowest px-6 sm:-mx-8 sm:px-8"
                : ""
            }`}
          >
            <button
              type="button"
              onClick={() => (step === 1 ? handleClose() : setStep((current) => current - 1))}
              className="glass-action-button rounded-full px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:text-on-surface"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((current) => current + 1)}
                disabled={nextDisabled}
                className="glass-action-button-active rounded-full px-6 py-3 text-sm font-bold text-on-primary transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={nextDisabled}
                className="glass-action-button-active rounded-full px-6 py-3 text-sm font-bold text-on-primary transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Adding..." : isAuthenticated ? "Add and sync" : "Add locally"}
              </button>
            )}
          </div>
        </section>
      </motion.div>
    </motion.div>
  );
}
