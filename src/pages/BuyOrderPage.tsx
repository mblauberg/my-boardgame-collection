import { useGamesQuery } from "../features/games/useGamesQuery";
import { useProfile } from "../features/auth/useProfile";
import { useUpdateGame } from "../features/games/useGameMutations";
import { selectBuyOrder } from "../features/games/buyOrderSelectors";
import { summarizeBuyGaps } from "../features/games/buyGapSummary";
import { BuyOrderList } from "../components/games/BuyOrderList";
import type { GameStatus } from "../types/domain";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

export function BuyOrderPage() {
  const { data: games, isLoading, error } = useGamesQuery();
  const { isOwner } = useProfile();
  const updateGame = useUpdateGame();

  if (isLoading) return <p className="p-8 text-center">Loading...</p>;
  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50/80 p-6 text-center text-red-900">
        <p className="text-lg font-semibold">Buy order unavailable</p>
        <p className="mt-2 text-sm leading-6">{getSupabaseQueryErrorMessage(error, "buy order")}</p>
      </div>
    );
  }

  const buyItems = selectBuyOrder(games ?? []);
  const summary = summarizeBuyGaps({ games: games ?? [] });

  if (buyItems.length === 0) {
    return <p className="p-8 text-center text-gray-500">No games on the buy list yet.</p>;
  }

  const handleStatusChange = (gameId: string, status: GameStatus) => {
    updateGame.mutate({ id: gameId, status });
  };

  const handlePriorityChange = (gameId: string, priority: number | null) => {
    updateGame.mutate({ id: gameId, buyPriority: priority });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Buy Order</h1>
      {summary.unprioritizedCount > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          {summary.unprioritizedCount} unprioritized{" "}
          {summary.unprioritizedCount === 1 ? "game" : "games"}
        </p>
      )}
      <BuyOrderList
        games={buyItems}
        isOwner={isOwner}
        isPending={updateGame.isPending}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
      />
    </div>
  );
}
