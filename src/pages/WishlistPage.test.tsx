import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WishlistPage } from "./WishlistPage";

vi.mock("../features/library/useWishlistQuery", () => ({
  useWishlistQuery: vi.fn(),
}));

vi.mock("../features/library/useLibraryFilters", () => ({
  useLibraryFilters: () => ({
    filters: {},
    sortBy: "name",
    sortDirection: "asc",
    updateFilters: vi.fn(),
    updateSort: vi.fn(),
    clearFilters: vi.fn(),
  }),
}));

vi.mock("../features/library/useLibraryEntryMutations", () => ({
  useMoveWishlistToCollection: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("../components/library/LibraryToolbar", () => ({
  LibraryToolbar: () => <div>Toolbar</div>,
}));

vi.mock("../components/library/LibraryList", () => ({
  LibraryList: () => <button type="button">Move to collection</button>,
}));

import { useWishlistQuery } from "../features/library/useWishlistQuery";

describe("WishlistPage", () => {
  it("renders the wishlist heading and move action", () => {
    vi.mocked(useWishlistQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    render(
      <MemoryRouter>
        <WishlistPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /wishlist/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move to collection/i })).toBeInTheDocument();
  });
});
