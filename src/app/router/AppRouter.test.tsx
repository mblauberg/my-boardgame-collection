import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { AppRoutes } from "./routes";

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
      <MemoryRouter initialEntries={entries}>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AppRouter", () => {
  it("keeps the collection page rendered behind the game overlay", async () => {
    renderAppRouter([
      "/",
      { pathname: "/game/heat", state: { backgroundLocation: { pathname: "/" }, from: "/" } },
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
