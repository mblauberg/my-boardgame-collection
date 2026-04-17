import { describe, expect, it } from "vitest";

import type { ScenarioGame, ScenarioPreset, ScenarioSection } from "../../config/scenarioPresets";
import {
  buildExploreDaySeed,
  buildExploreShelves,
  rankDiscoveryCandidates,
  scoreDiscoveryCandidate,
  selectShelfGames,
} from "./exploreRanking";

function createGame(
  id: string,
  overrides: Partial<ScenarioGame> = {},
): ScenarioGame {
  return {
    id,
    name: id,
    slug: id,
    status: "owned",
    hidden: false,
    buy_priority: null,
    bgg_rating: 7,
    bgg_weight: 2.5,
    bgg_rank: 100,
    bgg_num_ratings: 5_000,
    year_published: 2024,
    players_min: 2,
    players_max: 4,
    play_time_min: 45,
    play_time_max: 60,
    category: "Strategy",
    tags: ["engine-building"],
    ...overrides,
  };
}

function createDiscoverySection(
  overrides: Partial<ScenarioSection> = {},
): ScenarioSection {
  return {
    id: "discovery-section",
    label: "Discovery",
    description: "Discovery shelf",
    rankingMode: "discovery",
    dedupe: "avoid-previous",
    useStatusFilter: false,
    displayLimit: 3,
    candidatePoolSize: 6,
    rule: {
      statuses: ["owned"],
      limit: 6,
      minPlayers: 2,
      maxPlayers: 4,
      maxTime: 60,
      sortBy: "rating_desc",
    },
    ...overrides,
  };
}

function createCanonicalSection(
  overrides: Partial<ScenarioSection> = {},
): ScenarioSection {
  return {
    id: "canonical-section",
    label: "Canonical",
    description: "Canonical shelf",
    rankingMode: "canonical",
    dedupe: "none",
    useStatusFilter: false,
    displayLimit: 3,
    candidatePoolSize: 3,
    rule: {
      statuses: ["owned"],
      limit: 3,
      sortBy: "rank_asc",
      minRatingsCount: 1,
    },
    ...overrides,
  };
}

describe("buildExploreDaySeed", () => {
  it("uses the UTC calendar day", () => {
    expect(buildExploreDaySeed(new Date("2026-04-12T23:45:00-05:00"))).toBe("2026-04-13");
  });
});

