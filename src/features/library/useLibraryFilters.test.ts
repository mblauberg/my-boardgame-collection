import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
});
