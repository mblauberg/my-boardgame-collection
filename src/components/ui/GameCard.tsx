export interface GameCardProps {
  title: string;
  image?: string;
  description?: string;
  players?: string;
  playTime?: string;
  weight?: string;
  isFavorite?: boolean;
  badge?: "In Stock" | "Wishlist";
}

export function GameCard({
  title,
  image,
  description,
  players,
  playTime,
  weight,
  isFavorite,
  badge
}: GameCardProps) {
  return (
    <article className="group relative bg-surface-container-low rounded-xl overflow-visible p-6 transition-all duration-300 hover:translate-y-[-4px]">
      <div className="relative -mt-12 mb-6 aspect-[4/5] rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
        {image ? (
          <img
            className="w-full h-full object-cover"
            alt={`Cover art for ${title}`}
            src={image}
          />
        ) : (
          <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
             <span className="material-symbols-outlined text-4xl text-on-surface-variant">image</span>
          </div>
        )}
        
        {badge && (
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
              badge === "In Stock" ? "bg-secondary-fixed text-on-secondary-container" : "bg-tertiary-fixed text-on-tertiary-fixed"
            }`}>
              {badge}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-extrabold text-on-surface leading-tight">{title}</h3>
          <span 
            className={`material-symbols-outlined ${isFavorite ? "text-primary" : "text-outline"}`}
            style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : undefined }}
          >
            favorite
          </span>
        </div>

        {description && (
          <p className="text-on-surface-variant text-sm line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 pt-2">
          {players && (
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">group</span>
              <span className="text-xs font-bold uppercase tracking-wider">{players}</span>
            </div>
          )}
          {playTime && (
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">schedule</span>
              <span className="text-xs font-bold uppercase tracking-wider">{playTime}</span>
            </div>
          )}
          {weight && (
             <div className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">fitness_center</span>
              <span className="text-xs font-bold uppercase tracking-wider">{weight}/5</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
