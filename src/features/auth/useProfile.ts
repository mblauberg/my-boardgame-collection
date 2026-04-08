import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { authKeys } from "./authKeys";
import { useSession } from "./useSession";
import type { ProfileState, Profile } from "./auth.types";

export function useProfile(): ProfileState {
  const supabase = getSupabaseBrowserClient();
  const { user, isAuthenticated, isLoading: sessionLoading } = useSession();

  const {
    data: profile,
    isLoading: profileLoading,
    error,
  } = useQuery({
    queryKey: authKeys.profile(user?.id),
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    profile: profile ?? null,
    isOwner: profile?.role === "owner",
    isAuthenticated,
    isLoading: sessionLoading || profileLoading,
    error: error as Error | null,
  };
}
