import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/testUtils";
import { ExplorePage } from "./ExplorePage";

vi.mock("../features/library/useExploreQuery", () => ({
  useExploreQuery: vi.fn(),
}));

vi.mock("../features/library/useExploreSearch", () => ({
  useExploreSearch: vi.fn(() => ({ data: [], isLoading: false, error: null })),
}));

vi.mock("../features/library/useLibraryQuery", () => ({
  useLibraryQuery: () => ({ data: [], isLoading: false, error: null }),
}));

vi.mock("../components/library/ExploreShelf", () => ({
  ExploreShelf: ({ title }: { title: string }) => <section>{title}</section>,
}));

vi.mock("../components/library/HorizontalShelf", () => ({
  HorizontalShelf: ({ title }: { title: string }) => <section>{title}</section>,
}));

vi.mock("../components/library/DiscoverSection", () => ({
  DiscoverSection: ({ title }: { title: string }) => <section>{title}</section>,
}));

import { useExploreQuery } from "../features/library/useExploreQuery";

const game = {
  id: "game-1",
  name: "Heat",
  slug: "heat",
};

describe("ExplorePage", () => {
  it("renders hero shelves, discover sections, and the search control", () => {
    vi.mocked(useExploreQuery).mockReturnValue({
      data: {
        shelves: [
          { id: "trending", title: "Trending Now", entries: [game], sections: [] },
          { id: "new-releases", title: "New Releases", entries: [game], sections: [] },
          { id: "by-mechanic", title: "Discovery by Mechanic", entries: [game], sections: [] },
          { id: "hidden-gems", title: "Hidden Gems", entries: [game], sections: [] },
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    renderWithProviders(<ExplorePage />, "/explore");

    expect(screen.getByText("Trending Now")).toBeInTheDocument();
    expect(screen.getByText("New Releases")).toBeInTheDocument();
    expect(screen.getByText("Discovery by Mechanic")).toBeInTheDocument();
    expect(screen.getByText("Hidden Gems")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open search/i })).toBeInTheDocument();
  });

  it("requests the configured explore shelf ids", () => {
    vi.mocked(useExploreQuery).mockReturnValue({
      data: { shelves: [] },
      isLoading: false,
      error: null,
    } as never);

    renderWithProviders(<ExplorePage />, "/explore");

    expect(useExploreQuery).toHaveBeenCalledWith([
      "trending",
      "new-releases",
      "top-rated",
      "quick-wins",
      "by-player-count",
      "by-mechanic",
      "hidden-gems",
      "gateway-to-strategy",
    ]);
  });

  it("renders the discovery hero with the expandable search section", () => {
    vi.mocked(useExploreQuery).mockReturnValue({
      data: { shelves: [] },
      isLoading: false,
      error: null,
    } as never);

    const { container } = renderWithProviders(<ExplorePage />, "/explore");

    expect(screen.getByText(/find your next/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open search/i })).toBeInTheDocument();
    expect(container.querySelector(".explore-search-section")).not.toBeNull();
  });
});
