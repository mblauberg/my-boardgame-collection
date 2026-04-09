import type { LibraryEntry } from "./library.types";

export function selectSavedEntries(entries: LibraryEntry[]) {
  return entries.filter((entry) => entry.isSaved);
}

export function selectCollectionEntries(entries: LibraryEntry[]) {
  return entries.filter((entry) => entry.isInCollection);
}
