import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { AppRoutes } from "./routes";
import { GameDetailPage } from "../../pages/GameDetailPage";
import { SignInPage } from "../../pages/SignInPage";
import { ExploreSearchProvider } from "../../features/library/ExploreSearchContext";
import { ThemeProvider } from "../../lib/theme";
import type { Location } from "react-router-dom";

vi.mock("../../features/auth/useProfile", () => ({
  useProfile: () => ({
    profile: null,
    isOwner: false,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),
}));

vi.mock("../../features/auth/useSession", () => ({
  useSession: () => ({
    session: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
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

vi.mock("../../pages/CollectionPage", () => ({
  CollectionPage: () => <h1>Your Collection</h1>,
}));

vi.mock("../../pages/SignInPage", () => ({
  SignInPage: () => (
    <div role="dialog" aria-modal="true" aria-label="Sign in">
      Sign in
    </div>
  ),
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
          <Route path="/signin" element={<SignInPage />} />
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
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ExploreSearchProvider>
          <MemoryRouter initialEntries={entries}>
            <AppContent />
          </MemoryRouter>
        </ExploreSearchProvider>
      </QueryClientProvider>
    </ThemeProvider>,
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

    expect(await screen.findByRole("heading", { name: /your collection/i })).toBeInTheDocument();
    expect(await screen.findByRole("dialog", { name: /heat/i })).toBeInTheDocument();
  });

  it("renders the game route without background content on direct entry", async () => {
    renderAppRouter(["/game/heat"]);

    expect(await screen.findByRole("dialog", { name: /heat/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /your collection/i })).not.toBeInTheDocument();
  });

  it("keeps the collection page rendered behind the sign-in overlay", async () => {
    renderAppRouter([
      "/",
      {
        pathname: "/signin",
        state: {
          backgroundLocation: {
            pathname: "/",
            search: "",
            hash: "",
            state: null,
            key: "default",
          },
        },
      },
    ]);

    expect(await screen.findByRole("heading", { name: /your collection/i })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: /sign in/i })).toBeInTheDocument();
  });
});
