import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockUsePublicProfileQuery = vi.fn();

vi.mock("../features/profiles/usePublicProfileQuery", () => ({
  usePublicProfileQuery: (username: string) => mockUsePublicProfileQuery(username),
}));

import { PublicProfilePage } from "./PublicProfilePage";

describe("PublicProfilePage", () => {
  it("renders visible public sections for the requested username", async () => {
    mockUsePublicProfileQuery.mockReturnValue({
      data: {
        id: "profile-1",
        username: "alice",
        is_profile_public: true,
        is_collection_public: true,
        is_wishlist_public: false,
      },
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/u/alice"]}>
        <Routes>
          <Route path="/u/:username" element={<PublicProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /alice/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /collection/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /wishlist/i })).not.toBeInTheDocument();
  });

  it("renders not found style output when the profile is not public", async () => {
    mockUsePublicProfileQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/u/private-user"]}>
        <Routes>
          <Route path="/u/:username" element={<PublicProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/profile not found/i)).toBeInTheDocument();
  });
});
