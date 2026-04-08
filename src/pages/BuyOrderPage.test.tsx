import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BuyOrderPage } from "./BuyOrderPage";
import type { Game } from "../types/domain";

// Mock hooks
vi.mock("../features/games/useGamesQuery", () => ({
  useGamesQuery: vi.fn(),
}));

vi.mock("../features/auth/useProfile", () => ({
  useProfile: vi.fn(),
}));

vi.mock("../features/games/useGameMutations", () => ({
  useUpdateGame: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

import { useGamesQuery } from "../features/games/useGamesQuery";
import { useProfile } from "../features/auth/useProfile";

const buyGame: Game = {
  id: "1",
  name: "Heat",
  slug: "heat",
  status: "buy",
  buyPriority: 1,
  bggId: null,
  bggUrl: null,
  bggRating: null,
  bggWeight: null,
  playersMin: null,
  playersMax: null,
  playTimeMin: null,
  playTimeMax: null,
  category: null,
  summary: null,
  notes: null,
  recommendationVerdict: null,
  recommendationColour: null,
  gapReason: null,
  isExpansionIncluded: false,
  imageUrl: null,
  publishedYear: null,
  hidden: false,
  createdAt: "",
  updatedAt: "",
  tags: [],
};

const publicProfile = {
  profile: null,
  isOwner: false,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const ownerProfile = {
  profile: { id: "u1", email: "owner@test.com", role: "owner" as const, created_at: "", updated_at: "" },
  isOwner: true,
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

describe("BuyOrderPage", () => {
  beforeEach(() => {
    vi.mocked(useProfile).mockReturnValue(publicProfile);
  });

  it("shows loading state", () => {
    vi.mocked(useGamesQuery).mockReturnValue({ data: undefined, isLoading: true, error: null } as any);
    render(<BuyOrderPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    vi.mocked(useGamesQuery).mockReturnValue({ data: undefined, isLoading: false, error: new Error("fail") } as any);
    render(<BuyOrderPage />);
    expect(screen.getByText(/buy order unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/supabase configuration/i)).toBeInTheDocument();
  });

  it("shows empty state when no buy items", () => {
    vi.mocked(useGamesQuery).mockReturnValue({ data: [], isLoading: false, error: null } as any);
    render(<BuyOrderPage />);
    expect(screen.getByText(/no games/i)).toBeInTheDocument();
  });

  it("renders buy items in priority order", () => {
    const games: Game[] = [
      { ...buyGame, id: "2", name: "Quacks", buyPriority: 2 },
      { ...buyGame, id: "1", name: "Heat", buyPriority: 1 },
    ];
    vi.mocked(useGamesQuery).mockReturnValue({ data: games, isLoading: false, error: null } as any);
    render(<BuyOrderPage />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Heat");
    expect(items[1]).toHaveTextContent("Quacks");
  });

  it("does not show owner controls for public viewers", () => {
    vi.mocked(useGamesQuery).mockReturnValue({ data: [buyGame], isLoading: false, error: null } as any);
    render(<BuyOrderPage />);
    expect(screen.queryByRole("button", { name: /mark owned/i })).not.toBeInTheDocument();
  });

  it("shows owner controls for owner", () => {
    vi.mocked(useProfile).mockReturnValue(ownerProfile);
    vi.mocked(useGamesQuery).mockReturnValue({ data: [buyGame], isLoading: false, error: null } as any);
    render(<BuyOrderPage />);
    expect(screen.getByRole("button", { name: /mark owned/i })).toBeInTheDocument();
  });
});
