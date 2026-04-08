import { useLocation, useParams, Link } from "react-router-dom";
import { useGameDetailQuery } from "../features/games/useGameDetailQuery";
import { GameDetailPanel } from "../components/games/GameDetailPanel";
import { getSupabaseQueryErrorMessage } from "../lib/supabase/runtimeErrors";

function getBackLabel(path: string) {
  if (path === "/explore") return "Explore";
  if (path === "/wishlist") return "Wishlist";
  if (path.startsWith("/u/") && path.endsWith("/wishlist")) return "Public wishlist";
  if (path.startsWith("/u/") && path.endsWith("/collection")) return "Public collection";
  return "Collection";
}

export function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const backTo = typeof location.state?.from === "string" ? location.state.from : "/";
  const backLabel = getBackLabel(backTo);

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
        <Link to={backTo} className="text-blue-600 hover:underline">
          Back to {backLabel.toLowerCase()}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to={backTo} className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to {backLabel.toLowerCase()}
      </Link>
      <GameDetailPanel game={game} />
    </div>
  );
}
