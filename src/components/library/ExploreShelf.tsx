import { Link } from "react-router-dom";
import { GameCard } from "../ui/GameCard";
import type { Game } from "../../types/domain";

type ExploreShelfProps = {
  title: string;
  entries: Game[];
};

export function ExploreShelf({ title, entries }: ExploreShelfProps) {
  return (
    <section className="mb-16">
      <h2 className="mb-8 text-3xl font-extrabold">{title}</h2>
      <div className="editorial-grid">
        {entries.map((game) => (
          <Link key={game.id} state={{ from: "/explore" }} to={`/game/${game.slug}`}>
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
              isFavorite={false}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
