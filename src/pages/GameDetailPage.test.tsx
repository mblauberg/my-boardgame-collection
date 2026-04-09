import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { GameDetailPage } from "./GameDetailPage";

const updateMutationState = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));

const profileState = vi.hoisted(() => ({
  profile: null as any,
  isOwner: false,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}));

const profileFixture = {
  id: "user-1",
  email: "owner@example.com",
  role: "owner",
  username: "owner",
  is_profile_public: true,
  is_collection_public: true,
  is_saved_public: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

vi.mock("../features/games/useGameDetailQuery", () => ({
  useGameDetailQuery: vi.fn(),
}));

vi.mock("../features/games/useGameMutations", () => ({
  useContributeGameMetadata: vi.fn(() => updateMutationState),
}));

vi.mock("../features/auth/useProfile", () => ({
  useProfile: vi.fn(() => profileState),
}));

vi.mock("../components/games/GameDetailPanel", () => ({
  GameDetailPanel: ({ game }: { game: { name: string } }) => <div>{game.name}</div>,
}));

import { useGameDetailQuery } from "../features/games/useGameDetailQuery";

const game = {
  id: "game-1",
  name: "A Fake Artist",
  slug: "a-fake-artist",
  bggId: 266192,
  bggUrl: null,
  imageUrl: null,
  summary: null,
};

describe("GameDetailPage", () => {
  beforeEach(() => {
    profileState.profile = profileFixture;
    profileState.isOwner = false;
    profileState.isAuthenticated = true;
    updateMutationState.isPending = false;
    updateMutationState.mutateAsync = vi.fn();
  });

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

  it("saves pasted image URLs for games without images", async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({});
    profileState.isOwner = true;
    updateMutationState.mutateAsync = mutateAsync;

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

    await user.click(screen.getByRole("button", { name: /edit game/i }));
    await user.type(screen.getByLabelText(/image url/i), " https://example.com/cover.jpg ");
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        id: "game-1",
        imageUrl: "https://example.com/cover.jpg",
        summary: null,
        userId: "user-1",
        bggId: 266192,
        name: "A Fake Artist",
        slug: "a-fake-artist",
        bggUrl: null,
      });
    });
  });

  it("shows an error message when saving fails", async () => {
    const user = userEvent.setup();
    updateMutationState.mutateAsync = vi.fn().mockRejectedValue(new Error("Function not found"));

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

    await user.click(screen.getByRole("button", { name: /edit game/i }));
    await user.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByText(/unable to save your edits/i)).toBeInTheDocument();
    });
  });
});
