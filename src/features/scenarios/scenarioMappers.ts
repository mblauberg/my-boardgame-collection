import type { Game } from '../../types/domain';
import { buildScenarioResults, type ScenarioGame } from '../../config/scenarioPresets';

export function mapGameToScenarioGame(game: Game): ScenarioGame {
  return {
    id: game.id,
    name: game.name,
    slug: game.slug,
    status: game.status,
    hidden: game.hidden,
    buy_priority: game.buyPriority,
    bgg_rating: game.bggRating,
    bgg_weight: game.bggWeight,
    players_min: game.playersMin,
    players_max: game.playersMax,
    play_time_min: game.playTimeMin,
    play_time_max: game.playTimeMax,
    category: game.category,
    tags: game.tags.map((t) => t.slug),
  };
}

export function buildScenarioPresetResults(games: Game[]) {
  const scenarioGames = games.map(mapGameToScenarioGame);
  return buildScenarioResults(scenarioGames);
}
