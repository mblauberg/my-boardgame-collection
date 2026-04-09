import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/testUtils";
import { ExplorePage } from "./ExplorePage";

vi.mock("../features/library/useExploreQuery", () => ({
  useExploreQuery: vi.fn(),
}));

vi.mock("../features/library/useExploreSearch", () => ({
  useExploreSearch: vi.fn(() => ({ data: [], isLoading: false, error: null })),
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

describe("ExplorePage", () => {
  it("renders the Explore shelves", () => {
    vi.mocked(useExploreQuery).mockReturnValue({
      data: {
        shelves: [
          { id: "trending", title: "Trending Now", entries: [], sections: [] },
          { id: "new-releases", title: "New Releases", entries: [], sections: [] },
          { id: "by-mechanic", title: "Discovery by Mechanic", entries: [], sections: [] },
          { id: "hidden-gems", title: "Hidden Gems", entries: [], sections: [] },
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    renderWithProviders(<ExplorePage />, "/explore");

    expect(screen.getByText("Trending Now")).toBeInTheDocument();
    expect(screen.getByText("Discovery by Mechanic")).toBeInTheDocument();
    expect(screen.getByText("New Releases")).toBeInTheDocument();
    expect(screen.getByText("Hidden Gems")).toBeInTheDocument();
  });

  it("requests only the shelves rendered on the explore page", () => {
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
});