describe("selectShelfGames", () => {
  it("preserves exact comparator ordering for canonical shelves", () => {
    const section = createCanonicalSection({
      rule: {
        ...createCanonicalSection().rule,
        statuses: ["owned", "buy", "archived"],
      },
    });
    const games = [
      createGame("rank-30", { status: "archived", bgg_rank: 30 }),
      createGame("rank-10", { status: "owned", bgg_rank: 10 }),
      createGame("rank-20", { status: "buy", bgg_rank: 20 }),
    ];

    const result = selectShelfGames({
      games,
      section,
      selectedIds: new Set(),
      daySeed: "2026-04-12",
    });

    expect(result.map((game) => game.id)).toEqual(["rank-10", "rank-20", "rank-30"]);
  });

  it("ignores legacy status filters by default for canonical shelves", () => {
    const section = createCanonicalSection({
      rule: {
        ...createCanonicalSection().rule,
        statuses: ["owned"],
      },
    });
    const games = [
      createGame("owned-game", { status: "owned", bgg_rank: 10 }),
      createGame("archived-game", { status: "archived", bgg_rank: 5 }),
    ];

    const result = selectShelfGames({
      games,
      section,
      selectedIds: new Set(),
      daySeed: "2026-04-12",
    });

    expect(result.map((game) => game.id)).toEqual(["archived-game", "owned-game"]);
  });

  it("respects canonical status filters when explicitly enabled", () => {
    const section = createCanonicalSection({
      useStatusFilter: true,
      rule: {
        ...createCanonicalSection().rule,
        statuses: ["owned"],
      },
    });
    const games = [
      createGame("owned-game", { status: "owned", bgg_rank: 10 }),
      createGame("archived-game", { status: "archived", bgg_rank: 5 }),
    ];

    const result = selectShelfGames({
      games,
      section,
      selectedIds: new Set(),
      daySeed: "2026-04-12",
    });

    expect(result.map((game) => game.id)).toEqual(["owned-game"]);
  });

  it("returns the top displayLimit canonical games regardless of candidatePoolSize", () => {
    const section = createCanonicalSection({
      displayLimit: 3,
      candidatePoolSize: 1,
      rule: {
        ...createCanonicalSection().rule,
        limit: 3,
        statuses: ["owned", "buy", "archived"],
      },
    });
    const games = [
      createGame("rank-3", { status: "archived", bgg_rank: 3 }),
      createGame("rank-1", { status: "owned", bgg_rank: 1 }),
      createGame("rank-2", { status: "buy", bgg_rank: 2 }),
    ];

    const result = selectShelfGames({
      games,
      section,
      selectedIds: new Set(),
      daySeed: "2026-04-12",
    });

    expect(result.map((game) => game.id)).toEqual(["rank-1", "rank-2", "rank-3"]);
  });

  it("rotates discovery shelves deterministically within one UTC day", () => {
    const section = createDiscoverySection();
    const games = Array.from({ length: 6 }, (_, index) =>
      createGame(`tie-${index + 1}`, {
        bgg_rating: 7,
        bgg_rank: 100,
        bgg_num_ratings: 1_000,
        year_published: 2022,
        bgg_weight: 2.5,
        players_min: 2,
        players_max: 4,
        play_time_min: 45,
        play_time_max: 60,
      }),
    );

    const first = selectShelfGames({
      games,
      section,
      selectedIds: new Set(),
      daySeed: "2026-04-12",
    });
    const second = selectShelfGames({
      games,
      section,
      selectedIds: new Set(),
      daySeed: "2026-04-12",
    });

    expect(first.map((game) => game.id)).toEqual(second.map((game) => game.id));
  });

  it("seed-rotates candidates within the same rounded score band", () => {
    const section = createDiscoverySection();
    const games = Array.from({ length: 4 }, (_, index) =>
      createGame(`band-${index + 1}`, {
        bgg_rating: 7,
        bgg_rank: 100,
        bgg_num_ratings: 1_000,
        year_published: 2022,
        bgg_weight: 2.5,
        players_min: 2,
        players_max: 4,
        play_time_min: 45,
        play_time_max: 60,
      }),
    );

    const buckets = new Set(
      games.map((game) => Math.round(scoreDiscoveryCandidate(game, section) * 20)),
    );

    expect(buckets.size).toBe(1);

    const firstDay = rankDiscoveryCandidates(games, section, "2026-04-12");
    const secondDay = rankDiscoveryCandidates(games, section, "2026-04-13");

    expect(firstDay.map((game) => game.id)).not.toEqual(secondDay.map((game) => game.id));
  });

  it("preserves rule-fit precedence ahead of quality and confidence", () => {
    const section = createDiscoverySection({
      displayLimit: 2,
      candidatePoolSize: 2,
      rule: {
        ...createDiscoverySection().rule,
        limit: 2,
        categoryIncludes: ["strategy"],
      },
    });
    const games = [
      createGame("strong-fit", {
        category: "Strategy",
        bgg_rating: 7.2,
        bgg_rank: 1_500,
        bgg_num_ratings: 600,
      }),
      createGame("better-quality", {
        category: null,
        bgg_rating: 9.4,
        bgg_rank: 50,
        bgg_num_ratings: 20_000,
      }),
    ];

    const result = rankDiscoveryCandidates(games, section, "2026-04-12");

    expect(result.map((game) => game.id)).toEqual(["strong-fit", "better-quality"]);
  });

  it("preserves near-tied precedence before seeded shuffle", () => {
    const section = createDiscoverySection({
      displayLimit: 2,
      candidatePoolSize: 2,
      rule: {
        ...createDiscoverySection().rule,
        limit: 2,
        categoryIncludes: ["strategy"],
      },
    });
    const games = [
      createGame("slightly-better-fit", {
        category: "Strategy Euro",
        bgg_rating: 8.0,
        bgg_rank: 400,
        bgg_num_ratings: 3_500,
      }),
      createGame("slightly-better-quality", {
        category: null,
        bgg_rating: 8.1,
        bgg_rank: 350,
        bgg_num_ratings: 3_700,
      }),
    ];

    const firstDay = rankDiscoveryCandidates(games, section, "2026-04-12");
    const secondDay = rankDiscoveryCandidates(games, section, "2026-04-13");

    expect(firstDay.map((game) => game.id)).toEqual([
      "slightly-better-fit",
      "slightly-better-quality",
    ]);
    expect(secondDay.map((game) => game.id)).toEqual([
      "slightly-better-fit",
      "slightly-better-quality",
    ]);
  });

  it("dedupes discovery shelves against earlier selected games", () => {
    const section = createDiscoverySection({
      displayLimit: 2,
      candidatePoolSize: 4,
      rule: {
        ...createDiscoverySection().rule,
        limit: 4,
      },
    });
    const games = [
      createGame("best", { bgg_rating: 9.4, bgg_rank: 10 }),
      createGame("second", { bgg_rating: 9.1, bgg_rank: 20 }),
      createGame("third", { bgg_rating: 8.9, bgg_rank: 30 }),
      createGame("fourth", { bgg_rating: 8.7, bgg_rank: 40 }),
    ];

    const result = selectShelfGames({
      games,
      section,
      selectedIds: new Set(["best"]),
      daySeed: "2026-04-12",
    });

    expect(result.map((game) => game.id)).toEqual(["second", "third"]);
  });

  it("does not remove games from canonical shelves during dedupe", () => {
    const section = createCanonicalSection();
    const games = [
      createGame("repeat-me", { bgg_rank: 1 }),
      createGame("rank-2", { bgg_rank: 2 }),
      createGame("rank-3", { bgg_rank: 3 }),
    ];

    const result = selectShelfGames({
      games,
      section,
      selectedIds: new Set(["repeat-me"]),
      daySeed: "2026-04-12",
    });

    expect(result.map((game) => game.id)).toEqual(["repeat-me", "rank-2", "rank-3"]);
  });

  it("keeps discovery candidates with missing metadata and applies a confidence penalty instead", () => {
    const section = createDiscoverySection({
      displayLimit: 2,
      candidatePoolSize: 3,
      rule: {
        ...createDiscoverySection().rule,
        limit: 3,
        minRating: 7,
        minRatingsCount: 100,
        minYear: 2020,
        maxWeight: 3,
      },
    });
    const games = [
      createGame("complete", {
        bgg_rating: 8.8,
        bgg_num_ratings: 8_000,
        year_published: 2024,
        bgg_weight: 2.2,
      }),
      createGame("missing-metadata", {
        bgg_rating: null,
        bgg_num_ratings: null,
        year_published: null,
        bgg_weight: null,
      }),
      createGame("failing-metadata", {
        bgg_rating: 6.2,
        bgg_num_ratings: 50,
        year_published: 2015,
        bgg_weight: 3.8,
      }),
    ];

    const result = selectShelfGames({
      games,
      section,
      selectedIds: new Set(),
      daySeed: "2026-04-12",
    });

    expect(result.map((game) => game.id)).toEqual(["complete", "missing-metadata"]);
  });

  it("ignores legacy status filters by default for discovery shelves", () => {
    const section = createDiscoverySection({
      displayLimit: 2,
      candidatePoolSize: 2,
      rule: {
        ...createDiscoverySection().rule,
        limit: 2,
        statuses: ["owned"],
      },
    });
    const games = [
      createGame("owned-game", { status: "owned", bgg_rating: 8.2 }),
      createGame("archived-game", { status: "archived", bgg_rating: 8.1 }),
    ];

    const result = selectShelfGames({
      games,
      section,
      selectedIds: new Set(),
      daySeed: "2026-04-12",
    });

    expect(result.map((game) => game.id)).toContain("archived-game");
  });

  it("respects status filters when explicitly enabled", () => {
    const section = createDiscoverySection({
      useStatusFilter: true,
      displayLimit: 2,
      candidatePoolSize: 2,
      rule: {
        ...createDiscoverySection().rule,
        limit: 2,
        statuses: ["owned"],
      },
    });
    const games = [
      createGame("owned-game", { status: "owned", bgg_rating: 8.2 }),
      createGame("archived-game", { status: "archived", bgg_rating: 8.1 }),
    ];

    const result = selectShelfGames({
      games,
      section,
      selectedIds: new Set(),
      daySeed: "2026-04-12",
    });

    expect(result.map((game) => game.id)).toEqual(["owned-game"]);
  });
});

