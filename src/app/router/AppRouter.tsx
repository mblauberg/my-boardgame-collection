import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { AppRoutes } from "./routes";
import { ErrorBoundary } from "./ErrorBoundary";
import type { Location } from "react-router-dom";

const SignInPage = lazy(async () => ({
  default: (await import("../../pages/SignInPage")).SignInPage,
}));
const GameDetailPage = lazy(async () => ({
  default: (await import("../../pages/GameDetailPage")).GameDetailPage,
}));

function RouteLoadingFallback() {
  return <div className="py-16 text-center text-sm text-on-surface-variant">Loading...</div>;
}

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
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/game/:slug" element={<GameDetailPage />} />
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
