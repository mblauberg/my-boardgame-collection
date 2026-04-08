import { useParams, Link } from "react-router-dom";
import { useGameDetailQuery } from "../features/games/useGameDetailQuery";
import { GameDetailPanel } from "../components/games/GameDetailPanel";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

export function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <div className="p-8 text-center">Invalid game</div>;
  }

  const { data: game, isLoading, error } = useGameDetailQuery(slug);

  if (isLoading) {
    return <div className="p-8 text-center">Loading game...</div>;
  }

  if (error || !game) {
    const message = error
      ? getSupabaseQueryErrorMessage(error, "game detail")
      : "Game not found";

    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{message}</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Back to collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to collection
      </Link>
      <GameDetailPanel game={game} />
    </div>
  );
}
