import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Game } from "../../types/domain";
import { AdminGamesTable } from "./AdminGamesTable";

const games: Game[] = [
  {
    id: "game-1",
    name: "Heat",
    slug: "heat",
    bggId: null,
    bggUrl: null,
    status: "owned",
    buyPriority: null,
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
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    tags: [],
  },
  {
    id: "game-2",
    name: "Wingspan",
    slug: "wingspan",
    bggId: null,
    bggUrl: null,
    status: "buy",
    buyPriority: 1,
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
    hidden: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    tags: [],
  },
];

describe("AdminGamesTable", () => {
  it("renders all game names", () => {
    render(<AdminGamesTable games={games} onEdit={vi.fn()} />);

    // Component renders both desktop table and mobile card list
    expect(screen.getAllByText("Heat").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Wingspan").length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText(/search games/i)).toHaveClass(
      "glass-input-field",
    );
    expect(screen.getAllByRole("button", { name: /edit/i })[0]).toHaveClass(
      "glass-action-button",
    );
  });

  it("shows status for each game", () => {
    render(<AdminGamesTable games={games} onEdit={vi.fn()} />);

    expect(screen.getAllByText("owned").length).toBeGreaterThan(0);
    expect(screen.getAllByText("buy").length).toBeGreaterThan(0);
  });

  it("shows a hidden badge for hidden games", () => {
    render(<AdminGamesTable games={games} onEdit={vi.fn()} />);

    expect(screen.getAllByText(/hidden/i).length).toBeGreaterThan(0);
  });

  it("filters games by search term", async () => {
    const user = userEvent.setup();

    render(<AdminGamesTable games={games} onEdit={vi.fn()} />);

    await user.type(screen.getByPlaceholderText(/search/i), "wing");

    expect(screen.getAllByText("Wingspan").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Heat")).toHaveLength(0);
  });

  it("uses shared glass classes for admin controls and cards", () => {
    const { container } = render(<AdminGamesTable games={games} onEdit={vi.fn()} />);

    expect(screen.getByPlaceholderText(/search/i)).toHaveClass("glass-input-field");
    expect(screen.getAllByRole("button", { name: /edit/i })[0]).toHaveClass("glass-action-button");
    expect(container.querySelector(".glass-selectable-card")).toBeInTheDocument();
  });

  it("calls onEdit when the edit button is clicked", async () => {
    const user = userEvent.setup();
    const handleEdit = vi.fn();

    render(<AdminGamesTable games={games} onEdit={handleEdit} />);

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    await user.click(editButtons[0]);

    expect(handleEdit).toHaveBeenCalledWith(games[0]);
  });
});
