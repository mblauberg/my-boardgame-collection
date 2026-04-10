import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { GameCard } from "../ui/GameCard";
import { LibraryStateIconButton } from "./LibraryStateIconButton";
import type { LibraryEntry } from "../../features/library/library.types";
import {
  GUEST_LIBRARY_USER_ID,
  upsertGuestLibraryEntry,
} from "../../features/library/guestLibraryStorage";
import { libraryKeys } from "../../features/library/libraryKeys";
import { useProfile } from "../../features/auth/useProfile";
import {
  useMoveWishlistToCollection,
  useUpsertLibraryState,
} from "../../features/library/useLibraryEntryMutations";

type LibraryListProps = {
  entries: LibraryEntry[];
  totalCount?: number;
  cardContext?: "collection" | "saved";
  getGameLinkState?: (entry: LibraryEntry) => unknown;
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
  totalCount: _totalCount,
  cardContext,
  getGameLinkState,
}: LibraryListProps) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { profile, isAuthenticated } = useProfile();
  const upsert = useUpsertLibraryState();
  const moveToCollection = useMoveWishlistToCollection();
  const [movedIds, setMovedIds] = useState<Set<string>>(new Set());

  function handleGuestUpsert(
    entry: LibraryEntry,
    updates: Partial<Pick<LibraryEntry, "isSaved" | "isLoved" | "isInCollection">>,
  ) {
    upsertGuestLibraryEntry({
      game: entry.game,
      isSaved: updates.isSaved ?? entry.isSaved,
      isLoved: updates.isLoved ?? entry.isLoved,
      isInCollection: updates.isInCollection ?? entry.isInCollection,
      sentiment: entry.sentiment,
      notes: entry.notes,
    });
    void queryClient.invalidateQueries({
      queryKey: libraryKeys.library(GUEST_LIBRARY_USER_ID),
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
          rawLinkState && typeof rawLinkState === "object" ? rawLinkState : {};
        const linkState = {
          ...customState,
          from: location.pathname,
          backgroundLocation: location,
        };

        let topRightSlot: React.ReactNode = undefined;

        if (cardContext === "collection") {
          topRightSlot = (
            <LibraryStateIconButton
              label={entry.isLoved ? "Loved" : "Add to Loved"}
              icon="favorite"
              isActive={entry.isLoved}
              onClick={(e) => {
                e.preventDefault();
                if (isAuthenticated && profile?.id) {
                  upsert.mutate({
                    accountId: profile.id,
                    gameId: entry.game.id,
                    isSaved: entry.isSaved,
                    isLoved: !entry.isLoved,
                    isInCollection: entry.isInCollection,
                    sentiment: entry.sentiment,
                    notes: entry.notes,
                  });
                } else {
                  handleGuestUpsert(entry, { isLoved: !entry.isLoved });
                }
              }}
            />
          );
        } else if (cardContext === "saved") {
          const moved = movedIds.has(entry.id);
          const isGuestAlreadyMoved =
            entry.accountId === GUEST_LIBRARY_USER_ID && entry.isInCollection;

          if (moved || isGuestAlreadyMoved) {
            topRightSlot = (
              <span className="glass-badge flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed md:px-3 md:py-1.5 md:text-xs">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                Moved
              </span>
            );
          } else {
            topRightSlot = (
              <LibraryStateIconButton
                label="Move to Collection"
                icon="shelves"
                isActive={false}
                onClick={(e) => {
                  e.preventDefault();
                  if (isAuthenticated && profile?.id) {
                    moveToCollection.mutate(
                      { id: entry.id, accountId: profile.id },
                      { onSuccess: () => setMovedIds((prev) => new Set(prev).add(entry.id)) },
                    );
                  } else {
                    handleGuestUpsert(entry, { isSaved: false, isInCollection: true });
                    setMovedIds((prev) => new Set(prev).add(entry.id));
                  }
                }}
              />
            );
          }
        }

        // For explore search results (no cardContext), show "In Collection" or "Saved" badge
        const badge = !cardContext
          ? entry.isInCollection
            ? "In Collection"
            : entry.isSaved
              ? "Saved"
              : undefined
          : undefined;

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
                badge={badge}
                topRightSlot={topRightSlot}
              />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
