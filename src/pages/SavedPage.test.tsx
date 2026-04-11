import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { SavedPage } from "./SavedPage";
import { renderWithProviders } from "../test/testUtils";

const mockUseProfile = vi.fn();

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

vi.mock("../features/library/useOwnedLibrarySurfaceQuery", () => ({
  useOwnedLibrarySurfaceQuery: vi.fn(),
}));

import { useOwnedLibrarySurfaceQuery } from "../features/library/useOwnedLibrarySurfaceQuery";

vi.mock("../features/auth/useProfile", () => ({
  useProfile: () => mockUseProfile(),
}));

function LocationProbe() {
  const location = useLocation();

  return (
    <div>
      <div data-testid="location-pathname">{location.pathname}</div>
      <div data-testid="location-state">{JSON.stringify(location.state)}</div>
    </div>
  );
}

describe("SavedPage", () => {
  beforeEach(() => {
    mockUseProfile.mockReset();
    vi.mocked(useOwnedLibrarySurfaceQuery).mockReset();
    mockUseProfile.mockReturnValue({
      profile: null,
      isOwner: false,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it("renders the saved heading and list", () => {
    vi.mocked(useOwnedLibrarySurfaceQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    const { container } = renderWithProviders(
      <>
        <SavedPage />
      </>,
    );

    expect(screen.getByRole("heading", { name: /saved/i })).toBeInTheDocument();
    expect(screen.getByText(/saved list/i)).toBeInTheDocument();
    expect(container.querySelector("header > div")).toHaveClass("glass-surface-panel");
    expect(container.querySelector(".library-search-section")).toHaveClass("mb-8");
  });

  it("routes guest sign-in prompts through sign-in overlay state", async () => {
    const user = userEvent.setup();

    vi.mocked(useOwnedLibrarySurfaceQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    renderWithProviders(
      <>
        <SavedPage />
        <LocationProbe />
      </>,
      "/saved",
    );

    await user.click(screen.getByRole("link", { name: /sign in to sync/i }));

    expect(screen.getByTestId("location-pathname")).toHaveTextContent("/signin");
    expect(screen.getByTestId("location-state")).toHaveTextContent('"pathname":"/saved"');
  });

  it("opens the add-game wizard with saved as the default destination", async () => {
    const user = userEvent.setup();
    mockUseProfile.mockReturnValue({
      profile: { id: "user-1" },
      isOwner: false,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    vi.mocked(useOwnedLibrarySurfaceQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    renderWithProviders(
      <>
        <SavedPage />
      </>,
    );

    await user.click(screen.getByRole("button", { name: /open add game wizard/i }));

    expect(
      screen.getByText(/"isSaved":true,"isLoved":false,"isInCollection":false/i),
    ).toBeInTheDocument();
  });

  it("lets guests open the add-game wizard without being redirected to sign in", async () => {
    const user = userEvent.setup();

    vi.mocked(useOwnedLibrarySurfaceQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    renderWithProviders(<SavedPage />);

    await user.click(screen.getByRole("button", { name: /open add game wizard/i }));

    expect(
      screen.getByText(/"isSaved":true,"isLoved":false,"isInCollection":false/i),
    ).toBeInTheDocument();
  });
});
