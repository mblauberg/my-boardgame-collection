import { useQuery } from "@tanstack/react-query";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { mapGamesCatalogRow, searchGamesCatalogRows } from "../games/gamesCatalog";
import { libraryKeys } from "./libraryKeys";

export async function searchGames(query: string) {
  const rows = await searchGamesCatalogRows(query);
  return rows.map(mapGamesCatalogRow);
}

export function useExploreSearch(query: string) {
  return useQuery({
    queryKey: libraryKeys.exploreSearch(query),
    queryFn: () => searchGames(query),
    retry: shouldRetrySupabaseQuery,
    enabled: query.trim().length > 0,
  });
}
