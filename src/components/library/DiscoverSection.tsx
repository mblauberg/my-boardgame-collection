import { useState } from "react";
import { HorizontalShelf } from "./HorizontalShelf";
import { useInView } from "../../hooks/useInView";
import type { Game } from "../../types/domain";

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
  
  const totalGames = shelves.reduce((sum, shelf) => sum + shelf.entries.length, 0);
  
  if (totalGames === 0) return null;

  return (
    <section ref={ref} className="mb-12">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left bg-surface-container-low rounded-2xl p-8 transition-all duration-300 hover:bg-surface-container-highest"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{emoji}</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">{title}</h2>
              <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                {totalGames}
              </span>
            </div>
            <p className="text-base text-on-surface-variant leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>
          <span 
            className={`material-symbols-outlined text-on-surface-variant text-3xl transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </div>
      </button>

      {isExpanded && isInView && (
        <div className="mt-8 space-y-8">
          {shelves.map((shelf) => (
            <HorizontalShelf
              key={shelf.id}
              title={shelf.title}
              description={shelf.description}
              entries={shelf.entries}
            />
          ))}
        </div>
      )}
    </section>
  );
}
