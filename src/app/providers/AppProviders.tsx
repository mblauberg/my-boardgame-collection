import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../lib/query/queryClient";
import { ThemeProvider } from "../../lib/theme";
import { ExploreSearchProvider } from "../../features/library/ExploreSearchContext";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ExploreSearchProvider>{children}</ExploreSearchProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
