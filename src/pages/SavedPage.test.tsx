import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SavedPage } from "./SavedPage";

vi.mock("../features/library/useSavedQuery", () => ({
  useSavedQuery: vi.fn(),
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
  LibraryList: () => <div>Saved list</div>,
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

import { useSavedQuery } from "../features/library/useSavedQuery";

describe("SavedPage", () => {
  it("renders the saved heading and list", () => {
    vi.mocked(useSavedQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    render(
      <MemoryRouter>
        <SavedPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /saved/i })).toBeInTheDocument();
    expect(screen.getByText(/saved list/i)).toBeInTheDocument();
    expect(screen.getByText("On Your Radar").closest("div")).toHaveClass("glass-surface-panel");
  });

  it("opens the add-game wizard with saved as the default destination", async () => {
    const user = userEvent.setup();

    vi.mocked(useSavedQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    render(
      <MemoryRouter>
        <SavedPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /open add game wizard/i }));

    expect(
      screen.getByText(/"isSaved":true,"isLoved":false,"isInCollection":false/i),
    ).toBeInTheDocument();
  });
});
