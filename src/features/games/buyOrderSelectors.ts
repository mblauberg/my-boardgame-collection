import type { Game } from "../../types/domain";

export function selectBuyOrder(games: Game[]): Game[] {
  return games
    .filter((game) => game.status === "buy")
    .sort((a, b) => {
      if (a.buyPriority === null && b.buyPriority === null) {
        return a.name.localeCompare(b.name);
      }
      if (a.buyPriority === null) return 1;
      if (b.buyPriority === null) return -1;
      if (a.buyPriority !== b.buyPriority) {
        return a.buyPriority - b.buyPriority;
      }
      return a.name.localeCompare(b.name);
    });
}
