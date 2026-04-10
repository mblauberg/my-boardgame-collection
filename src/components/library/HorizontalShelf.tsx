import { Link, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { GameCard } from "../ui/GameCard";
import type { Game } from "../../types/domain";
import { useProfile } from "../../features/auth/useProfile";
import { useDeleteLibraryEntry, useUpsertLibraryState } from "../../features/library/useLibraryEntryMutations";
import {
  getLibraryEntryForGame,
  getLibraryStateSnapshot,
  hasAnyLibraryState,
} from "../../features/library/libraryState";
import { useLibraryQuery } from "../../features/library/useLibraryQuery";
import {
  GUEST_LIBRARY_USER_ID,
  removeGuestLibraryEntry,
  upsertGuestLibraryEntry,
} from "../../features/library/guestLibraryStorage";
import { libraryKeys } from "../../features/library/libraryKeys";
import { LibraryStateIconButton } from "./LibraryStateIconButton";

type HorizontalShelfProps = {
  title: string;
  description?: string;
  entries: Game[];
};

export function HorizontalShelf({ title, description, entries }: HorizontalShelfProps) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { profile, isAuthenticated } = useProfile();
  const { data: libraryEntries } = useLibraryQuery();
  const upsertLibraryState = useUpsertLibraryState();
  const deleteLibraryEntry = useDeleteLibraryEntry();

  function invalidateGuestLibraryEntries() {
    void queryClient.invalidateQueries({
      queryKey: libraryKeys.library(GUEST_LIBRARY_USER_ID),
    });
  }

  function handleToggleSaved(game: Game) {
    const existingEntry = getLibraryEntryForGame(libraryEntries, game.id);
    const currentState = getLibraryStateSnapshot(existingEntry);
    const nextState = {
      ...currentState,
      isSaved: !currentState.isSaved,
    };

    if (isAuthenticated && profile?.id) {
      if (!hasAnyLibraryState(nextState) && existingEntry) {
        deleteLibraryEntry.mutate({ id: existingEntry.id, accountId: profile.id });
        return;
      }

      if (!hasAnyLibraryState(nextState)) return;

      upsertLibraryState.mutate({
        accountId: profile.id,
        gameId: game.id,
        isSaved: nextState.isSaved,
        isLoved: nextState.isLoved,
        isInCollection: nextState.isInCollection,
        sentiment: nextState.sentiment,
        notes: nextState.notes,
      });
      return;
    }

    if (!hasAnyLibraryState(nextState)) {
      removeGuestLibraryEntry(game.id);
      invalidateGuestLibraryEntries();
      return;
    }

    upsertGuestLibraryEntry({
      game,
      isSaved: nextState.isSaved,
      isLoved: nextState.isLoved,
      isInCollection: nextState.isInCollection,
      sentiment: nextState.sentiment,
      notes: nextState.notes,
    });
    invalidateGuestLibraryEntries();
  }

  if (entries.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-6">
        <div className="flex items-baseline gap-3 mb-2">
          <h3 className="text-2xl font-extrabold tracking-tight text-on-surface">{title}</h3>
          <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-bold uppercase tracking-wider">
            {entries.length}
          </span>
        </div>
        {description && (
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      
      <div className="overflow-x-auto horizontal-scroll -mx-4 px-4 pb-4">
        <div className="flex gap-6" style={{ width: 'max-content' }}>
          {entries.map((game) => {
            const entry = getLibraryEntryForGame(libraryEntries, game.id);
            const isInCollection = entry?.isInCollection ?? false;

            return (
              <article key={game.id} className="relative" style={{ width: '320px', flexShrink: 0 }}>
                <div className="absolute right-3 top-3 z-10">
                  {isInCollection ? (
                    <span className="glass-badge rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed md:px-3 md:py-1.5 md:text-xs">
                      In Collection
                    </span>
                  ) : (
                    <LibraryStateIconButton
                      label="Saved"
                      icon="bookmark"
                      isActive={entry?.isSaved ?? false}
                      disabled={upsertLibraryState.isPending || deleteLibraryEntry.isPending}
                      onClick={() => handleToggleSaved(game)}
                    />
                  )}
                </div>

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
                  />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
