import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { requestBggRefresh } from "./bggApi";
import { gamesKeys } from "./gamesKeys";

export function useBggRefreshMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId }: { gameId: string }) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session?.access_token) {
        throw new Error("Authentication required.");
      }

      return requestBggRefresh({
        accessToken: data.session.access_token,
        gameId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gamesKeys.details() });
    },
  });
}
