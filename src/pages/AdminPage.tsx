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
      <div className="flex items-center justify-between rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-ambient">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Admin Dashboard</h2>
          <p className="mt-1 text-on-surface-variant">Manage games, tags, and visibility.</p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="rounded-full bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-medium text-on-primary transition hover:brightness-95"
        >
          Add Game
        </button>
      </div>

      {panel && (
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-ambient">
          <h3 className="mb-4 text-lg font-semibold text-on-surface">
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

      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-ambient">
        <h3 className="mb-4 text-lg font-semibold text-on-surface">Games</h3>
        {isLoading ? (
          <p className="text-on-surface-variant">Loading…</p>
        ) : (
          <AdminGamesTable games={games} onEdit={handleEdit} />
        )}
      </div>
    </div>
  );
}
