import type { Game } from "../../types/domain";

export function selectRecommendations(games: Game[]): Game[] {
  return games
    .filter((g) => g.status === "new_rec")
    .sort((a, b) => a.name.localeCompare(b.name));
}
