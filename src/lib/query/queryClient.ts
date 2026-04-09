import { QueryClient } from "@tanstack/react-query";
import { shouldRetrySupabaseQuery } from "../supabase/runtimeErrors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60_000,
      retry: shouldRetrySupabaseQuery,
    },
  },
});
