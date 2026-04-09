import { selectCollectionEntries } from "./librarySelectors";
import { useLibraryQuery } from "./useLibraryQuery";

export function useCollectionQuery() {
  const query = useLibraryQuery();

  return {
    ...query,
    data: selectCollectionEntries(query.data ?? []),
  };
}
