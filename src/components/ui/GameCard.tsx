import type { ReactNode } from "react";

export interface GameCardProps {
  title: string;
  image?: string;
  description?: string;
  players?: string;
  playTime?: string;
  weight?: string;
  rating?: number;
  isFavorite?: boolean;
  badge?: "In Collection" | "Saved";
  topRightSlot?: ReactNode;
  motionIdBase?: string;
}

function getFallbackImage(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }

  const palette = [
    { base: "#f3e7d5", accent: "#b75d2b", shadow: "#2f3e46" },
    { base: "#e4efe7", accent: "#4f7f52", shadow: "#23312a" },
    { base: "#efe4d6", accent: "#915f39", shadow: "#392a1f" },
    { base: "#e5edf5", accent: "#476f9b", shadow: "#22354c" },
  ][Math.abs(hash) % 4];
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  const rotation = Math.abs(hash % 24) - 12;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.base}" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#bg)" />
      <circle cx="120" cy="140" r="170" fill="${palette.accent}" fill-opacity="0.18" />
      <circle cx="710" cy="820" r="210" fill="${palette.shadow}" fill-opacity="0.16" />
      <rect x="110" y="180" width="580" height="640" rx="56" fill="#ffffff" fill-opacity="0.72" transform="rotate(${rotation} 400 500)" />
      <text x="400" y="550" font-family="Georgia, serif" font-size="180" font-weight="700" text-anchor="middle" fill="${palette.shadow}">
        ${initials || "BG"}
      </text>
      <text x="400" y="875" font-family="system-ui, sans-serif" font-size="42" font-weight="700" letter-spacing="8" text-anchor="middle" fill="${palette.shadow}" fill-opacity="0.7">
        BOARD GAME
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function GameCard({
  title,
  image,
  description,
  players,
  playTime,
  weight,
  rating,
  isFavorite,
  badge,
  topRightSlot,
  motionIdBase,
}: GameCardProps) {
  const displayImage = image ?? getFallbackImage(title);
  const displayTitle = title.replace(/_/g, " ");
  const hasStats = Boolean(players || playTime || weight);
  const hasDetails = Boolean(description || hasStats);

  return (
    <article
      className="group relative overflow-hidden rounded-2xl bg-surface-container-lowest transition-all duration-300 hover:-translate-y-1 hover:shadow-ambient-lg dark:bg-[rgb(28_27_27)]"
      data-motion-id={motionIdBase ? `game-card-${motionIdBase}` : undefined}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          alt={`Cover art for ${displayTitle}`}
          src={displayImage}
          data-motion-id={motionIdBase ? `game-card-image-${motionIdBase}` : undefined}
        />

        <div className="game-card-hero-overlay pointer-events-none absolute inset-0" />
        
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between md:left-4 md:right-4 md:top-4">
          {rating && rating > 0 ? (
            <div className="glass-rating-badge flex items-center gap-1 rounded-full px-2 py-1 md:gap-1.5 md:px-3 md:py-1.5">
              <span className="material-symbols-outlined text-sm text-tertiary-fixed md:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="text-xs font-bold text-on-surface md:text-sm">{rating.toFixed(1)}</span>
            </div>
          ) : (
            <div />
          )}
          
          {topRightSlot ?? (badge && (
            <span className="glass-badge rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed md:px-3 md:py-1.5 md:text-xs">
              {badge}
            </span>
          ))}
        </div>

        <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4">
          <div
            className="game-card-title-glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2"
            data-motion-id={motionIdBase ? `game-card-title-${motionIdBase}` : undefined}
          >
            <h3 className="line-clamp-2 text-base font-extrabold leading-tight text-on-surface md:text-xl dark:text-[rgb(245_238_232)]">
              {displayTitle}
            </h3>
            {isFavorite ? (
              <span
                aria-label="Loved"
                className="material-symbols-outlined flex-shrink-0 text-primary text-lg md:text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {hasDetails ? (
        <div className="space-y-2.5 p-4 md:space-y-3 md:p-5">
          {description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-on-surface-variant md:text-sm">
              {description}
            </p>
          )}

          {hasStats ? (
            <div className="flex flex-wrap gap-3 pt-1 md:gap-4 md:pt-2">
              {players && (
                <div className="flex items-center gap-1 text-on-surface-variant md:gap-1.5">
                  <span className="material-symbols-outlined text-base md:text-lg">group</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">{players}</span>
                </div>
              )}
              {playTime && (
                <div className="flex items-center gap-1 text-on-surface-variant md:gap-1.5">
                  <span className="material-symbols-outlined text-base md:text-lg">schedule</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">{playTime}</span>
                </div>
              )}
              {weight && (
                 <div className="flex items-center gap-1 text-on-surface-variant md:gap-1.5">
                  <span className="material-symbols-outlined text-base md:text-lg">fitness_center</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">{weight}/5</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
