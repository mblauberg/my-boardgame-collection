import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useLibraryFilters } from "./useLibraryFilters";
import { createElement } from "react";

function createWrapper(initialEntry: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(MemoryRouter, { initialEntries: [initialEntry] }, children);
  };
}

describe("useLibraryFilters", () => {
  it("hydrates filters and sorting from URL params", () => {
    const { result } = renderHook(() => useLibraryFilters(), {
      wrapper: createWrapper("/wishlist?search=heat&sharedTags=racing,euro&sortBy=year&sortDir=desc"),
    });

    expect(result.current.filters.searchText).toBe("heat");
    expect(result.current.filters.sharedTagSlugs).toEqual(["racing", "euro"]);
    expect(result.current.sortBy).toBe("year");
    expect(result.current.sortDirection).toBe("desc");
  });

  it("ignores deprecated min/max query params", () => {
    const { result } = renderHook(() => useLibraryFilters(), {
      wrapper: createWrapper(
        "/wishlist?playersMin=2&playersMax=4&playTimeMin=30&playTimeMax=60&weightMin=2&weightMax=3&maxWeight=3",
      ),
    });

    expect("playersMin" in result.current.filters).toBe(false);
    expect("playersMax" in result.current.filters).toBe(false);
    expect("playTimeMin" in result.current.filters).toBe(false);
    expect("playTimeMax" in result.current.filters).toBe(false);
    expect("weightMin" in result.current.filters).toBe(false);
    expect("weightMax" in result.current.filters).toBe(false);
    expect("maxWeight" in result.current.filters).toBe(false);
  });

  it("removes deprecated query params from the URL on load", async () => {
    const { result } = renderHook(() => {
      const filters = useLibraryFilters();
      const location = useLocation();
      return { filters, search: location.search };
    }, {
      wrapper: createWrapper("/wishlist?playersMin=2&playersMax=4&sortBy=name&sortDir=asc"),
    });

    await waitFor(() => {
      expect(result.current.search).toBe("?sortBy=name&sortDir=asc");
    });
  });
});
