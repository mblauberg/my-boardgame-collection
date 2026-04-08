import { useState } from "react";
import { useAdminGamesQuery } from "../features/games/useAdminGamesQuery";
import { useCreateGame, useUpdateGame } from "../features/games/useGameMutations";
import { AdminGamesTable } from "../components/admin/AdminGamesTable";
import { GameForm } from "../components/admin/GameForm";
import type { Game } from "../types/domain";
import type { GameFormValues } from "../features/games/gameFormSchema";

type Panel = { mode: "create" } | { mode: "edit"; game: Game };

export function AdminPage() {
  const { data: games = [], isLoading } = useAdminGamesQuery();
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();

  const [panel, setPanel] = useState<Panel | null>(null);

  function handleEdit(game: Game) {
    setPanel({ mode: "edit", game });
  }

  function handleCreate() {
    setPanel({ mode: "create" });
  }

  function handleClosePanel() {
    setPanel(null);
  }

  async function handleSubmit(values: GameFormValues) {
    if (panel?.mode === "edit") {
      await updateGame.mutateAsync({ id: panel.game.id, ...values });
    } else {
      await createGame.mutateAsync(values);
    }
    setPanel(null);
  }

  const isSubmitting = createGame.isPending || updateGame.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="mt-1 text-gray-600">Manage games, tags, and visibility.</p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Game
        </button>
      </div>

      {panel && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {panel.mode === "edit" ? `Edit: ${panel.game.name}` : "Add Game"}
          </h3>
          <GameForm
            game={panel.mode === "edit" ? panel.game : undefined}
            onSubmit={handleSubmit}
            onCancel={handleClosePanel}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Games</h3>
        {isLoading ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          <AdminGamesTable games={games} onEdit={handleEdit} />
        )}
      </div>
    </div>
  );
}
