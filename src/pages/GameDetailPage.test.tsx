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
  it("uses the explore route for the back link when opened from explore", () => {
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

    expect(screen.getByRole("link", { name: /back to explore/i })).toHaveAttribute(
      "href",
      "/explore",
    );
  });

  it("defaults to the collection route when no origin route is provided", () => {
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

    expect(screen.getByRole("link", { name: /back to collection/i })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
