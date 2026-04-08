import type { LibrarySortDirection, LibrarySortOption } from "../../features/library/libraryFilters";

type LibraryToolbarProps = {
  searchText?: string;
  sortBy: LibrarySortOption;
  sortDirection: LibrarySortDirection;
  onSearchTextChange: (value: string) => void;
  onSortChange: (sortBy: LibrarySortOption, sortDirection: LibrarySortDirection) => void;
  onClear: () => void;
};

export function LibraryToolbar({
  searchText,
  sortBy,
  sortDirection,
  onSearchTextChange,
  onSortChange,
  onClear,
}: LibraryToolbarProps) {
  return (
    <div className="mb-10 flex flex-col gap-4 rounded-[1.5rem] bg-surface-container-low p-5 shadow-card sm:flex-row sm:items-center">
      <label className="flex-1">
        <span className="sr-only">Search games</span>
        <input
          type="search"
          value={searchText ?? ""}
          onChange={(event) => onSearchTextChange(event.target.value)}
          placeholder="Search your library"
          className="w-full rounded-xl border border-outline/20 bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
        />
      </label>

      <select
        value={sortBy}
        onChange={(event) => onSortChange(event.target.value as LibrarySortOption, sortDirection)}
        className="rounded-xl border border-outline/20 bg-white px-4 py-3 text-sm text-on-surface outline-none"
      >
        <option value="name">Name</option>
        <option value="rating">Rating</option>
        <option value="weight">Weight</option>
        <option value="year">Year</option>
        <option value="priority">Priority</option>
      </select>

      <button
        type="button"
        onClick={() => onSortChange(sortBy, sortDirection === "asc" ? "desc" : "asc")}
        className="rounded-xl border border-outline/20 bg-white px-4 py-3 text-sm font-semibold text-on-surface"
      >
        {sortDirection === "asc" ? "Ascending" : "Descending"}
      </button>

      <button
        type="button"
        onClick={onClear}
        className="rounded-xl border border-outline/20 bg-white px-4 py-3 text-sm font-semibold text-on-surface"
      >
        Clear
      </button>
    </div>
  );
}
