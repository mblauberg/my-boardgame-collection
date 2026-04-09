import { useEffect, useState } from "react";
import type { AddGameWizardSelectedGame } from "./addGameWizard.types";

type AddGameDetailsStepProps = {
  game: AddGameWizardSelectedGame;
  onChange: (updates: Partial<AddGameWizardSelectedGame>) => void;
};

export function AddGameDetailsStep({ game, onChange }: AddGameDetailsStepProps) {
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (game.customImageFile) {
      const url = URL.createObjectURL(game.customImageFile);
      setLocalImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalImageUrl(null);
    }
  }, [game.customImageFile]);

  const displayImage = localImageUrl || game.customImageUrl || game.imageUrl;

  function handleNumberChange(field: keyof AddGameWizardSelectedGame, value: string) {
    const parsed = parseFloat(value);
    onChange({ [field]: isNaN(parsed) ? null : parsed });
  }

  function handleStringChange(field: keyof AddGameWizardSelectedGame, value: string) {
    onChange({ [field]: value.trim() === "" ? null : value });
  }

  return (
    <div className="flex flex-1 flex-col fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Game details</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
          Confirm the imported metadata. Help future users by filling in any missing details like player counts or play times!
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-[1.75rem] bg-surface-container-low shadow-card aspect-[4/5] relative">
            {displayImage ? (
              <img src={displayImage} alt={game.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl">stadia_controller</span>
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] bg-surface-container-low p-4 shadow-card">
            <h4 className="text-sm font-bold text-on-surface mb-3">Cover Art Override</h4>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant">Upload File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || undefined;
                    onChange({ customImageFile: file, customImageUrl: undefined });
                  }}
                  className="mt-1 block w-full text-[11px] text-on-surface file:mr-2 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-bold file:text-on-primary hover:file:bg-primary/90"
                />
              </div>
              <div className="text-[10px] uppercase font-bold text-on-surface-variant text-center">OR</div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={game.customImageUrl || ""}
                  onChange={(e) => {
                    onChange({ customImageUrl: e.target.value, customImageFile: undefined });
                  }}
                  className="mt-1 block w-full rounded-xl border border-outline/20 bg-surface px-3 py-2 text-sm text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-surface-container-low p-6 shadow-card h-fit">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Selected Game</p>
            <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface">{game.name}</h3>
            <div className="mt-3 space-y-1 text-sm text-on-surface-variant">
              {game.yearPublished && <p>Published {game.yearPublished}</p>}
              {game.averageRating && <p>Rating: {game.averageRating.toFixed(1)}/10</p>}
              {game.averageWeight && <p>Weight: {game.averageWeight.toFixed(1)}/5</p>}
              {game.bggRank && <p>BGG Rank: #{game.bggRank}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-white/80 px-4 py-3 flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant mb-2">
                Players
              </p>
              <div className="flex items-center gap-2 justify-center">
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={game.playersMin || ""} onChange={e => handleNumberChange("playersMin", e.target.value)} placeholder="Min" className="w-12 rounded-lg bg-surface px-2 py-1.5 text-sm border border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-center text-on-surface [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <span className="text-on-surface-variant text-sm font-medium">-</span>
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} value={game.playersMax || ""} onChange={e => handleNumberChange("playersMax", e.target.value)} placeholder="Max" className="w-12 rounded-lg bg-surface px-2 py-1.5 text-sm border border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-center text-on-surface [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 px-4 py-3 flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant mb-2">
                Play Time (min)
              </p>
              <div className="flex items-center gap-2 justify-center">
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={game.playTimeMin || ""} onChange={e => handleNumberChange("playTimeMin", e.target.value)} placeholder="Min" className="w-14 rounded-lg bg-surface px-2 py-1.5 text-sm border border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-center text-on-surface [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <span className="text-on-surface-variant text-sm font-medium">-</span>
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={game.playTimeMax || ""} onChange={e => handleNumberChange("playTimeMax", e.target.value)} placeholder="Max" className="w-14 rounded-lg bg-surface px-2 py-1.5 text-sm border border-outline/20 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-center text-on-surface [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
