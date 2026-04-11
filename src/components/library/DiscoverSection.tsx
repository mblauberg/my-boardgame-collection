import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HorizontalShelf } from "./HorizontalShelf";
import { useInView } from "../../hooks/useInView";
import type { Game } from "../../types/domain";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";

type DiscoverSectionProps = {
  title: string;
  emoji: string;
  description: string;
  shelves: Array<{
    id: string;
    title: string;
    description: string;
    entries: Game[];
  }>;
};

export function DiscoverSection({ title, emoji, description, shelves }: DiscoverSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { ref, isInView } = useInView();
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const totalGames = shelves.reduce((sum, shelf) => sum + shelf.entries.length, 0);
  
  if (totalGames === 0) return null;

  return (
    <motion.section
      ref={ref}
      className="mb-12"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={isInView || prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.standard,
      }}
    >
      <motion.button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="glass-surface-panel w-full rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-0.5"
        whileTap={prefersReducedMotion ? undefined : { scale: 0.995 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{emoji}</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">{title}</h2>
              <span className="glass-action-button rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {totalGames}
              </span>
            </div>
            <p className="text-base text-on-surface-variant leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>
          <motion.span
            className="material-symbols-outlined text-on-surface-variant text-3xl"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{
              duration: motionTokens.duration.fast,
              ease: motionTokens.ease.standard,
            }}
          >
            expand_more
          </motion.span>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isExpanded && isInView ? (
          <motion.div
            className="mt-8 space-y-8"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{
              duration: motionTokens.duration.base,
              ease: motionTokens.ease.standard,
            }}
          >
            {shelves.map((shelf) => (
              <HorizontalShelf
                key={shelf.id}
                title={shelf.title}
                description={shelf.description}
                entries={shelf.entries}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
