import type { LibraryEntry, LibrarySentiment } from "./library.types";

export const GUEST_IMPORTED_GAME_ID_PREFIX = "guest-bgg:";

export type LibraryStateSnapshot = {
  isSaved: boolean;
  isLoved: boolean;
  isInCollection: boolean;
  sentiment: LibrarySentiment;
  notes: string | null;
};

export function createGuestImportedGameId(bggId: number) {
  return `${GUEST_IMPORTED_GAME_ID_PREFIX}${bggId}`;
}

export function isGuestImportedGameId(gameId: string) {
  return gameId.startsWith(GUEST_IMPORTED_GAME_ID_PREFIX);
}

export function getLibraryEntryForGame(entries: LibraryEntry[] | undefined, gameId: string) {
  return entries?.find((entry) => entry.gameId === gameId) ?? null;
}

export function getLibraryStateSnapshot(entry: LibraryEntry | null): LibraryStateSnapshot {
  return {
    isSaved: entry?.isSaved ?? false,
    isLoved: entry?.isLoved ?? false,
    isInCollection: entry?.isInCollection ?? false,
    sentiment: entry?.sentiment ?? null,
    notes: entry?.notes ?? null,
  };
}

export function normalizeLibraryStateSnapshot(state: LibraryStateSnapshot): LibraryStateSnapshot {
  if (state.isInCollection && state.isSaved) {
    return { ...state, isSaved: false };
  }

  return state;
}

export function applyLibraryStatePatch(
  currentState: LibraryStateSnapshot,
  updates: Partial<Pick<LibraryStateSnapshot, "isSaved" | "isLoved" | "isInCollection">>,
): LibraryStateSnapshot {
  const nextState = {
    ...currentState,
    ...updates,
  };

  if (updates.isSaved === true) {
    nextState.isInCollection = false;
  }

  if (updates.isInCollection === true) {
    nextState.isSaved = false;
  }

  return normalizeLibraryStateSnapshot(nextState);
}

export function toggleSavedLibraryState(currentState: LibraryStateSnapshot): LibraryStateSnapshot {
  if (currentState.isSaved) {
    return applyLibraryStatePatch(currentState, { isSaved: false });
  }

  return applyLibraryStatePatch(currentState, { isSaved: true, isInCollection: false });
}

export function toggleLovedLibraryState(currentState: LibraryStateSnapshot): LibraryStateSnapshot {
  return applyLibraryStatePatch(currentState, { isLoved: !currentState.isLoved });
}

export function toggleCollectionLibraryState(
  currentState: LibraryStateSnapshot,
): LibraryStateSnapshot {
  if (currentState.isInCollection) {
    return applyLibraryStatePatch(currentState, { isInCollection: false });
  }

  return applyLibraryStatePatch(currentState, { isInCollection: true, isSaved: false });
}

export function moveLibraryStateToCollection(
  currentState: LibraryStateSnapshot,
): LibraryStateSnapshot {
  return applyLibraryStatePatch(currentState, { isSaved: false, isInCollection: true });
}

export function hasAnyLibraryState(
  state: Pick<LibraryStateSnapshot, "isSaved" | "isLoved" | "isInCollection">,
) {
  return state.isSaved || state.isLoved || state.isInCollection;
}
