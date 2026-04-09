import type { Game } from "../../types/domain";
import { useProfile } from "../../features/auth/useProfile";
import {
  getLibraryEntryForGame,
  getLibraryStateSnapshot,
  hasAnyLibraryState,
} from "../../features/library/libraryState";
import { useLibraryQuery } from "../../features/library/useLibraryQuery";
import {
  useDeleteLibraryEntry,
  useUpsertLibraryState,
} from "../../features/library/useLibraryEntryMutations";
import { LibraryStateActionGroup } from "../library/LibraryStateActionGroup";

type GameDetailPanelProps = {
  game: Game;
};

function formatSourceDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function getSnapshotRanks(game: Game) {
  return [
    { label: "Abstract rank", value: game.abstractsRank ?? null },
    { label: "CGS rank", value: game.cgsRank ?? null },
    { label: "Children's rank", value: game.childrensGamesRank ?? null },
    { label: "Family rank", value: game.familyGamesRank ?? null },
    { label: "Party rank", value: game.partyGamesRank ?? null },
    { label: "Strategy rank", value: game.strategyGamesRank ?? null },
    { label: "Thematic rank", value: game.thematicRank ?? null },
    { label: "Wargames rank", value: game.wargamesRank ?? null },
  ]
    .filter((rank): rank is { label: string; value: number } => typeof rank.value === "number")
    .sort((a, b) => a.value - b.value)
    .slice(0, 3);
}

export function GameDetailPanel({ game }: GameDetailPanelProps) {
  const snapshotRanks = getSnapshotRanks(game);
  const { profile, isAuthenticated } = useProfile();
  const { data: libraryEntries } = useLibraryQuery();
  const upsertLibraryState = useUpsertLibraryState();
  const deleteLibraryEntry = useDeleteLibraryEntry();
  const existingEntry = getLibraryEntryForGame(libraryEntries, game.id);
  const currentState = getLibraryStateSnapshot(existingEntry);

  function handleStateChange(
    nextState: Pick<typeof currentState, "isSaved" | "isLoved" | "isInCollection">,
  ) {
    if (!profile?.id) return;

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
      sentiment: currentState.sentiment,
      notes: currentState.notes,
    });
  }

  return (
    <div className="space-y-6">
      {game.imageUrl && (
        <div className="relative -mx-4 -mt-16 md:-mx-6 md:-mt-20 sm:-mx-8 sm:-mt-24">
          <img src={game.imageUrl} alt={game.name} className="w-full h-80 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
        </div>
      )}

      <div className="space-y-6">
        {game.publishedYear && (
          <p className="text-on-surface-variant">Published: {game.publishedYear}</p>
        )}

        {isAuthenticated && profile?.id ? (
          <LibraryStateActionGroup
            isSaved={currentState.isSaved}
            isLoved={currentState.isLoved}
            isInCollection={currentState.isInCollection}
            disabled={upsertLibraryState.isPending || deleteLibraryEntry.isPending}
            onToggleSaved={() =>
              handleStateChange({
                isSaved: !currentState.isSaved,
                isLoved: currentState.isLoved,
                isInCollection: currentState.isSaved ? currentState.isInCollection : false,
              })
            }
            onToggleLoved={() =>
              handleStateChange({
                isSaved: currentState.isSaved,
                isLoved: !currentState.isLoved,
                isInCollection: currentState.isInCollection,
              })
            }
            onToggleCollection={() =>
              handleStateChange({
                isSaved: currentState.isInCollection ? currentState.isSaved : false,
                isLoved: currentState.isLoved,
                isInCollection: !currentState.isInCollection,
              })
            }
          />
        ) : null}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {game.playersMin && game.playersMax && (
            <div className="rounded-2xl bg-surface-container-low p-4">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider">Players</span>
              <p className="text-xl font-semibold text-on-surface mt-1">
                {game.playersMin}-{game.playersMax}
              </p>
            </div>
          )}
          {game.playTimeMin && game.playTimeMax && (
            <div className="rounded-2xl bg-surface-container-low p-4">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider">Play Time</span>
              <p className="text-xl font-semibold text-on-surface mt-1">
                {game.playTimeMin}-{game.playTimeMax} min
              </p>
            </div>
          )}
          {game.bggRating && (
            <div className="rounded-2xl bg-surface-container-highest p-4">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider">BGG Rating</span>
              <p className="text-xl font-semibold text-on-surface mt-1">{game.bggRating.toFixed(1)}</p>
            </div>
          )}
          {game.bggWeight && (
            <div className="rounded-2xl bg-surface-container-highest p-4">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider">Weight</span>
              <p className="text-xl font-semibold text-on-surface mt-1">{game.bggWeight.toFixed(1)}</p>
            </div>
          )}
        </div>

        {game.bggRank || game.bggBayesAverage || game.bggUsersRated || snapshotRanks.length > 0 ? (
          <div className="rounded-3xl bg-surface-container-low p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  BGG Snapshot
                </p>
                {game.bggDataSource === "bgg_csv" ? (
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Local BGG snapshot
                    {game.bggDataUpdatedAt ? ` • Updated ${formatSourceDate(game.bggDataUpdatedAt)}` : ""}
                  </p>
                ) : null}
              </div>
              {game.isExpansion ? (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  Expansion
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {typeof game.bggRank === "number" ? (
                <div>
                  <span className="text-sm text-on-surface-variant">Overall rank</span>
                  <p className="text-xl font-semibold text-on-surface">#{game.bggRank}</p>
                </div>
              ) : null}
              {typeof game.bggBayesAverage === "number" ? (
                <div>
                  <span className="text-sm text-on-surface-variant">Bayesian average</span>
                  <p className="text-xl font-semibold text-on-surface">{game.bggBayesAverage.toFixed(2)}</p>
                </div>
              ) : null}
              {typeof game.bggUsersRated === "number" ? (
                <div>
                  <span className="text-sm text-on-surface-variant">Users rated</span>
                  <p className="text-xl font-semibold text-on-surface">{game.bggUsersRated.toLocaleString("en-AU")}</p>
                </div>
              ) : null}
            </div>

            {snapshotRanks.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {snapshotRanks.map((rank) => (
                  <span
                    key={rank.label}
                    className="rounded-full bg-surface-container-highest px-3 py-1 text-sm font-medium text-on-surface"
                  >
                    {rank.label}: #{rank.value}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {game.summary && (
          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">Summary</h2>
            <p className="text-on-surface-variant leading-relaxed">{game.summary}</p>
          </div>
        )}

        {game.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {game.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: tag.colour || "rgb(var(--surface-container-highest))" }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {game.bggUrl && (
          <a
            href={game.bggUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-primary hover:underline"
          >
            View on BoardGameGeek
          </a>
        )}
      </div>
    </div>
  );
}
