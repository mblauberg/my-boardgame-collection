import { selectCollectionEntries, selectSavedEntries } from "./librarySelectors";
import type { LibraryEntry, LibrarySurface } from "./library.types";
import { useLibraryQuery } from "./useLibraryQuery";

const surfaceSelectors: Record<LibrarySurface, (entries: LibraryEntry[]) => LibraryEntry[]> = {
  collection: selectCollectionEntries,
  saved: selectSavedEntries,
};

export function useOwnedLibrarySurfaceQuery(surface: LibrarySurface) {
  const query = useLibraryQuery();

  return {
    ...query,
    data: surfaceSelectors[surface](query.data ?? []),
  };
}
