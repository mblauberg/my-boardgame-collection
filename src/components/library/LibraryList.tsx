import { Link } from "react-router-dom";
import { GameCard } from "../ui/GameCard";
import type { LibraryEntry } from "../../features/library/library.types";
import { MoveToCollectionButton } from "./MoveToCollectionButton";

type LibraryListProps = {
  entries: LibraryEntry[];
  onMoveToCollection?: (entryId: string) => void;
  isMovePending?: boolean;
};

function formatPlayers(entry: LibraryEntry) {
  if (entry.game.playersMin == null || entry.game.playersMax == null) return undefined;
  return `${entry.game.playersMin}-${entry.game.playersMax} Players`;
}

function formatPlayTime(entry: LibraryEntry) {
  if (entry.game.playTimeMin == null || entry.game.playTimeMax == null) return undefined;
  return `${entry.game.playTimeMin}-${entry.game.playTimeMax} Min`;
}

export function LibraryList({
  entries,
  onMoveToCollection,
  isMovePending = false,
}: LibraryListProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-[1.5rem] bg-surface-container-low px-6 py-12 text-center text-on-surface-variant">
        No games found matching your filters.
      </div>
    );
  }

  return (
    <div className="editorial-grid">
      {entries.map((entry) => (
        <article key={entry.id} className="space-y-4">
          <Link aria-label={entry.game.name} to={`/game/${entry.game.slug}`}>
            <GameCard
              title={entry.game.name}
              image={entry.game.imageUrl ?? undefined}
              description={entry.game.summary ?? undefined}
              players={formatPlayers(entry)}
              playTime={formatPlayTime(entry)}
              weight={entry.game.bggWeight?.toFixed(1)}
              isFavorite={entry.sentiment === "like"}
              badge={entry.listType === "wishlist" ? "Wishlist" : "In Stock"}
            />
          </Link>

          {entry.listType === "wishlist" && onMoveToCollection ? (
            <MoveToCollectionButton
              disabled={isMovePending}
              onClick={() => onMoveToCollection(entry.id)}
            />
          ) : null}
        </article>
      ))}
    </div>
  );
}
