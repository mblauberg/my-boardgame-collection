import type { Game } from "../../types/domain";
import type { LibraryEntry, LibrarySentiment } from "./library.types";

const GUEST_LIBRARY_STORAGE_KEY = "guest-library-v1";
export const GUEST_LIBRARY_USER_ID = "__guest__";

type StoredGuestLibraryEntry = {
  game: Game;
  isSaved: boolean;
  isLoved: boolean;
  isInCollection: boolean;
  sentiment: LibrarySentiment;
  notes: string | null;
  updatedAt: string;
};

type StoredGuestLibraryMap = Record<string, StoredGuestLibraryEntry>;

type UpsertGuestLibraryEntryInput = {
  game: Game;
  isSaved: boolean;
  isLoved: boolean;
  isInCollection: boolean;
  sentiment?: LibrarySentiment;
  notes?: string | null;
};

function deriveListType(entry: Pick<StoredGuestLibraryEntry, "isSaved" | "isInCollection">) {
  if (entry.isInCollection) return "collection";
  if (entry.isSaved) return "saved";
  return undefined;
}

function readStoredGuestLibraryMap(): StoredGuestLibraryMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(GUEST_LIBRARY_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    return parsed as StoredGuestLibraryMap;
  } catch {
    return {};
  }
}

function writeStoredGuestLibraryMap(entries: StoredGuestLibraryMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_LIBRARY_STORAGE_KEY, JSON.stringify(entries));
}

function toLibraryEntry(gameId: string, entry: StoredGuestLibraryEntry): LibraryEntry {
  return {
    id: `guest-${gameId}`,
    accountId: GUEST_LIBRARY_USER_ID,
    userId: GUEST_LIBRARY_USER_ID,
    gameId,
    isSaved: entry.isSaved,
    isLoved: entry.isLoved,
    isInCollection: entry.isInCollection,
    listType: deriveListType(entry),
    sentiment: entry.sentiment,
    notes: entry.notes,
    priority: null,
    game: entry.game,
    sharedTags: entry.game.tags,
    userTags: [],
  };
}

export function readGuestLibraryEntries(): LibraryEntry[] {
  const entries = readStoredGuestLibraryMap();

  return Object.entries(entries)
    .sort(([, a], [, b]) => b.updatedAt.localeCompare(a.updatedAt))
    .map(([gameId, entry]) => toLibraryEntry(gameId, entry));
}

export function upsertGuestLibraryEntry(input: UpsertGuestLibraryEntryInput): LibraryEntry {
  const entries = readStoredGuestLibraryMap();
  const nextEntry: StoredGuestLibraryEntry = {
    game: input.game,
    isSaved: input.isSaved,
    isLoved: input.isLoved,
    isInCollection: input.isInCollection,
    sentiment: input.sentiment ?? null,
    notes: input.notes ?? null,
    updatedAt: new Date().toISOString(),
  };

  entries[input.game.id] = nextEntry;
  writeStoredGuestLibraryMap(entries);

  return toLibraryEntry(input.game.id, nextEntry);
}

export function removeGuestLibraryEntry(gameId: string) {
  const entries = readStoredGuestLibraryMap();
  delete entries[gameId];
  writeStoredGuestLibraryMap(entries);
}

export function clearGuestLibraryEntries() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_LIBRARY_STORAGE_KEY);
}
