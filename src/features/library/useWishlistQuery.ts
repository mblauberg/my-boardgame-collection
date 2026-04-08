import { useQuery } from "@tanstack/react-query";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { useProfile } from "../auth/useProfile";
import { libraryKeys } from "./libraryKeys";
import { fetchLibraryEntries } from "./useCollectionQuery";

export function useWishlistQuery() {
  const { profile, isAuthenticated } = useProfile();
  const userId = profile?.id;

  return useQuery({
    queryKey: libraryKeys.wishlist(userId),
    retry: shouldRetrySupabaseQuery,
    enabled: isAuthenticated && !!userId,
    queryFn: async () => fetchLibraryEntries(userId!, "wishlist"),
  });
}
