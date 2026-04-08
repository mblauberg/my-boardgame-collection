import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RecommendationsPage } from "./RecommendationsPage";

vi.mock("../features/library/useExploreQuery", () => ({
  useExploreQuery: vi.fn(),
}));

vi.mock("../components/library/ExploreShelf", () => ({
  ExploreShelf: ({ title }: { title: string }) => <section>{title}</section>,
}));

import { useExploreQuery } from "../features/library/useExploreQuery";

describe("RecommendationsPage", () => {
  it("shows the Explore loading state", () => {
    vi.mocked(useExploreQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never);

    render(
      <MemoryRouter>
        <RecommendationsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/loading explore shelves/i)).toBeInTheDocument();
  });

  it("shows the Explore error state", () => {
    vi.mocked(useExploreQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed"),
    } as never);

    render(
      <MemoryRouter>
        <RecommendationsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/explore unavailable/i)).toBeInTheDocument();
  });

  it("renders the compatibility Explore shelves", () => {
    vi.mocked(useExploreQuery).mockReturnValue({
      data: {
        shelves: [
          { id: "for-you", title: "For You", entries: [] },
          { id: "trending", title: "Trending Now", entries: [] },
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    render(
      <MemoryRouter>
        <RecommendationsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("For You")).toBeInTheDocument();
    expect(screen.getByText("Trending Now")).toBeInTheDocument();
  });
});
