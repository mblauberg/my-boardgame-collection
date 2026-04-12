import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { queryClient } from "../../lib/query/queryClient";
import { ThemeProvider } from "../../lib/theme";
import { ExploreSearchProvider } from "../../features/library/ExploreSearchContext";
import { useGuestLibrarySync } from "../../features/library/useGuestLibrarySync";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

function GuestLibrarySyncBoundary() {
  useGuestLibrarySync();
  return null;
}

function MotionAccessibilityBoundary({ children }: PropsWithChildren) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MotionAccessibilityBoundary>
          <GuestLibrarySyncBoundary />
          <ExploreSearchProvider>{children}</ExploreSearchProvider>
        </MotionAccessibilityBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
