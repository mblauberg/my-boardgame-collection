import { useState } from "react";
import { useGamesQuery } from "../features/games/useGamesQuery";
import { useProfile } from "../features/auth/useProfile";
import { useUpdateGame } from "../features/games/useGameMutations";
import { selectRecommendations } from "../features/recommendations/recommendationSelectors";
import { RecommendationList } from "../components/recommendations/RecommendationList";
import { RecommendationEditor } from "../components/recommendations/RecommendationEditor";
import type { Game, GameStatus } from "../types/domain";
import type { RecommendationEditorValues } from "../features/recommendations/recommendationEditorSchema";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

export function RecommendationsPage() {
  const { data: games, isLoading, error } = useGamesQuery();
  const { isOwner } = useProfile();
  const updateGame = useUpdateGame();
  const [editing, setEditing] = useState<Game | null>(null);

  if (isLoading) return <p className="p-6">Loading…</p>;
  if (error) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-red-50/80 p-6 text-center text-red-900">
        <p className="text-lg font-semibold">Recommendations unavailable</p>
        <p className="mt-2 text-sm leading-6">
          {getSupabaseQueryErrorMessage(error, "recommendations view")}
        </p>
      </div>
    );
  }

  const recommendations = selectRecommendations(games ?? []);

  function handleSave(values: RecommendationEditorValues) {
    if (!editing) return;
    updateGame.mutate({ id: editing.id, ...values });
    setEditing(null);
  }

  function handlePromote(id: string, status: GameStatus) {
    updateGame.mutate({ id, status });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Recommendations</h1>

      {editing ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Edit: {editing.name}</h2>
          <RecommendationEditor
            game={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : (
        <RecommendationList
          games={recommendations}
          isOwner={isOwner}
          onEdit={setEditing}
          onPromote={handlePromote}
        />
      )}
    </div>
  );
}
