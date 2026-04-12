import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Game } from "../../types/domain";
import { GameForm } from "./GameForm";

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

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const gameFixture: Game = {
  id: "game-1",
  name: "Heat",
  slug: "heat",
  bggId: 366013,
  bggUrl: null,
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

describe("GameForm", () => {
  beforeEach(() => {
    profileState.isOwner = true;
    refreshMutationState.mutateAsync = vi.fn();
    refreshMutationState.isPending = false;
    refreshMutationState.error = null;
  });

  it("renders name and status fields", () => {
    render(<GameForm onSubmit={vi.fn()} onCancel={vi.fn()} />, {
      wrapper: makeWrapper(),
    });

    expect(screen.getByLabelText(/name/i)).toHaveClass("glass-input-field");
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toHaveClass("glass-action-button");
    expect(screen.getByRole("button", { name: /save/i })).toHaveClass("glass-action-button-active");
  });

  it("shows a validation error when name is empty on submit", async () => {
    const user = userEvent.setup();

    render(<GameForm onSubmit={vi.fn()} onCancel={vi.fn()} />, {
      wrapper: makeWrapper(),
    });

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it("populates fields when an existing game is provided", () => {
    render(<GameForm game={gameFixture} onSubmit={vi.fn()} onCancel={vi.fn()} />, {
      wrapper: makeWrapper(),
    });

    expect(screen.getByDisplayValue("Heat")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh bgg metadata/i })).toHaveClass(
      "glass-action-button",
    );
    expect(screen.getByRole("button", { name: /save/i })).toHaveClass(
      "glass-action-button-active",
    );
  });

  it("calls onSubmit with form values when the form is valid", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<GameForm onSubmit={handleSubmit} onCancel={vi.fn()} />, {
      wrapper: makeWrapper(),
    });

    await user.type(screen.getByLabelText(/name/i), "Wingspan");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Wingspan" }),
      );
    });
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();

    render(<GameForm onSubmit={vi.fn()} onCancel={handleCancel} />, {
      wrapper: makeWrapper(),
    });

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(handleCancel).toHaveBeenCalled();
  });
});
