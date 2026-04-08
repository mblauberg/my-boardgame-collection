import { GameCard } from "../components/ui/GameCard";
import { CategoryChip } from "../components/ui/CategoryChip";
import { FloatingActionButton } from "../components/layout/FloatingActionButton";

export function CollectionPage() {
  return (
    <>
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-2">Curated Collection</p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface max-w-2xl">
            The Art of <span className="text-primary">Play</span>
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
        <CategoryChip label="Strategy" isActive={false} />
        <CategoryChip label="Eurogame" isActive={false} />
        <CategoryChip label="Deck Building" isActive={false} />
        <CategoryChip label="Cooperative" isActive={false} />
        <CategoryChip label="Party" isActive={false} />
      </section>

      <div className="editorial-grid">
        <GameCard 
          title="Everdell"
          description="A charming game of tableau building and worker placement in a whimsical forest world."
          players="1-4 Players"
          playTime="60-90 Min"
          weight="2.8"
          isFavorite={true}
          badge="In Stock"
        />
        <GameCard 
          title="Twilight Imperium"
          description="The ultimate space opera of galactic conquest, diplomacy, and trade."
          players="3-6 Players"
          playTime="4-8 Hours"
          weight="4.2"
          isFavorite={false}
        />
        <GameCard 
          title="Wingspan"
          description="A competitive bird-collection game that is both relaxing and deeply strategic."
          players="1-5 Players"
          playTime="40-70 Min"
          weight="2.4"
          isFavorite={false}
        />
        <GameCard 
          title="Azul"
          description="A tactile puzzle game where players draft beautiful tiles to decorate the Royal Palace."
          players="2-4 Players"
          playTime="30-45 Min"
          weight="1.8"
          isFavorite={true}
          badge="In Stock"
        />
      </div>

      <FloatingActionButton />
    </>
  );
}
