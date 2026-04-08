import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameDetailPanel } from "./GameDetailPanel";
import type { Game } from "../../types/domain";

describe("GameDetailPanel", () => {
  const gameFixture: Game = {
    id: "1",
    name: "Heat",
    slug: "heat",
    bggId: 366013,
    bggUrl: "https://boardgamegeek.com/boardgame/366013/heat",
    status: "owned",
    buyPriority: null,
    bggRating: 8.1,
    bggWeight: 2.5,
    playersMin: 1,
    playersMax: 6,
    playTimeMin: 30,
    playTimeMax: 60,
    category: "Racing",
    summary: "A racing game about heat management",
    notes: "Great game for groups",
    recommendationVerdict: null,
    recommendationColour: null,
    gapReason: null,
    isExpansionIncluded: false,
    imageUrl: "https://example.com/heat.jpg",
    publishedYear: 2022,
    hidden: false,
    createdAt: "",
    updatedAt: "",
    tags: [
      { id: "t1", name: "Racing", slug: "racing", tagType: "theme", colour: "#ff0000" },
    ],
  };

  it("renders metadata, notes, and BGG link for a game", () => {
    render(<GameDetailPanel game={gameFixture} />);

    expect(screen.getByText("Heat")).toBeInTheDocument();
    expect(screen.getByText("Published: 2022")).toBeInTheDocument();
    expect(screen.getByText("8.1")).toBeInTheDocument();
    expect(screen.getByText("Great game for groups")).toBeInTheDocument();

    const bggLink = screen.getByRole("link", { name: /boardgamegeek/i });
    expect(bggLink).toHaveAttribute("href", gameFixture.bggUrl);
  });

  it("renders tags", () => {
    render(<GameDetailPanel game={gameFixture} />);
    expect(screen.getByText("Racing")).toBeInTheDocument();
  });

  it("renders summary and notes sections", () => {
    render(<GameDetailPanel game={gameFixture} />);
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("A racing game about heat management")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });
});
