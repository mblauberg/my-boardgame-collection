export interface GameCardProps {
  title: string;
  image?: string;
  description?: string;
  players?: string;
  playTime?: string;
  weight?: string;
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
  isFavorite,
  badge
}: GameCardProps) {
  const displayImage = image ?? getFallbackImage(title);
  const displayTitle = title.replace(/_/g, " ");

  return (
    <article className="group relative bg-surface-container-low rounded-xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px]">
      <div className="relative aspect-[3/2] overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
        <img
          className="w-full h-full object-cover"
          alt={`Cover art for ${displayTitle}`}
          src={displayImage}
        />
        
        {badge && (
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
              badge === "In Collection"
                ? "bg-secondary-fixed text-on-secondary-container"
                : "bg-tertiary-fixed text-on-tertiary-fixed"
            }`}>
              {badge}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-2xl font-extrabold text-on-surface leading-tight flex-1 min-w-0">
            {displayTitle}
          </h3>
          {isFavorite ? (
            <span
              aria-label="Loved"
              className="material-symbols-outlined flex-shrink-0 text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          ) : null}
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
