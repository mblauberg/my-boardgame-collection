import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { GameCard } from "../ui/GameCard";
import { LibraryStateIconButton } from "./LibraryStateIconButton";
import type { LibraryEntry } from "../../features/library/library.types";
import { useSession } from "../../features/auth/useSession";
import {
  useMoveSavedToCollection,
  useUpsertLibraryState,
  useDeleteLibraryEntry,
} from "../../features/library/useLibraryEntryMutations";
import {
  getLibraryStateSnapshot,
  hasAnyLibraryState,
} from "../../features/library/libraryState";

type LibraryListProps = {
  entries: LibraryEntry[];
  getGameLinkState?: (entry: LibraryEntry) => unknown;
  cardContext?: "collection" | "saved";
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
  getGameLinkState,
  cardContext,
}: LibraryListProps) {
  const location = useLocation();
  const { user } = useSession();
  const upsert = useUpsertLibraryState();
  const moveToCollection = useMoveSavedToCollection();
  const deleteLibraryEntry = useDeleteLibraryEntry();
  const [movedIds, setMovedIds] = useState<Set<string>>(new Set());

  function handleToggleSaved(entry: LibraryEntry) {
    if (!user?.id) return;

    const currentState = getLibraryStateSnapshot(entry);
    const nextState = {
      ...currentState,
      isSaved: !currentState.isSaved,
    };

    if (!hasAnyLibraryState(nextState) && entry.id && !entry.id.startsWith("explore-")) {
      deleteLibraryEntry.mutate({ id: entry.id, userId: user.id });
      return;
    }

    if (!hasAnyLibraryState(nextState)) return;

    upsert.mutate({
      userId: user.id,
      gameId: entry.game.id,
      isSaved: nextState.isSaved,
      isLoved: nextState.isLoved,
      isInCollection: nextState.isInCollection,
      sentiment: nextState.sentiment,
      notes: nextState.notes,
    });
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-[1.5rem] bg-surface-container-low px-6 py-12 text-center text-on-surface-variant">
        No games found matching your filters.
      </div>
    );
  }

  return (
    <div className="editorial-grid">
      {entries.map((entry) => {
        const rawLinkState = getGameLinkState ? getGameLinkState(entry) : null;
        const customState =
          rawLinkState && typeof rawLinkState === "object"
            ? rawLinkState
            : {};
        const linkState = {
          ...customState,
          from: location.pathname,
          backgroundLocation: location,
        };

        let topRightSlot: React.ReactNode = undefined;
        if (cardContext === "collection" && user) {
          topRightSlot = (
            <LibraryStateIconButton
              label={entry.isLoved ? "Loved" : "Add to Loved"}
              icon="favorite"
              isActive={entry.isLoved}
              onClick={(e) => {
                e.preventDefault();
                upsert.mutate({
                  userId: user.id,
                  gameId: entry.game.id,
                  isSaved: entry.isSaved,
                  isLoved: !entry.isLoved,
                  isInCollection: entry.isInCollection,
                });
              }}
            />
          );
        } else if (cardContext === "saved" && user) {
          const moved = movedIds.has(entry.id);
          topRightSlot = moved ? (
            <span className="glass-badge flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed md:px-3 md:py-1.5 md:text-xs">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Moved
            </span>
          ) : (
            <LibraryStateIconButton
              label="Move to Collection"
              icon="shelves"
              isActive={false}
              onClick={(e) => {
                e.preventDefault();
                moveToCollection.mutate(
                  { id: entry.id, userId: user.id },
                  { onSuccess: () => setMovedIds((prev) => new Set(prev).add(entry.id)) },
                );
              }}
            />
          );
        } else if (!cardContext && user && !entry.isInCollection) {
          topRightSlot = (
            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <LibraryStateIconButton
                label="Saved"
                icon="bookmark"
                isActive={entry.isSaved}
                disabled={upsert.isPending || deleteLibraryEntry.isPending}
                onClick={() => handleToggleSaved(entry)}
              />
            </div>
          );
        }

        return (
          <article key={entry.id} className="space-y-4">
            <Link aria-label={entry.game.name} state={linkState} to={`/game/${entry.game.slug}`}>
              <GameCard
                title={entry.game.name}
                image={entry.game.imageUrl ?? undefined}
                description={entry.game.summary ?? undefined}
                players={formatPlayers(entry)}
                playTime={formatPlayTime(entry)}
                weight={entry.game.bggWeight?.toFixed(1)}
                rating={entry.game.bggRating ?? undefined}
                isFavorite={entry.isLoved}
                badge={cardContext ? undefined : entry.isInCollection ? "In Collection" : entry.isSaved ? "Saved" : undefined}
                topRightSlot={topRightSlot}
              />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
