import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../test/testUtils";

const mockUsePublicLibraryQuery = vi.fn();

vi.mock("../features/library/usePublicLibraryQuery", () => ({
  usePublicLibraryQuery: (username: string, surface: "collection" | "saved") =>
    mockUsePublicLibraryQuery(username, surface),
}));

vi.mock("../features/auth/useSession", () => ({
  useSession: () => ({ user: null }),
}));

vi.mock("../features/library/useLibraryEntryMutations", () => ({
  useUpsertLibraryState: () => ({ mutate: vi.fn(), isPending: false }),
  useMoveSavedToCollection: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteLibraryEntry: () => ({ mutate: vi.fn(), isPending: false }),
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

    renderWithProviders(
      <Routes>
        <Route path="/u/:username/saved" element={<PublicSavedPage />} />
      </Routes>,
      "/u/alice/saved"
    );

    expect(screen.getByRole("heading", { name: /alice/i })).toBeInTheDocument();
    expect(screen.getByText(/public saved/i)).toBeInTheDocument();
  });
});
