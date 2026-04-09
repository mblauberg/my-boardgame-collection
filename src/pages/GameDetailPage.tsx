import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGameDetailQuery } from "../features/games/useGameDetailQuery";
import { useUpdateGame } from "../features/games/useGameMutations";
import { useProfile } from "../features/auth/useProfile";
import { GameDetailPanel } from "../components/games/GameDetailPanel";
import { GameDetailOverlay } from "../components/games/GameDetailOverlay";
import { GameQuickEditForm } from "../components/games/GameQuickEditForm";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

function getBackLabel(path: string) {
  if (path === "/explore") return "Explore";
  if (path === "/saved") return "Saved";
  if (path.startsWith("/u/") && path.endsWith("/saved")) return "Public saved";
  if (path.startsWith("/u/") && path.endsWith("/collection")) return "Public collection";
  return "Collection";
}

export function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOwner } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const updateGame = useUpdateGame();
  const state = location.state as { from?: string; backgroundLocation?: unknown } | null;
  const backTo = typeof state?.from === "string" ? state.from : "/";
  const backLabel = getBackLabel(backTo);
  const isModal = !!state?.backgroundLocation;

  if (!slug) {
    return <div className="p-8 text-center">Invalid game</div>;
  }

  const { data: game, isLoading, error } = useGameDetailQuery(slug);

  const handleClose = () => {
    if (isModal) {
      navigate(-1);
    } else {
      navigate(backTo);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async (values: { imageUrl: string; summary: string }) => {
    if (!game) return;
    
    await updateGame.mutateAsync({
      id: game.id,
      imageUrl: values.imageUrl || null,
      summary: values.summary || null,
    });
    
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <GameDetailOverlay
        title="Loading game details"
        titleId="game-detail-title"
        onRequestClose={handleClose}
        isStandalone={!isModal}
      >
        <div className="pt-6">
          <p>Loading game...</p>
        </div>
      </GameDetailOverlay>
    );
  }

  if (error || !game) {
    const message = error
      ? getSupabaseQueryErrorMessage(error, "game detail")
      : "Game not found";

    return (
      <GameDetailOverlay
        title="Game details unavailable"
        titleId="game-detail-title"
        onRequestClose={handleClose}
        isStandalone={!isModal}
      >
        <div className="pt-6">
          <p className="mb-4 text-on-surface">{message}</p>
          <Link to={backTo} className="text-primary hover:underline">
            Back to {backLabel.toLowerCase()}
          </Link>
        </div>
      </GameDetailOverlay>
    );
  }

  return (
    <GameDetailOverlay
      title={game.name}
      titleId="game-detail-title"
      onRequestClose={handleClose}
      isStandalone={!isModal}
      onEdit={handleEdit}
      isEditing={isEditing}
    >
      {isEditing ? (
        <GameQuickEditForm
          game={game}
          onSubmit={handleSaveEdit}
          onCancel={handleCancelEdit}
          isSubmitting={updateGame.isPending}
        />
      ) : (
        <GameDetailPanel game={game} />
      )}
    </GameDetailOverlay>
  );
}
