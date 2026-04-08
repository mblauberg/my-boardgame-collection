import { useCollectionFilters } from "../../features/games/useCollectionFilters";
import type { SortOption } from "../../features/games/collectionFilters";
import type { GameStatus } from "../../types/domain";

export function CollectionToolbar() {
  const { filters, sortBy, sortDirection, updateFilters, updateSort, clearFilters } =
    useCollectionFilters();

  return (
    <div className="bg-white border rounded-lg p-4 mb-6 space-y-4">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search games..."
          value={filters.search || ""}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="flex-1 min-w-[200px] px-3 py-2 border rounded"
        />

        <select
          value={filters.status || ""}
          onChange={(e) =>
            updateFilters({ status: (e.target.value || undefined) as GameStatus | undefined })
          }
          className="px-3 py-2 border rounded"
        >
          <option value="">All Status</option>
          <option value="owned">Owned</option>
          <option value="buy">Buy</option>
          <option value="new_rec">New Rec</option>
          <option value="cut">Cut</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => updateSort(e.target.value as SortOption, sortDirection)}
          className="px-3 py-2 border rounded"
        >
          <option value="name">Name</option>
          <option value="rating">Rating</option>
          <option value="weight">Weight</option>
          <option value="year">Year</option>
        </select>

        <button
          onClick={() =>
            updateSort(sortBy, sortDirection === "asc" ? "desc" : "asc")
          }
          className="px-3 py-2 border rounded hover:bg-gray-50"
        >
          {sortDirection === "asc" ? "↑" : "↓"}
        </button>

        <button
          onClick={clearFilters}
          className="px-3 py-2 border rounded hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
