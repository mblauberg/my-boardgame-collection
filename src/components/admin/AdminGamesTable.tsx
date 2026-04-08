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
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Flags</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.map((game) => (
              <tr key={game.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{game.name}</td>
                <td className="px-4 py-3 text-gray-600">{game.status}</td>
                <td className="px-4 py-3">
                  {game.hidden && (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                      hidden
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(game)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No games found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
