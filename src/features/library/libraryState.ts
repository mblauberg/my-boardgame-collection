import type { LibraryEntry, LibrarySentiment } from "./library.types";

export type LibraryStateSnapshot = {
  isSaved: boolean;
  isLoved: boolean;
  isInCollection: boolean;
  sentiment: LibrarySentiment;
  notes: string | null;
};

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

export function hasAnyLibraryState(state: Pick<LibraryStateSnapshot, "isSaved" | "isLoved" | "isInCollection">) {
  return state.isSaved || state.isLoved || state.isInCollection;
}
