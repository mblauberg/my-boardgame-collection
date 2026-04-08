import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Game } from "../../types/domain";

const profileState = vi.hoisted(() => ({
  profile: null,
  isOwner: true,
  isAuthenticated: true,
  isLoading: false,
  error: null,
}));

const refreshMutationState = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
  error: null as Error | null,
}));

vi.mock("../../features/auth/useProfile", () => ({
  useProfile: () => profileState,
}));

vi.mock("../../features/games/useBggRefreshMutation", () => ({
  useBggRefreshMutation: () => refreshMutationState,
}));

import { GameForm } from "./GameForm";

const gameFixture: Game = {
  id: "game-1",
  name: "Heat",
  slug: "heat",
  bggId: 174430,
  bggUrl: "https://boardgamegeek.com/boardgame/174430",
  status: "owned",
  buyPriority: null,
  bggRating: 8.1,
  bggWeight: 2.5,
  playersMin: 1,
  playersMax: 6,
  playTimeMin: 30,
  playTimeMax: 60,
  category: "Racing",
  summary: "A racing game",
  notes: null,
  recommendationVerdict: null,
  recommendationColour: null,
  gapReason: null,
  isExpansionIncluded: false,
  imageUrl: null,
  publishedYear: 2022,
  hidden: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  tags: [],
};

describe("GameForm BGG refresh", () => {
  beforeEach(() => {
    profileState.isOwner = true;
    refreshMutationState.mutateAsync = vi.fn();
    refreshMutationState.isPending = false;
    refreshMutationState.error = null;
  });

  it("lets the owner refresh BGG metadata for an existing game and updates the form values", async () => {
    const user = userEvent.setup();
    refreshMutationState.mutateAsync.mockResolvedValue({
      metadata: {
        bgg_id: 174430,
        bgg_url: "https://boardgamegeek.com/boardgame/174430",
        bgg_rating: 8.2,
        bgg_weight: 2.4,
        published_year: 2015,
      },
    });

    render(<GameForm game={gameFixture} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /refresh bgg metadata/i }));

    expect(refreshMutationState.mutateAsync).toHaveBeenCalledWith({ gameId: "game-1" });
    await waitFor(() => {
      expect(screen.getByDisplayValue("2015")).toBeInTheDocument();
    });
  });

  it("shows progress feedback while the refresh is running", () => {
    refreshMutationState.isPending = true;

    render(<GameForm game={gameFixture} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: /refreshing bgg/i })).toBeDisabled();
  });

  it("shows a friendly error when the BGG lookup fails", async () => {
    const user = userEvent.setup();
    refreshMutationState.mutateAsync.mockRejectedValue(new Error("BGG lookup failed with status 202."));

    render(<GameForm game={gameFixture} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /refresh bgg metadata/i }));

    await waitFor(() => {
      expect(screen.getByText(/bgg lookup failed with status 202/i)).toBeInTheDocument();
    });
  });
});
