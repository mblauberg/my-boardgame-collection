import { GameCard } from "../components/ui/GameCard";
import { CategoryChip } from "../components/ui/CategoryChip";
import { FloatingActionButton } from "../components/layout/FloatingActionButton";

export function WishlistPage() {
  return (
    <>
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-2">Future Games</p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface max-w-2xl">
            The <span className="text-primary">Wishlist</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-surface-container-low rounded-xl text-on-surface font-semibold hover:bg-surface-container-highest transition-all">
            <span className="material-symbols-outlined text-xl">filter_list</span>
            Filters
          </button>
        </div>
      </header>

      <section className="flex flex-wrap gap-3 mb-16">
        <CategoryChip label="All Games" isActive={true} />
        <CategoryChip label="High Priority" isActive={false} />
      </section>

      <div className="editorial-grid">
        <GameCard 
          title="Clank!: Catacombs"
          description="A deck-building adventure game where you explore a dungeon."
          players="2-4 Players"
          playTime="45-90 Min"
          weight="2.5"
          isFavorite={false}
          badge="Wishlist"
        />
        <GameCard 
          title="Heat: Pedal to the Metal"
          description="High-octane racing game with hand-management mechanics."
          players="1-6 Players"
          playTime="30-60 Min"
          weight="2.2"
          isFavorite={false}
          badge="Wishlist"
        />
      </div>

      <FloatingActionButton />
    </>
  );
}
