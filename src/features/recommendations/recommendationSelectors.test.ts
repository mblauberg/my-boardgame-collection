import { describe, it, expect } from "vitest";
import { selectRecommendations } from "./recommendationSelectors";
import type { Game } from "../../types/domain";

function makeGame(overrides: Partial<Game>): Game {
  return {
    id: "1",
    name: "Test Game",
    slug: "test-game",
    bggId: null,
    bggUrl: null,
    status: "new_rec",
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
    ...overrides,
  };
}

describe("selectRecommendations", () => {
  it("returns only new_rec items", () => {
    const games: Game[] = [
      makeGame({ id: "1", status: "new_rec" }),
      makeGame({ id: "2", status: "owned" }),
      makeGame({ id: "3", status: "buy" }),
      makeGame({ id: "4", status: "new_rec" }),
    ];
    const result = selectRecommendations(games);
    expect(result).toHaveLength(2);
    expect(result.every((g) => g.status === "new_rec")).toBe(true);
  });

  it("preserves verdict text and colour", () => {
    const game = makeGame({
      recommendationVerdict: "Strong fit for our group",
      recommendationColour: "#22c55e",
    });
    const [rec] = selectRecommendations([game]);
    expect(rec.recommendationVerdict).toBe("Strong fit for our group");
    expect(rec.recommendationColour).toBe("#22c55e");
  });

  it("maps summary to why-it-fits section", () => {
    const game = makeGame({ summary: "Great engine builder" });
    const [rec] = selectRecommendations([game]);
    expect(rec.summary).toBe("Great engine builder");
  });

  it("maps notes to overlap/caveat section", () => {
    const game = makeGame({ notes: "Overlaps with Wingspan" });
    const [rec] = selectRecommendations([game]);
    expect(rec.notes).toBe("Overlaps with Wingspan");
  });

  it("maps gapReason to collection gap note", () => {
    const game = makeGame({ gapReason: "Fills the co-op gap" });
    const [rec] = selectRecommendations([game]);
    expect(rec.gapReason).toBe("Fills the co-op gap");
  });

  it("orders by name for stable tie-breaking", () => {
    const games: Game[] = [
      makeGame({ id: "1", name: "Wingspan", updatedAt: "2026-01-01T00:00:00Z" }),
      makeGame({ id: "2", name: "Arnak", updatedAt: "2026-01-01T00:00:00Z" }),
      makeGame({ id: "3", name: "Brass", updatedAt: "2026-01-01T00:00:00Z" }),
    ];
    const result = selectRecommendations(games);
    expect(result.map((g) => g.name)).toEqual(["Arnak", "Brass", "Wingspan"]);
  });

  it("returns empty array when no new_rec items", () => {
    const games: Game[] = [makeGame({ status: "owned" }), makeGame({ status: "buy" })];
    expect(selectRecommendations(games)).toHaveLength(0);
  });
});
