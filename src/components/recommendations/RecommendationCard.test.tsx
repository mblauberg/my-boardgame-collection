import { render, screen } from "@testing-library/react";
import { RecommendationCard } from "./RecommendationCard";
import type { Game } from "../../types/domain";

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: "1",
    name: "Arnak",
    slug: "arnak",
    bggId: null,
    bggUrl: null,
    status: "new_rec",
    buyPriority: null,
    bggRating: 8.1,
    bggWeight: 2.9,
    playersMin: 1,
    playersMax: 4,
    playTimeMin: 60,
    playTimeMax: 120,
    category: "Adventure",
    summary: "Great engine builder with exploration",
    notes: "Overlaps with Wingspan on tableau building",
    recommendationVerdict: "Strong fit for our group",
    recommendationColour: "#22c55e",
    gapReason: "Fills the exploration gap",
    isExpansionIncluded: false,
    imageUrl: null,
    publishedYear: 2020,
    hidden: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    tags: [{ id: "t1", name: "Strategy", slug: "strategy", tagType: null, colour: "#3b82f6" }],
    ...overrides,
  };
}

describe("RecommendationCard", () => {
  it("renders the game name", () => {
    render(<RecommendationCard game={makeGame()} isOwner={false} onEdit={() => {}} onPromote={() => {}} />);
    expect(screen.getByText("Arnak")).toBeInTheDocument();
  });

  it("renders verdict text", () => {
    render(<RecommendationCard game={makeGame()} isOwner={false} onEdit={() => {}} onPromote={() => {}} />);
    expect(screen.getByText("Strong fit for our group")).toBeInTheDocument();
  });

  it("renders why-it-fits from summary", () => {
    render(<RecommendationCard game={makeGame()} isOwner={false} onEdit={() => {}} onPromote={() => {}} />);
    expect(screen.getByText("Great engine builder with exploration")).toBeInTheDocument();
  });

  it("renders overlap notes", () => {
    render(<RecommendationCard game={makeGame()} isOwner={false} onEdit={() => {}} onPromote={() => {}} />);
    expect(screen.getByText("Overlaps with Wingspan on tableau building")).toBeInTheDocument();
  });

  it("renders gap reason", () => {
    render(<RecommendationCard game={makeGame()} isOwner={false} onEdit={() => {}} onPromote={() => {}} />);
    expect(screen.getByText("Fills the exploration gap")).toBeInTheDocument();
  });

  it("renders metadata: category, weight, players, time", () => {
    render(<RecommendationCard game={makeGame()} isOwner={false} onEdit={() => {}} onPromote={() => {}} />);
    expect(screen.getByText(/Adventure/)).toBeInTheDocument();
    expect(screen.getByText(/2\.9/)).toBeInTheDocument();
    expect(screen.getByText(/1–4/)).toBeInTheDocument();
    expect(screen.getByText(/60–120/)).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<RecommendationCard game={makeGame()} isOwner={false} onEdit={() => {}} onPromote={() => {}} />);
    expect(screen.getByText("Strategy")).toBeInTheDocument();
  });

  it("hides owner controls when not owner", () => {
    render(<RecommendationCard game={makeGame()} isOwner={false} onEdit={() => {}} onPromote={() => {}} />);
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /buy/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /owned/i })).not.toBeInTheDocument();
  });

  it("shows owner controls when isOwner", () => {
    render(<RecommendationCard game={makeGame()} isOwner={true} onEdit={() => {}} onPromote={() => {}} />);
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move to buy/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark owned/i })).toBeInTheDocument();
  });
});
