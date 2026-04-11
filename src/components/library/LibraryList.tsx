import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { GameCard } from "../ui/GameCard";
import { MaterialSymbol } from "../ui/MaterialSymbol";
import { StatusBadge } from "../ui/StatusBadge";
import { LibraryStateIconButton } from "./LibraryStateIconButton";
import type { LibraryEntry } from "../../features/library/library.types";
import {
  GUEST_LIBRARY_USER_ID,
} from "../../features/library/guestLibraryStorage";
import { isGuestImportedGameId } from "../../features/library/libraryState";
import { useLibraryStateActions } from "../../features/library/useLibraryStateActions";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";

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
  totalCount,
  cardContext,
  getGameLinkState,
}: LibraryListProps) {
  const location = useLocation();
  const libraryStateActions = useLibraryStateActions();
  const [movedIds, setMovedIds] = useState<Set<string>>(new Set());
  const prefersReducedMotion = usePrefersReducedMotion();
  const hasOwnedLibraryContext = cardContext === "collection" || cardContext === "saved";
  const isOwnedLibraryCompletelyEmpty = hasOwnedLibraryContext && (totalCount ?? entries.length) === 0;

  if (entries.length === 0) {
    if (isOwnedLibraryCompletelyEmpty) {
      const emptyMessage =
        cardContext === "collection" ? "Your collection is empty." : "Your saved games list is empty.";
      const exploreMessage =
        cardContext === "collection"
          ? "to start building your collection."
          : "to start saving games.";

      return (
        <div className="rounded-[1.5rem] bg-surface-container-low px-6 py-12 text-center text-on-surface-variant">
          <p className="font-medium text-on-surface">{emptyMessage}</p>
          <p className="mt-2">
            Visit the{" "}
            <Link className="font-semibold text-primary hover:underline" to="/explore">
              Explore page
            </Link>{" "}
            {exploreMessage}
          </p>
        </div>
      );
    }

    return (
      <motion.div
        className="rounded-[1.5rem] bg-surface-container-low px-6 py-12 text-center text-on-surface-variant"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: motionTokens.duration.base,
          ease: motionTokens.ease.standard,
        }}
      >
        No games found matching your filters.
      </motion.div>
    );
  }

  return (
    <motion.div className="editorial-grid" layout transition={motionTokens.spring.soft}>
      {entries.map((entry, index) => {
        const isGuestImportedGame = isGuestImportedGameId(entry.gameId);
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
              disabled={libraryStateActions.isPending}
              onClick={(e) => {
                e.preventDefault();
                libraryStateActions.toggleLoved(entry.game, entry);
              }}
            />
          );
        } else if (cardContext === "saved") {
          const moved = movedIds.has(entry.id);
          const isGuestAlreadyMoved =
            entry.accountId === GUEST_LIBRARY_USER_ID && entry.isInCollection;

          if (moved || isGuestAlreadyMoved) {
            topRightSlot = (
              <StatusBadge size="compact" className="md:px-3 md:py-1.5 md:text-xs">
                <MaterialSymbol icon="check_circle" filled className="text-sm" />
                Moved
              </StatusBadge>
            );
          } else {
            topRightSlot = (
              <LibraryStateIconButton
                label="Move to Collection"
                icon="shelves"
                isActive={false}
                disabled={libraryStateActions.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  libraryStateActions.moveToCollection(entry.game, entry);
                  setMovedIds((prev) => new Set(prev).add(entry.id));
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

        const card = (
          <GameCard
            title={entry.game.name}
            image={entry.game.imageUrl ?? undefined}
            description={entry.game.summary ?? undefined}
            players={formatPlayers(entry)}
            playTime={formatPlayTime(entry)}
            weight={entry.game.bggWeight?.toFixed(1)}
            rating={entry.game.bggRating ?? undefined}
            badge={badge}
            topRightSlot={topRightSlot}
            motionIdBase={entry.game.slug}
          />
        );

        return (
          <motion.article
            key={entry.id}
            className="space-y-4"
            layout
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              prefersReducedMotion
                ? motionTokens.spring.soft
                : {
                    ...motionTokens.spring.soft,
                    delay: Math.min(index * 0.03, 0.18),
                  }
            }
          >
            {isGuestImportedGame ? (
              card
            ) : (
              <Link aria-label={entry.game.name} state={linkState} to={`/game/${entry.game.slug}`}>
                {card}
              </Link>
            )}
          </motion.article>
        );
      })}
    </motion.div>
  );
}
