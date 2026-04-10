import { Link, useLocation } from "react-router-dom";
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
import { LibraryStateIconButton } from "./LibraryStateIconButton";

type ExploreShelfProps = {
  title: string;
  entries: Game[];
};

export function ExploreShelf({ title, entries }: ExploreShelfProps) {
  const location = useLocation();
  const { profile, isAuthenticated } = useProfile();
  const { data: libraryEntries } = useLibraryQuery();
  const upsertLibraryState = useUpsertLibraryState();
  const deleteLibraryEntry = useDeleteLibraryEntry();

  function handleToggleSaved(game: Game) {
    if (!profile?.id) return;

    const existingEntry = getLibraryEntryForGame(libraryEntries, game.id);
    const currentState = getLibraryStateSnapshot(existingEntry);
    const nextState = {
      ...currentState,
      isSaved: !currentState.isSaved,
    };

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
  }

  return (
    <section className="mb-16">
      <h2 className="mb-8 text-3xl font-extrabold">{title}</h2>
      <div className="editorial-grid">
        {entries.map((game) => {
          const entry = getLibraryEntryForGame(libraryEntries, game.id);

          return (
            <article key={game.id} className="relative">
              <div className="absolute right-3 top-3 z-10">
                {entry?.isInCollection ? (
                  <span className="glass-badge rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed md:px-3 md:py-1.5 md:text-xs">
                    In Collection
                  </span>
                ) : isAuthenticated && profile?.id ? (
                  <LibraryStateIconButton
                    label="Saved"
                    icon="bookmark"
                    isActive={entry?.isSaved ?? false}
                    disabled={upsertLibraryState.isPending || deleteLibraryEntry.isPending}
                    onClick={() => handleToggleSaved(game)}
                  />
                ) : null}
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
                />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
