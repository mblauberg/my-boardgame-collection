import { describe, it, expect } from "vitest";
import { selectBuyOrder } from "./buyOrderSelectors";
import type { Game } from "../../types/domain";

const gamesFixture: Game[] = [
  {
    id: "1",
    name: "Quacks",
    slug: "quacks",
    status: "buy",
    buyPriority: 2,
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
  },
  {
    id: "2",
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
  },
  {
    id: "3",
    name: "Ark Nova",
    slug: "ark-nova",
    status: "owned",
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
  },
  {
    id: "4",
    name: "Azul",
    slug: "azul",
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
  },
];

describe("selectBuyOrder", () => {
  it("sorts buy items by ascending priority and stable name fallback", () => {
    expect(selectBuyOrder(gamesFixture).map((game) => game.name)).toEqual([
      "Heat",
      "Quacks",
      "Azul",
    ]);
  });

  it("filters out non-buy items", () => {
    const result = selectBuyOrder(gamesFixture);
    expect(result.every((game) => game.status === "buy")).toBe(true);
  });

  it("places null priorities after numbered priorities", () => {
    const result = selectBuyOrder(gamesFixture);
    expect(result[0].buyPriority).toBe(1);
    expect(result[1].buyPriority).toBe(2);
    expect(result[2].buyPriority).toBe(null);
  });
});
