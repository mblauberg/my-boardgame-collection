import { useQuery } from "@tanstack/react-query";
import {
  selectGamesForRule,
  scenarioPresets,
  type Rule,
  type ScenarioGame,
} from "../../config/scenarioPresets";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { fetchGamesCatalogRows, mapGamesCatalogRow } from "../games/gamesCatalog";
import { libraryKeys } from "./libraryKeys";

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

export function resolveExplorePresets(presetIds?: readonly string[]) {
  const visiblePresetIds = presetIds?.length ? new Set(presetIds) : null;

  return scenarioPresets.filter(
    (preset) => preset.id !== "for-you" && (!visiblePresetIds || visiblePresetIds.has(preset.id)),
  );
}

const EXPLORE_STATUSES = ["owned", "buy", "new_rec", "cut", "archived"] as const;

function withExploreRule(rule: Rule): Rule {
  return {
    ...rule,
    // Explore is a public catalog surface, not a personal library surface.
    // Keep shelf composition broad by evaluating against every catalog status.
    statuses: [...EXPLORE_STATUSES],
  };
}

function mapGameToScenarioGame(game: ExploreGame): ScenarioGame {
  return {
    id: game.id,
    name: game.name,
    slug: game.slug,
    status: game.status,
    hidden: game.hidden,
    buy_priority: game.buyPriority,
    bgg_rating: game.bggRating,
    bgg_weight: game.bggWeight,
    bgg_rank: game.bggRank,
    bgg_num_ratings: game.bggUsersRated,
    year_published: game.publishedYear,
    players_min: game.playersMin,
    players_max: game.playersMax,
    play_time_min: game.playTimeMin,
    play_time_max: game.playTimeMax,
    category: game.category,
    tags: game.tags.map((tag) => tag.slug),
  };
}

export async function fetchExploreData(presetIds?: readonly string[]) {
  const presets = resolveExplorePresets(presetIds);
  const rows = await fetchGamesCatalogRows();
  const games = rows.map(mapGamesCatalogRow);
  const scenarioGames = games.map(mapGameToScenarioGame);
  const gameById = new Map(games.map((game) => [game.id, game] as const));

  const shelves: ExploreShelfData[] = presets.map((preset) => ({
    id: preset.id,
    emoji: preset.emoji,
    title: preset.label,
    description: preset.description,
    sections: preset.sections.map((section) => ({
      id: section.id,
      label: section.label,
      description: section.description,
      games: selectGamesForRule(scenarioGames, withExploreRule(section.rule))
        .map((game) => gameById.get(game.id))
        .filter((game): game is ExploreGame => Boolean(game)),
    })),
    entries: [],
  }));

  for (const shelf of shelves) {
    if (shelf.sections.length === 1) {
      shelf.entries = shelf.sections[0]?.games ?? [];
    }
  }

  return { shelves };
}

export function useExploreQuery(presetIds?: readonly string[]) {
  return useQuery({
    queryKey: libraryKeys.explore(presetIds),
    retry: shouldRetrySupabaseQuery,
    queryFn: () => fetchExploreData(presetIds),
  });
}
