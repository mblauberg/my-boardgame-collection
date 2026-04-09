import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { AppRoutes } from "./routes";
import { GameDetailPage } from "../../pages/GameDetailPage";
import type { Location } from "react-router-dom";

function AppContent() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      <AppShell>
        <AppRoutes location={backgroundLocation ?? location} />
      </AppShell>
      {backgroundLocation ? (
        <Routes>
          <Route path="/game/:slug" element={<GameDetailPage />} />
        </Routes>
      ) : null}
    </>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
