import type { Game } from "../../types/domain";
import type { LibraryListType, LibrarySentiment } from "./library.types";

export type ExploreCandidate = {
  gameId: string;
  name: string;
  slug: string;
  tags: string[];
  publishedYear: number | null;
  saveCountLast30Days: number;
  saveCountAllTime: number;
  averageRating: number | null;
  averageWeight: number | null;
  game?: Game;
};

export type ExploreLibrarySignal = {
  gameId: string;
  listType: LibraryListType;
  sentiment: LibrarySentiment;
  tags: string[];
};

export type ExploreInput = {
  catalog: ExploreCandidate[];
  libraryEntries: ExploreLibrarySignal[];
  savedGameIds: Set<string>;
  now: Date;
};

function scoreCandidate(candidate: ExploreCandidate, input: ExploreInput) {
  let score = 0;

  for (const entry of input.libraryEntries) {
    if (entry.gameId === candidate.gameId) continue;

    const sharedTags = candidate.tags.filter((tag) => entry.tags.includes(tag)).length;
    if (sharedTags === 0) continue;

    if (entry.sentiment === "like") score += sharedTags * 3;
    else if (entry.sentiment === "dislike") score -= sharedTags * 3;
    else if (entry.listType === "collection") score += sharedTags * 2;
    else if (entry.listType === "wishlist") score += sharedTags;
  }

  return score;
}

export function selectForYou(input: ExploreInput) {
  return input.catalog
    .filter((candidate) => !input.savedGameIds.has(candidate.gameId))
    .map((candidate) => ({ ...candidate, score: scoreCandidate(candidate, input) }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.name.localeCompare(right.name);
    });
}

export function selectTrendingNow(catalog: ExploreCandidate[]) {
  return [...catalog].sort((left, right) => {
    if (right.saveCountLast30Days !== left.saveCountLast30Days) {
      return right.saveCountLast30Days - left.saveCountLast30Days;
    }

    if (right.saveCountAllTime !== left.saveCountAllTime) {
      return right.saveCountAllTime - left.saveCountAllTime;
    }

    return left.name.localeCompare(right.name);
  });
}

export function selectDiscoveryByMechanic(input: ExploreInput) {
  const topTags = input.libraryEntries.flatMap((entry) => entry.tags);
  const uniqueTags = [...new Set(topTags)];

  return input.catalog
    .filter((candidate) => !input.savedGameIds.has(candidate.gameId))
    .filter((candidate) => candidate.tags.some((tag) => uniqueTags.includes(tag)))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function selectNewReleases(catalog: ExploreCandidate[], now: Date) {
  const currentYear = now.getUTCFullYear();
  return catalog
    .filter((candidate) => candidate.publishedYear != null && candidate.publishedYear >= currentYear - 2)
    .sort((left, right) => {
      if ((right.publishedYear ?? 0) !== (left.publishedYear ?? 0)) {
        return (right.publishedYear ?? 0) - (left.publishedYear ?? 0);
      }

      return left.name.localeCompare(right.name);
    });
}
