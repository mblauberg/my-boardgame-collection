import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { AppRoutes } from "./routes";
import { GameDetailPage } from "../../pages/GameDetailPage";
import { SignInPage } from "../../pages/SignInPage";
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
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/game/:slug" element={<GameDetailPage />} />
        </Routes>
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
