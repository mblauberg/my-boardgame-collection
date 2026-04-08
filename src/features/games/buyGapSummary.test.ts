import { describe, it, expect } from "vitest";
import { summarizeBuyGaps } from "./buyGapSummary";
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

const gamesFixture: Game[] = [
  makeGame({
    id: "1",
    name: "Wingspan",
    status: "buy",
    category: "Animals",
    tags: [{ id: "t1", name: "Co-op", slug: "co-op", tagType: null, colour: null }],
  }),
  makeGame({
    id: "2",
    name: "Pandemic",
    status: "buy",
    category: "Animals",
    tags: [{ id: "t1", name: "Co-op", slug: "co-op", tagType: null, colour: null }],
  }),
  makeGame({
    id: "3",
    name: "Azul",
    status: "buy",
    category: "Abstract",
    tags: [],
    buyPriority: null,
  }),
  makeGame({
    id: "4",
    name: "Heat",
    status: "owned",
    category: "Racing",
    tags: [],
  }),
];

describe("summarizeBuyGaps", () => {
  it("summarises repeated gaps from tags and categories without duplicating labels", () => {
    expect(summarizeBuyGaps({ games: gamesFixture }).topTags).toContain("co-op");
  });

  it("returns top categories from buy items", () => {
    const result = summarizeBuyGaps({ games: gamesFixture });
    expect(result.topCategories[0]).toBe("Animals");
  });

  it("counts unprioritized buy items", () => {
    const result = summarizeBuyGaps({ games: gamesFixture });
    expect(result.unprioritizedCount).toBe(3);
  });

  it("is deterministic and side-effect free", () => {
    const r1 = summarizeBuyGaps({ games: gamesFixture });
    const r2 = summarizeBuyGaps({ games: gamesFixture });
    expect(r1).toEqual(r2);
  });
});
