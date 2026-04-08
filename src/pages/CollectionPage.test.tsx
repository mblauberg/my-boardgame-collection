import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CollectionPage } from "./CollectionPage";

vi.mock("../features/library/useCollectionQuery", () => ({
  useCollectionQuery: vi.fn(),
}));

vi.mock("../features/library/useLibraryFilters", () => ({
  useLibraryFilters: () => ({
    filters: {},
    sortBy: "name",
    sortDirection: "asc",
    updateFilters: vi.fn(),
    updateSort: vi.fn(),
    clearFilters: vi.fn(),
  }),
}));

vi.mock("../components/library/LibraryToolbar", () => ({
  LibraryToolbar: () => <div>Toolbar</div>,
}));

vi.mock("../components/library/LibraryList", () => ({
  LibraryList: () => <div>Library list</div>,
}));

import { useCollectionQuery } from "../features/library/useCollectionQuery";

describe("CollectionPage", () => {
  it("shows setup guidance when Supabase is missing the public tables", () => {
    vi.mocked(useCollectionQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: {
        status: 404,
        code: "PGRST205",
        message: "Could not find the table 'public.library_entries' in the schema cache",
      },
    } as never);

    render(
      <MemoryRouter>
        <CollectionPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/schema\.sql/i)).toBeInTheDocument();
    expect(screen.getByText(/migrate:import/i)).toBeInTheDocument();
  });
});
