import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";

export type PublicProfile = {
  id: string;
  username: string;
  is_profile_public: boolean;
  is_collection_public: boolean;
  is_wishlist_public: boolean;
};

export function usePublicProfileQuery(username: string) {
  const normalizedUsername = username.trim().toLowerCase();

  return useQuery({
    queryKey: ["profiles", "public", normalizedUsername],
    retry: shouldRetrySupabaseQuery,
    enabled: normalizedUsername.length > 0,
    queryFn: async (): Promise<PublicProfile | null> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("get_public_profile", {
        p_username: normalizedUsername,
      });

      if (error) throw error;
      const profile = data?.[0];
      return profile ?? null;
    },
  });
}
