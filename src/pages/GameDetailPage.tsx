import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGameDetailQuery } from "../features/games/useGameDetailQuery";
import { useContributeGameMetadata } from "../features/games/useGameMutations";
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
  const { profile, isOwner } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const contributeGameMetadata = useContributeGameMetadata();
  const state = location.state as { from?: string; backgroundLocation?: unknown } | null;
  const backTo = typeof state?.from === "string" ? state.from : "/";
  const backLabel = getBackLabel(backTo);
  const isModal = !!state?.backgroundLocation;
  const { data: game, isLoading, error } = useGameDetailQuery(slug ?? "");

  if (!slug) {
    return <div className="p-8 text-center">Invalid game</div>;
  }

  const handleClose = () => {
    if (isModal) {
      navigate(-1);
    } else {
      navigate(backTo);
    }
  };

  const handleEdit = () => {
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSaveEdit = async (values: {
    imageUrl: string;
    summary: string;
    publishedYear: string;
    playersMin: string;
    playersMax: string;
    playTimeMin: string;
    playTimeMax: string;
  }) => {
    if (!game) return;
    setSaveError(null);

    const parseOptionalNumber = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = Number.parseInt(trimmed, 10);
      return Number.isNaN(parsed) ? null : parsed;
    };

    const imageUrl = values.imageUrl.trim();
    const summary = values.summary.trim();
    const publishedYear = parseOptionalNumber(values.publishedYear);
    const playersMin = parseOptionalNumber(values.playersMin);
    const playersMax = parseOptionalNumber(values.playersMax);
    const playTimeMin = parseOptionalNumber(values.playTimeMin);
    const playTimeMax = parseOptionalNumber(values.playTimeMax);

    try {
      await contributeGameMetadata.mutateAsync({
        id: game.id,
        imageUrl: imageUrl || null,
        summary: summary || null,
        publishedYear,
        playersMin,
        playersMax,
        playTimeMin,
        playTimeMax,
        userId: profile?.id ?? null,
        isOwner,
        bggId: game.bggId,
        name: game.name,
        slug: game.slug,
        bggUrl: game.bggUrl,
      });

      setIsEditing(false);
    } catch {
      setSaveError("Unable to save your edits. Please try again.");
    }
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
        <div className="space-y-3 pt-3">
          {saveError ? (
            <p className="rounded-md border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">
              {saveError}
            </p>
          ) : null}
          <GameQuickEditForm
            game={game}
            onSubmit={handleSaveEdit}
            onCancel={handleCancelEdit}
            isSubmitting={contributeGameMetadata.isPending}
          />
        </div>
      ) : (
        <GameDetailPanel game={game} />
      )}
    </GameDetailOverlay>
  );
}
