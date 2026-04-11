import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { GameCard } from "../ui/GameCard";
import type { Game } from "../../types/domain";
import {
  getLibraryEntryForGame,
} from "../../features/library/libraryState";
import { useLibraryQuery } from "../../features/library/useLibraryQuery";
import { useLibraryStateActions } from "../../features/library/useLibraryStateActions";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";
import { LibraryStateIconButton } from "./LibraryStateIconButton";
import { StatusBadge } from "../ui/StatusBadge";

type HorizontalShelfProps = {
  title: string;
  description?: string;
  entries: Game[];
};

export function HorizontalShelf({ title, description, entries }: HorizontalShelfProps) {
  const location = useLocation();
  const { data: libraryEntries } = useLibraryQuery();
  const libraryStateActions = useLibraryStateActions();
  const prefersReducedMotion = usePrefersReducedMotion();

  if (entries.length === 0) return null;

  return (
    <motion.section
      className="mb-12"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.standard,
      }}
    >
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
        <motion.div
          className="flex gap-6"
          style={{ width: "max-content" }}
          layout
          transition={motionTokens.spring.soft}
        >
          {entries.map((game, index) => {
            const entry = getLibraryEntryForGame(libraryEntries, game.id);
            const isInCollection = entry?.isInCollection ?? false;

            return (
              <motion.article
                key={game.id}
                className="relative"
                style={{ width: "320px", flexShrink: 0 }}
                initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: motionTokens.duration.base,
                  ease: motionTokens.ease.standard,
                  delay: Math.min(index * 0.04, 0.2),
                }}
              >
                <div className="absolute right-3 top-3 z-10">
                  {isInCollection ? (
                    <StatusBadge size="compact" className="md:px-3 md:py-1.5 md:text-xs">
                      In Collection
                    </StatusBadge>
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
                    rating={game.bggRating ?? undefined}
                    motionIdBase={game.slug}
                  />
                </Link>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}
