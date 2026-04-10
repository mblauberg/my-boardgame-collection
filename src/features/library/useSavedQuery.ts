import { libraryKeys } from "./libraryKeys";
import { selectSavedEntries } from "./librarySelectors";
import { useLibraryQuery } from "./useLibraryQuery";

export function useSavedQuery() {
  const query = useLibraryQuery();

  return {
    ...query,
    queryKey: libraryKeys.saved(query.data?.[0]?.accountId),
    data: selectSavedEntries(query.data ?? []),
  };
}
