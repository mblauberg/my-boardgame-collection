import type { Game } from "../../types/domain";

export type BuyGapSummary = {
  topCategories: string[];
  topTags: string[];
  unprioritizedCount: number;
};

export function summarizeBuyGaps({ games }: { games: Game[] }): BuyGapSummary {
  const buyItems = games.filter((game) => game.status === "buy");

  const categoryCount = new Map<string, number>();
  const tagCount = new Map<string, number>();
  let unprioritizedCount = 0;

  for (const game of buyItems) {
    if (game.buyPriority === null) {
      unprioritizedCount++;
    }

    if (game.category) {
      categoryCount.set(game.category, (categoryCount.get(game.category) || 0) + 1);
    }

    for (const tag of game.tags) {
      tagCount.set(tag.slug, (tagCount.get(tag.slug) || 0) + 1);
    }
  }

  const topCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  const topTags = Array.from(tagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => slug);

  return {
    topCategories,
    topTags,
    unprioritizedCount,
  };
}
