import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { authKeys } from "./authKeys";
import type { SessionState } from "./auth.types";

export function useSession(): SessionState {
  const supabase = getSupabaseBrowserClient();

  const { data, isLoading } = useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    session: data?.session ?? null,
    user: data?.session?.user ?? null,
    isAuthenticated: !!data?.session,
    isLoading,
  };
}
