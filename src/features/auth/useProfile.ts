import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { authKeys } from "./authKeys";
import type { ProfileState, Profile } from "./auth.types";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { useAccount } from "../accounts/useAccount";

export function useProfile(): ProfileState {
  const { account, isAuthenticated, isLoading: accountLoading, error: accountError } =
    useAccount();

  const {
    data: profile,
    isLoading: profileLoading,
    error,
  } = useQuery({
    queryKey: authKeys.profile(account?.id),
    retry: shouldRetrySupabaseQuery,
    queryFn: async () => {
      if (!account?.id) return null;

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", account.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!account?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    profile: profile ?? null,
    isOwner: profile?.role === "owner",
    isAuthenticated,
    isLoading: accountLoading || profileLoading,
    error: (accountError ?? error) as Error | null,
  };
}
