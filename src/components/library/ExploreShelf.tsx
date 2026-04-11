import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { GameCard } from "../ui/GameCard";
import type { Game } from "../../types/domain";
import {
  getLibraryEntryForGame,
} from "../../features/library/libraryState";
import { useLibraryQuery } from "../../features/library/useLibraryQuery";
import { useLibraryStateActions } from "../../features/library/useLibraryStateActions";
import { LibraryStateIconButton } from "./LibraryStateIconButton";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";

type ExploreShelfProps = {
  title: string;
  entries: Game[];
};

export function ExploreShelf({ title, entries }: ExploreShelfProps) {
  const location = useLocation();
  const { data: libraryEntries } = useLibraryQuery();
  const libraryStateActions = useLibraryStateActions();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.section
      className="mb-16"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.standard,
      }}
    >
      <h2 className="mb-8 text-3xl font-extrabold">{title}</h2>
      <motion.div className="editorial-grid" layout transition={motionTokens.spring.soft}>
        {entries.map((game, index) => {
          const entry = getLibraryEntryForGame(libraryEntries, game.id);

          return (
            <motion.article
              key={game.id}
              className="relative"
              layout
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: motionTokens.duration.base,
                ease: motionTokens.ease.standard,
                delay: Math.min(index * 0.03, 0.18),
              }}
            >
              <div className="absolute right-3 top-3 z-10">
                {entry?.isInCollection ? (
                  <span className="glass-badge rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed md:px-3 md:py-1.5 md:text-xs">
                    In Collection
                  </span>
                ) : (
                  <LibraryStateIconButton
                    label="Saved"
                    icon="bookmark"
                    isActive={entry?.isSaved ?? false}
                    disabled={libraryStateActions.isPending}
                    onClick={() => libraryStateActions.toggleSaved(game, entry)}
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
                  motionIdBase={game.slug}
                />
              </Link>
            </motion.article>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
