import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockUsePublicLibraryQuery = vi.fn();

vi.mock("../features/library/usePublicLibraryQuery", () => ({
  usePublicLibraryQuery: (username: string, listType: "collection" | "saved") =>
    mockUsePublicLibraryQuery(username, listType),
}));

import { PublicCollectionPage } from "./PublicCollectionPage";

describe("PublicCollectionPage", () => {
  it("renders the public collection heading and library items", () => {
    mockUsePublicLibraryQuery.mockReturnValue({
      data: {
        username: "alice",
        entries: [],
      },
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/u/alice/collection"]}>
        <Routes>
          <Route path="/u/:username/collection" element={<PublicCollectionPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /alice/i })).toBeInTheDocument();
    expect(screen.getByText(/public collection/i)).toBeInTheDocument();
  });
});
