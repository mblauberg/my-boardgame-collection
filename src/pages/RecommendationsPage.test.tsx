import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/testUtils";
import { RecommendationsPage } from "./RecommendationsPage";

vi.mock("../features/library/useExploreQuery", () => ({
  useExploreQuery: vi.fn(),
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

describe("RecommendationsPage", () => {
  it("shows the Explore loading state", () => {
    vi.mocked(useExploreQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never);

    renderWithProviders(<RecommendationsPage />);

    expect(screen.getByText(/loading explore shelves/i)).toBeInTheDocument();
  });

  it("shows the Explore error state", () => {
    vi.mocked(useExploreQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed"),
    } as never);

    renderWithProviders(<RecommendationsPage />);

    expect(screen.getByText(/explore unavailable/i)).toBeInTheDocument();
  });

  it("renders the compatibility Explore shelves", () => {
    vi.mocked(useExploreQuery).mockReturnValue({
      data: {
        shelves: [
          { id: "trending", title: "Trending Now", entries: [], sections: [] },
          { id: "new-releases", title: "New Releases", entries: [], sections: [] },
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    renderWithProviders(<RecommendationsPage />);

    expect(screen.getByText("Trending Now")).toBeInTheDocument();
    expect(screen.getByText("New Releases")).toBeInTheDocument();
  });
});
