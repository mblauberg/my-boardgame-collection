import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PublicProfilePage } from "./PublicProfilePage";

const mockUsePublicProfileQuery = vi.fn();

vi.mock("../features/profiles/usePublicProfileQuery", () => ({
  usePublicProfileQuery: (username: string) => mockUsePublicProfileQuery(username),
}));

describe("PublicProfilePage", () => {
  beforeEach(() => {
    mockUsePublicProfileQuery.mockReset();
  });

  it("renders loading state inside a section container", () => {
    mockUsePublicProfileQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const { container } = render(
      <MemoryRouter initialEntries={["/u/alice"]}>
        <Routes>
          <Route path="/u/:username" element={<PublicProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /loading profile/i })).toBeInTheDocument();
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("renders visible public sections in semantic article and aside containers", () => {
    mockUsePublicProfileQuery.mockReturnValue({
      data: {
        id: "profile-1",
        username: "alice",
        is_profile_public: true,
        is_collection_public: true,
        is_saved_public: false,
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <MemoryRouter initialEntries={["/u/alice"]}>
        <Routes>
          <Route path="/u/:username" element={<PublicProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /alice/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /collection/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /saved/i })).not.toBeInTheDocument();
    expect(container.querySelector("article")).toBeInTheDocument();
    expect(container.querySelector("aside")).toBeInTheDocument();
  });

  it("renders not-found output inside a section container when the profile is private", () => {
    mockUsePublicProfileQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <MemoryRouter initialEntries={["/u/private-user"]}>
        <Routes>
          <Route path="/u/:username" element={<PublicProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/profile not found/i)).toBeInTheDocument();
    expect(container.querySelector("section")).toBeInTheDocument();
  });
});
