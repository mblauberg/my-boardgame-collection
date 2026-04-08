import type { Game, GameStatus } from "../../types/domain";
import { BuyPriorityField } from "./BuyPriorityField";

type BuyOrderListProps = {
  games: Game[];
  isOwner: boolean;
  isPending?: boolean;
  onStatusChange: (gameId: string, status: GameStatus) => void;
  onPriorityChange: (gameId: string, priority: number | null) => void;
};

export function BuyOrderList({ games, isOwner, isPending, onStatusChange, onPriorityChange }: BuyOrderListProps) {
  return (
    <ul className="space-y-4">
      {games.map((game, index) => (
        <li key={game.id} className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="font-bold text-lg text-gray-500 w-6 shrink-0">
              {game.buyPriority ?? "—"}
            </span>
            <div className="flex-1">
              <h3 className="font-semibold">{game.name}</h3>
              {game.summary && <p className="text-sm text-gray-600 mt-1">{game.summary}</p>}
              {game.notes && <p className="text-sm text-gray-500 mt-1">{game.notes}</p>}
              {game.gapReason && <p className="text-sm text-amber-700 mt-1">{game.gapReason}</p>}
              {isOwner && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  <BuyPriorityField
                    gameId={game.id}
                    currentPriority={game.buyPriority}
                    onSave={onPriorityChange}
                    disabled={isPending}
                  />
                  <button
                    onClick={() => onStatusChange(game.id, "owned")}
                    disabled={isPending}
                    className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                  >
                    Mark Owned
                  </button>
                  <button
                    onClick={() => onStatusChange(game.id, "cut")}
                    disabled={isPending}
                    className="text-sm px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    Cut
                  </button>
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
