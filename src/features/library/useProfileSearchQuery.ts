import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { libraryKeys } from "./libraryKeys";

export type PublicProfileSearchResult = {
  username: string;
};

export function useProfileSearchQuery(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return useQuery({
    queryKey: libraryKeys.profileSearch(normalizedQuery),
    retry: shouldRetrySupabaseQuery,
    enabled: normalizedQuery.length > 0,
    queryFn: async (): Promise<PublicProfileSearchResult[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("search_public_profiles", {
        prefix: normalizedQuery,
      });

      if (error) throw error;
      return (data ?? []) as PublicProfileSearchResult[];
    },
  });
}
