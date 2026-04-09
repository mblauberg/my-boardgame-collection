import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../test/testUtils";

const mockUsePublicLibraryQuery = vi.fn();

vi.mock("../features/library/usePublicLibraryQuery", () => ({
  usePublicLibraryQuery: (username: string, listType: "collection" | "saved") =>
    mockUsePublicLibraryQuery(username, listType),
}));

vi.mock("../features/auth/useSession", () => ({
  useSession: () => ({ user: null }),
}));

vi.mock("../features/library/useLibraryEntryMutations", () => ({
  useUpsertLibraryState: () => ({ mutate: vi.fn(), isPending: false }),
  useMoveSavedToCollection: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteLibraryEntry: () => ({ mutate: vi.fn(), isPending: false }),
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

    renderWithProviders(
      <Routes>
        <Route path="/u/:username/collection" element={<PublicCollectionPage />} />
      </Routes>,
      "/u/alice/collection"
    );

    expect(screen.getByRole("heading", { name: /alice/i })).toBeInTheDocument();
    expect(screen.getByText(/public collection/i)).toBeInTheDocument();
  });
});
