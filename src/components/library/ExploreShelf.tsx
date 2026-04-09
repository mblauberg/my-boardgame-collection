import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { GameCard } from "../ui/GameCard";
import { GameCardSkeleton } from "../ui/GameCardSkeleton";
import type { Game } from "../../types/domain";
import { useProfile } from "../../features/auth/useProfile";
import { useDeleteLibraryEntry, useUpsertLibraryState } from "../../features/library/useLibraryEntryMutations";
import {
  getLibraryEntryForGame,
  getLibraryStateSnapshot,
  hasAnyLibraryState,
} from "../../features/library/libraryState";
import { useLibraryQuery } from "../../features/library/useLibraryQuery";
import { LibraryStateIconButton } from "./LibraryStateIconButton";
import { useInView } from "../../hooks/useInView";

type ExploreShelfProps = {
  title: string;
  description?: string;
  entries: Game[];
};

const INITIAL_DISPLAY = 6;

export function ExploreShelf({ title, description, entries }: ExploreShelfProps) {
  const location = useLocation();
  const { profile, isAuthenticated } = useProfile();
  const { data: libraryEntries } = useLibraryQuery();
  const upsertLibraryState = useUpsertLibraryState();
  const deleteLibraryEntry = useDeleteLibraryEntry();
  const { ref, isInView } = useInView();
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY);

  const visibleEntries = entries.slice(0, displayCount);
  const hasMore = displayCount < entries.length;

  function handleToggleSaved(game: Game) {
    if (!profile?.id) return;

    const existingEntry = getLibraryEntryForGame(libraryEntries, game.id);
    const currentState = getLibraryStateSnapshot(existingEntry);
    const nextState = {
      ...currentState,
      isSaved: !currentState.isSaved,
    };

    if (!hasAnyLibraryState(nextState) && existingEntry) {
      deleteLibraryEntry.mutate({ id: existingEntry.id, userId: profile.id });
      return;
    }

    if (!hasAnyLibraryState(nextState)) return;

    upsertLibraryState.mutate({
      userId: profile.id,
      gameId: game.id,
      isSaved: nextState.isSaved,
      isLoved: nextState.isLoved,
      isInCollection: nextState.isInCollection,
      sentiment: nextState.sentiment,
      notes: nextState.notes,
    });
  }

  return (
    <section ref={ref} className="mb-16">
      <div className="mb-8">
        <div className="flex items-baseline gap-3 mb-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">{title}</h2>
          <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-bold uppercase tracking-wider">
            {entries.length} {entries.length === 1 ? 'Game' : 'Games'}
          </span>
        </div>
        {description && (
          <p className="text-base text-on-surface-variant leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {!isInView ? (
        <div className="editorial-grid">
          {Array.from({ length: Math.min(entries.length, INITIAL_DISPLAY) }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-surface-container-low rounded-xl p-12 text-center">
          <p className="text-on-surface-variant text-sm">
            No games match this scenario yet. Check back as the catalog grows.
          </p>
        </div>
      ) : (
        <>
          <div className="editorial-grid">
            {visibleEntries.map((game) => {
            const entry = getLibraryEntryForGame(libraryEntries, game.id);
            const isInCollection = entry?.isInCollection ?? false;

            return (
              <article key={game.id} className="relative">
                {isAuthenticated && profile?.id ? (
                  <div className="absolute right-3 top-3 z-10">
                    <LibraryStateIconButton
                      label="Saved"
                      icon="bookmark"
                      isActive={entry?.isSaved ?? false}
                      disabled={upsertLibraryState.isPending || deleteLibraryEntry.isPending}
                      onClick={() => handleToggleSaved(game)}
                    />
                  </div>
                ) : null}

                <Link
                  state={{ from: location.pathname, backgroundLocation: location }}
                  to={`/game/${game.slug}`}
                >
                  <GameCard
                    title={game.name}
                    image={game.imageUrl ?? undefined}
                    description={game.summary ?? undefined}
                    players={
                      game.playersMin != null && game.playersMax != null
                        ? `${game.playersMin}-${game.playersMax} Players`
                        : undefined
                    }
                    playTime={
                      game.playTimeMin != null && game.playTimeMax != null
                        ? `${game.playTimeMin}-${game.playTimeMax} Min`
                        : undefined
                    }
                    weight={game.bggWeight?.toFixed(1)}
                    rating={game.bggRating ?? undefined}
                    badge={isInCollection ? "In Collection" : undefined}
                  />
                </Link>
              </article>
            );
          })}
        </div>
        
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setDisplayCount(prev => prev + 6)}
              className="px-6 py-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-sm uppercase tracking-wider transition-colors"
            >
              Show More ({entries.length - displayCount} remaining)
            </button>
          </div>
        )}
      </>
      )}
    </section>
  );
}
