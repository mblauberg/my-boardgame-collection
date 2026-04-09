import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { AppRoutes } from "./routes";
import { GameDetailPage } from "../../pages/GameDetailPage";
import { ExploreSearchProvider } from "../../features/library/ExploreSearchContext";
import type { Location } from "react-router-dom";

vi.mock("../../features/auth/useProfile", () => ({
  useProfile: () => ({ data: null, isLoading: false }),
}));

vi.mock("../../features/games/useGameDetailQuery", () => ({
  useGameDetailQuery: vi.fn(() => ({
    data: { id: "1", name: "Heat", slug: "heat" },
    isLoading: false,
    error: null,
  })),
}));

vi.mock("../../components/games/GameDetailPanel", () => ({
  GameDetailPanel: ({ game }: { game: { name: string } }) => <div>{game.name}</div>,
}));

vi.mock("../../features/library/useLibraryQuery", () => ({
  useLibraryQuery: () => ({ data: [], isLoading: false }),
}));

vi.mock("../../features/library/useCollectionQuery", () => ({
  useCollectionQuery: () => ({ data: [], isLoading: false }),
}));

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

function renderAppRouter(entries: Array<string | { pathname: string; state: unknown }>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ExploreSearchProvider>
        <MemoryRouter initialEntries={entries}>
          <AppContent />
        </MemoryRouter>
      </ExploreSearchProvider>
    </QueryClientProvider>,
  );
}

describe("AppRouter", () => {
  it("keeps the collection page rendered behind the game overlay", async () => {
    renderAppRouter([
      "/",
      {
        pathname: "/game/heat",
        state: {
          backgroundLocation: {
            pathname: "/",
            search: "",
            hash: "",
            state: null,
            key: "default",
          },
          from: "/",
        },
      },
    ]);

    expect(screen.getByRole("heading", { name: /your collection/i })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: /heat/i })).toBeInTheDocument();
  });

  it("renders the game route without background content on direct entry", async () => {
    renderAppRouter(["/game/heat"]);

    expect(screen.getByRole("dialog", { name: /heat/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /your collection/i })).not.toBeInTheDocument();
  });
});
