import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockUsePublicLibraryQuery = vi.fn();

vi.mock("../features/library/usePublicLibraryQuery", () => ({
  usePublicLibraryQuery: (username: string, listType: "collection" | "wishlist") =>
    mockUsePublicLibraryQuery(username, listType),
}));

import { PublicWishlistPage } from "./PublicWishlistPage";

describe("PublicWishlistPage", () => {
  it("renders the public wishlist heading and library items", () => {
    mockUsePublicLibraryQuery.mockReturnValue({
      data: {
        username: "alice",
        entries: [],
      },
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/u/alice/wishlist"]}>
        <Routes>
          <Route path="/u/:username/wishlist" element={<PublicWishlistPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /alice/i })).toBeInTheDocument();
    expect(screen.getByText(/public wishlist/i)).toBeInTheDocument();
  });
});
