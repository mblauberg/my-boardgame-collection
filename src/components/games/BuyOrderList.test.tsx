import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BuyOrderList } from "./BuyOrderList";
import type { Game } from "../../types/domain";

const makeGame = (overrides: Partial<Game>): Game => ({
  id: "1",
  name: "Test",
  slug: "test",
  status: "buy",
  buyPriority: null,
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
  ...overrides,
});

describe("BuyOrderList", () => {
  const onStatusChange = vi.fn();
  const onPriorityChange = vi.fn();

  it("renders numbered priorities in order", () => {
    const games = [
      makeGame({ id: "1", name: "Heat", buyPriority: 1 }),
      makeGame({ id: "2", name: "Quacks", buyPriority: 2 }),
    ];
    render(<BuyOrderList games={games} isOwner={false} onStatusChange={onStatusChange} onPriorityChange={onPriorityChange} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders null priorities at the bottom", () => {
    const games = [
      makeGame({ id: "1", name: "Heat", buyPriority: 1 }),
      makeGame({ id: "2", name: "Azul", buyPriority: null }),
    ];
    render(<BuyOrderList games={games} isOwner={false} onStatusChange={onStatusChange} onPriorityChange={onPriorityChange} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Heat");
    expect(items[1]).toHaveTextContent("Azul");
  });

  it("renders summary when present", () => {
    const games = [makeGame({ summary: "A great racing game" })];
    render(<BuyOrderList games={games} isOwner={false} onStatusChange={onStatusChange} onPriorityChange={onPriorityChange} />);
    expect(screen.getByText("A great racing game")).toBeInTheDocument();
  });

  it("renders notes when present", () => {
    const games = [makeGame({ notes: "Need to buy this" })];
    render(<BuyOrderList games={games} isOwner={false} onStatusChange={onStatusChange} onPriorityChange={onPriorityChange} />);
    expect(screen.getByText("Need to buy this")).toBeInTheDocument();
  });

  it("renders gapReason when present", () => {
    const games = [makeGame({ gapReason: "Missing co-op games" })];
    render(<BuyOrderList games={games} isOwner={false} onStatusChange={onStatusChange} onPriorityChange={onPriorityChange} />);
    expect(screen.getByText("Missing co-op games")).toBeInTheDocument();
  });

  it("shows owner actions when isOwner is true", () => {
    const games = [makeGame({ name: "Heat" })];
    render(<BuyOrderList games={games} isOwner={true} onStatusChange={onStatusChange} onPriorityChange={onPriorityChange} />);
    expect(screen.getByRole("button", { name: /mark owned/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cut/i })).toBeInTheDocument();
  });

  it("does not show owner actions when isOwner is false", () => {
    const games = [makeGame({ name: "Heat" })];
    render(<BuyOrderList games={games} isOwner={false} onStatusChange={onStatusChange} onPriorityChange={onPriorityChange} />);
    expect(screen.queryByRole("button", { name: /mark owned/i })).not.toBeInTheDocument();
  });
});
