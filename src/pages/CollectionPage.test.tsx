import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CollectionPage } from "./CollectionPage";

vi.mock("../features/library/useCollectionQuery", () => ({
  useCollectionQuery: vi.fn(),
}));

vi.mock("../features/auth/useProfile", () => ({
  useProfile: () => ({
    isAuthenticated: true,
    isOwner: false,
    isLoading: false,
    profile: null,
    error: null,
  }),
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

vi.mock("../components/library/AddGameWizardOverlay", () => ({
  AddGameWizardOverlay: ({
    isOpen,
    defaultState,
  }: {
    isOpen: boolean;
    defaultState: { isSaved: boolean; isLoved: boolean; isInCollection: boolean };
  }) =>
    isOpen ? <div>{`Add game wizard (${JSON.stringify(defaultState)})`}</div> : null,
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

  it("opens the add-game wizard with collection as the default destination", async () => {
    const user = userEvent.setup();

    vi.mocked(useCollectionQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    const { container } = render(
      <MemoryRouter>
        <CollectionPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /open add game wizard/i }));

    expect(
      screen.getByText(/"isSaved":false,"isLoved":false,"isInCollection":true/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/curated collection/i).closest("div")).toHaveClass("glass-surface-panel");
    expect(container.querySelector(".library-search-section")).toHaveClass("mb-8");
  });
});
