import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Tag } from "../../types/domain";
import { GameTagSelector } from "./GameTagSelector";

const mockUpdateGameTags = vi.fn();

vi.mock("../../features/games/useGameMutations", () => ({
  useUpdateGameTags: () => ({ mutateAsync: mockUpdateGameTags, isPending: false }),
}));

const allTags: Tag[] = [
  { id: "t1", name: "Racing", slug: "racing", tagType: "theme", colour: "#ff0000" },
  { id: "t2", name: "Card Game", slug: "card-game", tagType: "mechanic", colour: null },
  { id: "t3", name: "Worker Placement", slug: "worker-placement", tagType: "mechanic", colour: null },
];

const assignedTags: Tag[] = [allTags[0]];

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("GameTagSelector", () => {
  beforeEach(() => {
    mockUpdateGameTags.mockReset();
    mockUpdateGameTags.mockResolvedValue(undefined);
  });

  it("renders all available tags as checkboxes", () => {
    render(
      <GameTagSelector gameId="game-1" allTags={allTags} assignedTags={assignedTags} />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByLabelText("Racing")).toBeInTheDocument();
    expect(screen.getByLabelText("Card Game")).toBeInTheDocument();
    expect(screen.getByLabelText("Worker Placement")).toBeInTheDocument();
  });

  it("pre-checks already assigned tags", () => {
    render(
      <GameTagSelector gameId="game-1" allTags={allTags} assignedTags={assignedTags} />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByLabelText("Racing")).toBeChecked();
    expect(screen.getByLabelText("Card Game")).not.toBeChecked();
  });

  it("calls updateGameTags without duplicates when a tag is toggled and saved", async () => {
    const user = userEvent.setup();

    render(
      <GameTagSelector gameId="game-1" allTags={allTags} assignedTags={assignedTags} />,
      { wrapper: makeWrapper() },
    );

    // Toggle "Card Game" on
    await user.click(screen.getByLabelText("Card Game"));
    await user.click(screen.getByRole("button", { name: /save tags/i }));

    await waitFor(() => {
      expect(mockUpdateGameTags).toHaveBeenCalledWith({
        gameId: "game-1",
        tagIds: expect.arrayContaining(["t1", "t2"]),
      });
    });

    // Verify no duplicates
    const call = mockUpdateGameTags.mock.calls[0][0];
    const unique = new Set(call.tagIds);
    expect(unique.size).toBe(call.tagIds.length);
  });
});
