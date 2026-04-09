import { useCollectionFilters } from "../../features/games/useCollectionFilters";
import type { SortOption } from "../../features/games/collectionFilters";
import type { GameStatus } from "../../types/domain";

export function CollectionToolbar() {
  const { filters, sortBy, sortDirection, updateFilters, updateSort, clearFilters } =
    useCollectionFilters();

  return (
    <div className="mb-6 space-y-4 rounded-[1.5rem] border border-outline-variant/15 bg-surface-container-low p-4">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search games..."
          value={filters.search || ""}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="min-w-[200px] flex-1 rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-3 py-2 text-on-surface outline-none transition focus:border-primary"
        />

        <select
          value={filters.status || ""}
          onChange={(e) =>
            updateFilters({ status: (e.target.value || undefined) as GameStatus | undefined })
          }
          className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-3 py-2 text-on-surface outline-none"
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
          className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-3 py-2 text-on-surface outline-none"
        >
          <option value="name">Name</option>
          <option value="rating">Rating</option>
          <option value="weight">Weight</option>
          <option value="year">Year</option>
        </select>

        <button
          type="button"
          onClick={() =>
            updateSort(sortBy, sortDirection === "asc" ? "desc" : "asc")
          }
          className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-3 py-2 text-on-surface transition hover:bg-surface-container-high"
        >
          {sortDirection === "asc" ? "↑" : "↓"}
        </button>

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-3 py-2 text-on-surface transition hover:bg-surface-container-high"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
