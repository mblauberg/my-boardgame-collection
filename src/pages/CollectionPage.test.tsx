import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CollectionPage } from "./CollectionPage";

vi.mock("../features/games/useGamesQuery", () => ({
  useGamesQuery: vi.fn(),
}));

vi.mock("../features/games/useCollectionFilters", () => ({
  useCollectionFilters: () => ({
    filters: {},
    sortBy: "name",
    sortDirection: "asc",
  }),
}));

vi.mock("../components/games/CollectionToolbar", () => ({
  CollectionToolbar: () => <div>Toolbar</div>,
}));

vi.mock("../components/games/GameList", () => ({
  GameList: () => <div>Game list</div>,
}));

import { useGamesQuery } from "../features/games/useGamesQuery";

describe("CollectionPage", () => {
  it("shows setup guidance when Supabase is missing the public tables", () => {
    vi.mocked(useGamesQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: {
        status: 404,
        code: "PGRST205",
        message: "Could not find the table 'public.games' in the schema cache",
      },
    } as never);

    render(
      <MemoryRouter>
        <CollectionPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/schema\.sql/i)).toBeInTheDocument();
    expect(screen.getByText(/migrate:import/i)).toBeInTheDocument();
  });
});
