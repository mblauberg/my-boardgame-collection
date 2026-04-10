import { useQueryClient } from "@tanstack/react-query";
import type { Game } from "../../types/domain";
import { useAccount } from "../accounts/useAccount";
import {
  GUEST_LIBRARY_USER_ID,
  removeGuestLibraryEntry,
  upsertGuestLibraryEntry,
} from "./guestLibraryStorage";
import { libraryKeys } from "./libraryKeys";
import type { LibraryEntry } from "./library.types";
import {
  applyLibraryStatePatch,
  getLibraryStateSnapshot,
  hasAnyLibraryState,
  type LibraryStateSnapshot,
  moveLibraryStateToCollection,
  toggleCollectionLibraryState,
  toggleLovedLibraryState,
  toggleSavedLibraryState,
} from "./libraryState";
import {
  useDeleteLibraryEntry,
  useUpsertLibraryState,
} from "./useLibraryEntryMutations";

type LibraryStatePatch = Partial<
  Pick<LibraryStateSnapshot, "isSaved" | "isLoved" | "isInCollection">
>;

export function useLibraryStateActions() {
  const queryClient = useQueryClient();
  const { account, isAuthenticated, isLoading } = useAccount();
  const upsertLibraryState = useUpsertLibraryState();
  const deleteLibraryEntry = useDeleteLibraryEntry();

  function invalidateGuestLibraryEntries() {
    void queryClient.invalidateQueries({
      queryKey: libraryKeys.library(GUEST_LIBRARY_USER_ID),
    });
  }

  function commitStateChange(
    game: Game,
    entry: LibraryEntry | null | undefined,
    nextState: LibraryStateSnapshot,
  ) {
    const existingEntry = entry ?? null;

    if (isAuthenticated) {
      if (!account?.id) return;

      if (!hasAnyLibraryState(nextState) && existingEntry) {
        deleteLibraryEntry.mutate({ id: existingEntry.id, accountId: account.id });
        return;
      }

      if (!hasAnyLibraryState(nextState)) return;

      upsertLibraryState.mutate({
        accountId: account.id,
        gameId: game.id,
        isSaved: nextState.isSaved,
        isLoved: nextState.isLoved,
        isInCollection: nextState.isInCollection,
        sentiment: nextState.sentiment,
        notes: nextState.notes,
      });
      return;
    }

    if (!hasAnyLibraryState(nextState)) {
      removeGuestLibraryEntry(existingEntry?.gameId ?? game.id);
      invalidateGuestLibraryEntries();
      return;
    }

    upsertGuestLibraryEntry({
      game,
      isSaved: nextState.isSaved,
      isLoved: nextState.isLoved,
      isInCollection: nextState.isInCollection,
      sentiment: nextState.sentiment,
      notes: nextState.notes,
    });
    invalidateGuestLibraryEntries();
  }

  function applyStatePatch(
    game: Game,
    entry: LibraryEntry | null | undefined,
    updates: LibraryStatePatch,
  ) {
    const currentState = getLibraryStateSnapshot(entry ?? null);
    commitStateChange(game, entry, applyLibraryStatePatch(currentState, updates));
  }

  function toggleSaved(game: Game, entry: LibraryEntry | null | undefined) {
    const currentState = getLibraryStateSnapshot(entry ?? null);
    commitStateChange(game, entry, toggleSavedLibraryState(currentState));
  }

  function toggleLoved(game: Game, entry: LibraryEntry | null | undefined) {
    const currentState = getLibraryStateSnapshot(entry ?? null);
    commitStateChange(game, entry, toggleLovedLibraryState(currentState));
  }

  function toggleCollection(game: Game, entry: LibraryEntry | null | undefined) {
    const currentState = getLibraryStateSnapshot(entry ?? null);
    commitStateChange(game, entry, toggleCollectionLibraryState(currentState));
  }

  function moveToCollection(game: Game, entry: LibraryEntry | null | undefined) {
    const currentState = getLibraryStateSnapshot(entry ?? null);
    commitStateChange(game, entry, moveLibraryStateToCollection(currentState));
  }

  return {
    accountId: account?.id ?? null,
    isAuthenticated,
    isPending: isLoading || upsertLibraryState.isPending || deleteLibraryEntry.isPending,
    applyStatePatch,
    toggleSaved,
    toggleLoved,
    toggleCollection,
    moveToCollection,
  };
}
