import { Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { AppRoutes, backgroundOverlayRouteEntries, RouteLoadingFallback } from "./routes";
import { ErrorBoundary } from "./ErrorBoundary";
import type { Location } from "react-router-dom";

function AppContent() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <ErrorBoundary>
      <AppShell>
        <AppRoutes location={backgroundLocation ?? location} />
      </AppShell>
      {backgroundLocation ? (
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {backgroundOverlayRouteEntries.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Suspense>
      ) : null}
    </ErrorBoundary>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
