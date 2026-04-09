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
}

const MOCK_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBM3c82fCVsizmmSICSohN_Bj3I4T5uSQU9obgMs3cEo_UxZ1c5eh4ol9iaC2mWr89AvRm7tjoHyu4mfBGUAewjylHX9AOVOCVsaqbKpu69fpy9M1zBmErRmkhpn53-c4Ssx3jSLUzROYMaSJjkZ-nxMTXYH9S3Q-z3-n_oaB8-sKh1jtvdHcnxjx-HzVL-KrQTxJf8WyYF_D82hOa1mpythxhhoz6Q26RruN-aLLa5pw_YAmQvQn0gnvdomGJWNvKR8hmKj84TUVc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBza3nRkkOuI-UjmUIq9dI8X4xSeY-8WyqUolLuetZw8tRXqRdLghiw7M5ChAcxDYZRtpIKs33DxTQI25D1bQL3tLA-_w_-xwCTE_s9IbmXNWiGzsYk_nvXZuy34SX23ah2b0vDE1vPt3TY_YGr2MF8E5EHk8lDmqb-kALt-9v5RC3LrvX8wexEreli3zT_58DPZhmYVirsDesri68JSEoZ1D-2zzV4IqtMcp3WSFNOFp3Y4xVIKgIUlcDWumUuL-aNORIkuGMQJV4",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBguiXq6FABe6DPf9lfiEPbCCTVBrIUg58ODeYu2KhPpnAGKOjjaOs5OdvQk9tlZF7I8lbGoPtnb-6tdk5dm2-O-sfmgMnUMZN3NBkhja_aW21qoXBdxntq3LfMuSzVI0s0tTx69sAcikesOS4j_Ap-pHP9VETfmFqiTQNGIgmJpAqa0ySiAs9UTwLGitG0cdCwVMbs_ET_j89w0Du_L30a2Myop_K134ZQTVsIBMkrXUhILhx_goZM3Mh4FrVeuMP0xGtCA9M5Ao4",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBOu7gWVczr4EeMNrqtYpKe5CML7RFRzhtIEkf7XgOg7vxme3oUyn6LqrouxGmWQkJW7_EvN4GM1kFxCqLOAZnmo5sxOvOJLhNYn1P-qUw_mUPXvlEKmKdJ2wwNlbYpjGxANchh6j104-IgykehhEfKbRXWGJWLiSmBayPfldU69-YAyo5ln7Ha7Mp433J0rIGPvkhUYvxr8_g7sLN0lb9GY7eTk-FEW2eC3mhgxigSLp53lNIVypbZrOt2Mkk0EMl5bx0MiAZBi3Q",
];

function getFallbackImage(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % MOCK_IMAGES.length;
  return MOCK_IMAGES[index];
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
  badge
}: GameCardProps) {
  const displayImage = image ?? getFallbackImage(title);
  const displayTitle = title.replace(/_/g, " ");

  return (
    <article className="group relative overflow-hidden rounded-xl bg-surface-container-lowest transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(46,47,45,0.06)]">
      <div className="relative aspect-[3/2] overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
        <img
          className="h-full w-full object-cover"
          alt={`Cover art for ${displayTitle}`}
          src={displayImage}
        />
        
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between md:left-4 md:right-4 md:top-4">
          {rating && rating > 0 ? (
            <div className="flex items-center gap-1 rounded-full bg-on-surface/80 px-2 py-1 backdrop-blur-sm/90 md:gap-1.5 md:px-3 md:py-1.5">
              <span className="material-symbols-outlined text-sm text-tertiary-fixed md:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="text-xs font-bold text-white md:text-sm">{rating.toFixed(1)}</span>
            </div>
          ) : (
            <div />
          )}
          
          {badge && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider md:px-3 md:py-1 md:text-xs ${
              badge === "In Collection"
                ? "bg-secondary-fixed text-on-secondary-container"
                : "bg-tertiary-fixed text-on-tertiary-fixed"
            }`}>
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 p-4 md:space-y-4 md:p-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 text-xl font-extrabold leading-tight text-on-surface md:text-2xl">
            {displayTitle}
          </h3>
          {isFavorite ? (
            <span
              aria-label="Loved"
              className="material-symbols-outlined flex-shrink-0 text-primary text-xl md:text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          ) : null}
        </div>

        {description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-on-surface-variant-variant md:text-sm">
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-1 md:gap-4 md:pt-2">
          {players && (
            <div className="flex items-center gap-1 text-on-surface-variant-variant md:gap-1.5">
              <span className="material-symbols-outlined text-base md:text-lg">group</span>
              <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">{players}</span>
            </div>
          )}
          {playTime && (
            <div className="flex items-center gap-1 text-on-surface-variant-variant md:gap-1.5">
              <span className="material-symbols-outlined text-base md:text-lg">schedule</span>
              <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">{playTime}</span>
            </div>
          )}
          {weight && (
             <div className="flex items-center gap-1 text-on-surface-variant-variant md:gap-1.5">
              <span className="material-symbols-outlined text-base md:text-lg">fitness_center</span>
              <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">{weight}/5</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
