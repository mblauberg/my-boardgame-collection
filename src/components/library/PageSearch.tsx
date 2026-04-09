import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FilterPopover } from "./FilterPopover";
import { useLibraryFilters } from "../../features/library/useLibraryFilters";
import { useExploreSearchContext } from "../../features/library/ExploreSearchContext";

export function PageSearch() {
  const location = useLocation();
  const { filters, sortBy, sortDirection, updateFilters, updateSort, clearFilters } = useLibraryFilters();
  const { query: exploreQuery, setQuery: setExploreQuery } = useExploreSearchContext();
  const [localQuery, setLocalQuery] = useState(exploreQuery);

  const isExplorePage = location.pathname === "/explore";
  const isLibraryPage = location.pathname === "/saved" || location.pathname === "/";

  // Debounce explore search
  useEffect(() => {
    if (!isExplorePage) return;
    
    const timer = setTimeout(() => {
      setExploreQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, isExplorePage, setExploreQuery]);

  // Sync local query with context when route changes
  useEffect(() => {
    if (isExplorePage) {
      setLocalQuery(exploreQuery);
    }
  }, [isExplorePage, exploreQuery]);

  if (!isExplorePage && !isLibraryPage) {
    return null;
  }

  const placeholder = isExplorePage
    ? "Search all games..."
    : location.pathname === "/saved"
    ? "Search saved games..."
    : "Search your collection...";

  const value = isExplorePage ? localQuery : filters.searchText ?? "";

  const handleChange = (newValue: string) => {
    if (isExplorePage) {
      setLocalQuery(newValue);
    } else {
      updateFilters({ searchText: newValue });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="relative">
        <span className="sr-only">{placeholder}</span>
        <input
          type="search"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-56 rounded-full border-0 bg-surface-container-lowest dark:bg-dark-surface-container-lowest px-4 py-2 text-sm text-on-surface dark:text-dark-on-surface outline-none transition focus:ring-1 focus:ring-primary-container dark:focus:ring-dark-primary-container focus:shadow-[0_0_12px_rgba(255,145,0,0.2)]"
        />
      </label>

      {isLibraryPage && (
        <FilterPopover
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={updateSort}
          onClear={clearFilters}
        />
      )}
    </div>
  );
}