describe("buildExploreShelves", () => {
  it("expands beyond the initial candidate pool before relaxing dedupe", () => {
    const games = [
      createGame("repeat-me", { bgg_rating: 9.6, bgg_rank: 1 }),
      createGame("next-up", { bgg_rating: 9.2, bgg_rank: 2 }),
      createGame("later", { bgg_rating: 8.9, bgg_rank: 3 }),
      createGame("reserve", { bgg_rating: 8.8, bgg_rank: 4 }),
    ];
    const presets: ScenarioPreset[] = [
      {
        id: "mixed",
        emoji: "🧪",
        label: "Mixed",
        description: "Mixed shelf",
        sections: [
          createCanonicalSection({
            id: "canonical-first",
            label: "Canonical first",
            displayLimit: 2,
            candidatePoolSize: 2,
            rule: {
              ...createCanonicalSection().rule,
              limit: 2,
            },
          }),
          createDiscoverySection({
            id: "discovery-second",
            label: "Discovery second",
            displayLimit: 2,
            candidatePoolSize: 2,
            rule: {
              ...createDiscoverySection().rule,
              limit: 4,
            },
          }),
        ],
      },
    ];

    const [shelf] = buildExploreShelves({
      games,
      presets,
      daySeed: "2026-04-12",
    });

    expect(shelf?.sections[0]?.games.map((game) => game.id)).toEqual(["repeat-me", "next-up"]);
    expect(shelf?.sections[1]?.games.map((game) => game.id)).toEqual(["later", "reserve"]);
  });
});
