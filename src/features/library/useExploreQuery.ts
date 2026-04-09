import { useGamesQuery } from "../games/useGamesQuery";
import { useLibraryQuery } from "./useLibraryQuery";
import type { Game } from "../../types/domain";
import {
  selectDiscoveryByMechanic,
  selectForYou,
  selectNewReleases,
  selectTrendingNow,
  type ExploreCandidate,
  type ExploreInput,
} from "./exploreSelectors";

function isGame(value: Game | undefined): value is Game {
  return value !== undefined;
}

function toCandidate(game: Game): ExploreCandidate {
  return {
    gameId: game.id,
    name: game.name,
    slug: game.slug,
    tags: game.tags.map((tag: Game["tags"][number]) => tag.slug),
    publishedYear: game.publishedYear,
    saveCountLast30Days: 0,
    saveCountAllTime: 0,
    averageRating: game.bggRating,
    averageWeight: game.bggWeight,
    game,
  };
}

export function useExploreQuery() {
  const gamesQuery = useGamesQuery();
  const libraryQuery = useLibraryQuery();

  const isLoading = gamesQuery.isLoading || libraryQuery.isLoading;
  const error = gamesQuery.error ?? libraryQuery.error ?? null;

  if (isLoading) {
    return { data: undefined, isLoading: true, error: null };
  }

  if (error) {
    return { data: undefined, isLoading: false, error };
  }

  const libraryEntries = libraryQuery.data ?? [];
  const savedGameIds = new Set(
    libraryEntries
      .filter((entry) => entry.isSaved || entry.isInCollection)
      .map((entry) => entry.gameId),
  );
  const catalog = (gamesQuery.data ?? []).map(toCandidate);
  const saveCountByGameId = new Map<string, number>();

  for (const entry of libraryEntries) {
    if (!entry.isSaved && !entry.isInCollection) continue;
    saveCountByGameId.set(entry.gameId, (saveCountByGameId.get(entry.gameId) ?? 0) + 1);
  }

  for (const candidate of catalog) {
    const count = saveCountByGameId.get(candidate.gameId) ?? 0;
    candidate.saveCountLast30Days = count;
    candidate.saveCountAllTime = count;
  }

  const selectorInput: ExploreInput = {
    catalog,
    libraryEntries: libraryEntries.map((entry) => ({
      gameId: entry.gameId,
      isSaved: entry.isSaved,
      isLoved: entry.isLoved,
      isInCollection: entry.isInCollection,
      sentiment: entry.sentiment,
      tags: entry.sharedTags.map((tag) => tag.slug),
    })),
    savedGameIds,
    now: new Date(),
  };

  return {
    data: {
      shelves: [
        {
          id: "for-you",
          title: "For You",
          entries: selectForYou(selectorInput).map((candidate) => candidate.game).filter(isGame),
        },
        {
          id: "trending",
          title: "Trending Now",
          entries: selectTrendingNow(catalog).map((candidate) => candidate.game).filter(isGame),
        },
        {
          id: "mechanic",
          title: "Discovery by Mechanic",
          entries: selectDiscoveryByMechanic(selectorInput)
            .map((candidate) => candidate.game)
            .filter(isGame),
        },
        {
          id: "new",
          title: "New Releases",
          entries: selectNewReleases(catalog, selectorInput.now)
            .map((candidate) => candidate.game)
            .filter(isGame),
        },
      ],
    },
    isLoading: false,
    error: null,
  };
}
