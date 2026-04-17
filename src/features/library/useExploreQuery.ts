import { useQuery } from "@tanstack/react-query";
import {
  scenarioPresets,
  type ScenarioGame,
} from "../../config/scenarioPresets";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import {
  fetchGamesCatalogExploreCandidateRows,
  fetchGamesCatalogRowsByIds,
  mapGamesCatalogRow,
  type GamesCatalogExploreRow,
} from "../games/gamesCatalog";
import {
  buildExploreDaySeed,
  buildExploreShelves,
  type ExploreShelf as RankedExploreShelf,
} from "./exploreRanking";
import { libraryKeys } from "./libraryKeys";
import type { GameStatus } from "../../types/domain";

type ExploreGame = ReturnType<typeof mapGamesCatalogRow>;

type ExploreShelfData = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  sections: Array<{
    id: string;
    label: string;
    description: string;
    games: ExploreGame[];
  }>;
  entries: ExploreGame[];
};

const SCENARIO_GAME_STATUSES: readonly GameStatus[] = ["owned", "buy", "new_rec", "cut", "archived"];

export function resolveExplorePresets(presetIds?: readonly string[]) {
  const visiblePresetIds = presetIds?.length ? new Set(presetIds) : null;

  return scenarioPresets.filter(
    (preset) => preset.id !== "for-you" && (!visiblePresetIds || visiblePresetIds.has(preset.id)),
  );
}

function toScenarioStatus(status: string): GameStatus {
  if ((SCENARIO_GAME_STATUSES as readonly string[]).includes(status)) {
    return status as GameStatus;
  }

  return "archived";
}

function mapExploreCatalogRowToScenarioGame(row: GamesCatalogExploreRow): ScenarioGame {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: toScenarioStatus(row.status),
    hidden: row.hidden,
    buy_priority: row.buy_priority,
    bgg_rating: row.bgg_rating,
    bgg_weight: row.bgg_weight,
    bgg_rank: row.bgg_rank,
    bgg_num_ratings: row.bgg_usersrated,
    year_published: row.published_year,
    players_min: row.players_min,
    players_max: row.players_max,
    play_time_min: row.play_time_min,
    play_time_max: row.play_time_max,
    category: row.category,
    tags: row.tag_slugs ?? [],
  };
}

function getSelectedShelfGameIds(shelves: RankedExploreShelf[]): string[] {
  const selectedIds = new Set<string>();

  for (const shelf of shelves) {
    for (const game of shelf.entries) {
      selectedIds.add(game.id);
    }

    for (const section of shelf.sections) {
      for (const game of section.games) {
        selectedIds.add(game.id);
      }
    }
  }

  return [...selectedIds].sort();
}

function mergeExploreCandidateRows(candidateGroups: GamesCatalogExploreRow[][]) {
  const candidatesById = new Map<string, GamesCatalogExploreRow>();

  for (const rows of candidateGroups) {
    for (const row of rows) {
      candidatesById.set(row.id, row);
    }
  }

  return [...candidatesById.values()];
}

export async function fetchExploreData(
  presetIds?: readonly string[],
  daySeed = buildExploreDaySeed(new Date()),
) {
  const presets = resolveExplorePresets(presetIds);
  const candidateGroups = await Promise.all(
    presets.flatMap((preset) =>
      preset.sections.map((section) => fetchGamesCatalogExploreCandidateRows(section)),
    ),
  );
  const scenarioGames = mergeExploreCandidateRows(candidateGroups).map(mapExploreCatalogRowToScenarioGame);

  const rankedShelves: RankedExploreShelf[] = buildExploreShelves({
    games: scenarioGames,
    presets,
    daySeed,
  });

  const selectedGameIds = getSelectedShelfGameIds(rankedShelves);
  const selectedRows = await fetchGamesCatalogRowsByIds(selectedGameIds);
  const games = selectedRows.map(mapGamesCatalogRow);
  const gameById = new Map(games.map((game) => [game.id, game] as const));

  const shelves: ExploreShelfData[] = rankedShelves.map((shelf) => ({
    id: shelf.id,
    emoji: shelf.emoji,
    title: shelf.label,
    description: shelf.description,
    sections: shelf.sections.map((section) => ({
      id: section.id,
      label: section.label,
      description: section.description,
      games: section.games
        .map((game) => gameById.get(game.id))
        .filter((game): game is ExploreGame => Boolean(game)),
    })),
    entries: shelf.entries
      .map((game) => gameById.get(game.id))
      .filter((game): game is ExploreGame => Boolean(game)),
  }));

  return { shelves };
}

export function useExploreQuery(presetIds?: readonly string[]) {
  const daySeed = buildExploreDaySeed(new Date());

  return useQuery({
    queryKey: libraryKeys.explore(presetIds, daySeed),
    retry: shouldRetrySupabaseQuery,
    queryFn: () => fetchExploreData(presetIds, daySeed),
  });
}
