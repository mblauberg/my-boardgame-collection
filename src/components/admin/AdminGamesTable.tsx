import { useState } from "react";
import type { Game } from "../../types/domain";

type Props = {
  games: Game[];
  onEdit: (game: Game) => void;
};

export function AdminGamesTable({ games, onEdit }: Props) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? games.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : games;

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search games…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md border border-outline-variant/15 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
      />

      <div className="hidden sm:block overflow-x-auto rounded-lg border border-outline-variant">
        <table className="min-w-full divide-y divide-outline-variant/10 text-sm">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-on-surface-variant">Name</th>
              <th className="px-4 py-3 text-left font-medium text-on-surface-variant">Status</th>
              <th className="px-4 py-3 text-left font-medium text-on-surface-variant">Flags</th>
              <th className="px-4 py-3 text-right font-medium text-on-surface-variant">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 bg-surface">
            {filtered.map((game) => (
              <tr key={game.id}>
                <td className="px-4 py-3 font-medium text-on-surface">{game.name}</td>
                <td className="px-4 py-3 text-on-surface-variant">{game.status}</td>
                <td className="px-4 py-3">
                  {game.hidden && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      hidden
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(game)}
                    className="text-sm font-medium text-primary hover:text-primary-container"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-on-surface-variant">
                  No games found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {filtered.map((game) => (
          <div key={game.id} className="flex items-center justify-between rounded-xl bg-surface-container-low p-4">
            <div className="min-w-0">
              <p className="font-semibold text-on-surface truncate">{game.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-on-surface-variant">{game.status}</p>
                {game.hidden && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    hidden
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEdit(game)}
              className="ml-4 shrink-0 text-sm font-medium text-primary hover:text-primary-container"
            >
              Edit
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-on-surface-variant">No games found.</p>
        )}
      </div>
    </div>
  );
}
