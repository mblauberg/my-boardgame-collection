import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockUsePublicLibraryQuery = vi.fn();

vi.mock("../features/library/usePublicLibraryQuery", () => ({
  usePublicLibraryQuery: (username: string, surface: "collection" | "saved") =>
    mockUsePublicLibraryQuery(username, surface),
}));

import { PublicSavedPage } from "./PublicSavedPage";

describe("PublicSavedPage", () => {
  it("renders the public saved heading and library items", () => {
    mockUsePublicLibraryQuery.mockReturnValue({
      data: {
        username: "alice",
        entries: [],
      },
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/u/alice/saved"]}>
        <Routes>
          <Route path="/u/:username/saved" element={<PublicSavedPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /alice/i })).toBeInTheDocument();
    expect(screen.getByText(/public saved/i)).toBeInTheDocument();
  });
});
