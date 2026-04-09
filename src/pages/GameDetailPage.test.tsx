import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { GameDetailPage } from "./GameDetailPage";

vi.mock("../features/games/useGameDetailQuery", () => ({
  useGameDetailQuery: vi.fn(),
}));

vi.mock("../components/games/GameDetailPanel", () => ({
  GameDetailPanel: ({ game }: { game: { name: string } }) => <div>{game.name}</div>,
}));

import { useGameDetailQuery } from "../features/games/useGameDetailQuery";

const game = {
  id: "game-1",
  name: "A Fake Artist",
  slug: "a-fake-artist",
};

describe("GameDetailPage", () => {
  it("renders the game inside the overlay shell when opened without background state", () => {
    vi.mocked(useGameDetailQuery).mockReturnValue({
      data: game,
      isLoading: false,
      error: null,
    } as never);

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/game/a-fake-artist", state: { from: "/explore" } }]}
      >
        <Routes>
          <Route path="/game/:slug" element={<GameDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("dialog", { name: /a fake artist/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close game details/i })).toBeInTheDocument();
  });

  it("uses the standalone trophy-room canvas on direct entry", () => {
    vi.mocked(useGameDetailQuery).mockReturnValue({
      data: game,
      isLoading: false,
      error: null,
    } as never);

    render(
      <MemoryRouter initialEntries={["/game/a-fake-artist"]}>
        <Routes>
          <Route path="/game/:slug" element={<GameDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("dialog", { name: /a fake artist/i })).toBeInTheDocument();
    expect(screen.getByTestId("overlay-backdrop").className).toContain("bg-surface");
  });

  it("renders loading state inside dialog shell when opened as modal", () => {
    vi.mocked(useGameDetailQuery).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as never);

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/game/a-fake-artist",
            state: { from: "/", backgroundLocation: { pathname: "/" } },
          },
        ]}
      >
        <Routes>
          <Route path="/game/:slug" element={<GameDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("dialog", { name: /loading game details/i })).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveTextContent(/loading game/i);
  });

  it("renders error state inside dialog shell when opened as modal", () => {
    vi.mocked(useGameDetailQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed to load"),
    } as never);

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/game/a-fake-artist",
            state: { from: "/", backgroundLocation: { pathname: "/" } },
          },
        ]}
      >
        <Routes>
          <Route path="/game/:slug" element={<GameDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("dialog", { name: /game details unavailable/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to collection/i })).toHaveAttribute("href", "/");
  });
});
