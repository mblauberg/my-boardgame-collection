import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ExplorePage } from "./ExplorePage";

vi.mock("../features/library/useExploreQuery", () => ({
  useExploreQuery: vi.fn(),
}));

vi.mock("../components/library/ExploreShelf", () => ({
  ExploreShelf: ({ title }: { title: string }) => <section>{title}</section>,
}));

import { useExploreQuery } from "../features/library/useExploreQuery";

describe("ExplorePage", () => {
  it("renders the Explore shelves", () => {
    vi.mocked(useExploreQuery).mockReturnValue({
      data: {
        shelves: [
          { id: "for-you", title: "For You", entries: [] },
          { id: "trending", title: "Trending Now", entries: [] },
          { id: "mechanic", title: "Discovery by Mechanic", entries: [] },
          { id: "new", title: "New Releases", entries: [] },
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    render(
      <MemoryRouter>
        <ExplorePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("For You")).toBeInTheDocument();
    expect(screen.getByText("Trending Now")).toBeInTheDocument();
    expect(screen.getByText("Discovery by Mechanic")).toBeInTheDocument();
    expect(screen.getByText("New Releases")).toBeInTheDocument();
  });
});
