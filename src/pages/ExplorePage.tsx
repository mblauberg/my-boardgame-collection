import { GameCard } from "../components/ui/GameCard";
import { CategoryChip } from "../components/ui/CategoryChip";
import { FloatingActionButton } from "../components/layout/FloatingActionButton";

export function ExplorePage() {
  return (
    <>
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-2">Discovery</p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface max-w-2xl">
            Find Your Next <span className="text-primary">Obsession</span>
          </h1>
        </div>
      </header>

      <section className="mb-16">
        <h2 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl">auto_awesome</span>
          For You
        </h2>
        <div className="editorial-grid">
          <GameCard 
            title="Dune: Imperium"
            description="Deck-building and worker placement in the legendary sci-fi universe."
            players="1-4 Players"
            playTime="60-120 Min"
            weight="3.0"
            isFavorite={false}
          />
          <GameCard 
            title="Ark Nova"
            description="Plan, design, and build a modern, scientifically managed zoo."
            players="1-4 Players"
            playTime="90-150 Min"
            weight="3.7"
            isFavorite={false}
          />
        </div>
      </section>

      <FloatingActionButton />
    </>
  );
}
