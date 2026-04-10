import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { CollectionPage } from "./CollectionPage";
import { renderWithProviders } from "../test/testUtils";

const mockUseProfile = vi.fn();
const mockUseAccountSecuritySummary = vi.fn();

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

vi.mock("../features/auth/PasskeyRegistrationPrompt", () => ({
  PasskeyRegistrationPrompt: () => <div>Passkey prompt</div>,
}));

import { useCollectionQuery } from "../features/library/useCollectionQuery";

vi.mock("../features/auth/useProfile", () => ({
  useProfile: () => mockUseProfile(),
}));

vi.mock("../features/auth/useAccountSecuritySummary", () => ({
  useAccountSecuritySummary: () => mockUseAccountSecuritySummary(),
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

describe("CollectionPage", () => {
  beforeEach(() => {
    mockUseProfile.mockReset();
    mockUseAccountSecuritySummary.mockReset();
    mockUseProfile.mockReturnValue({
      profile: null,
      isOwner: false,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    mockUseAccountSecuritySummary.mockReturnValue({
      data: {
        primaryEmail: "alice@example.com",
        emails: [{ id: "alice@example.com-0", value: "alice@example.com", isPrimary: true }],
        identities: [],
        passkeys: [],
      },
      isLoading: false,
    });
  });

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

    renderWithProviders(
      <>
        <CollectionPage />
      </>,
    );

    expect(screen.getByText(/schema\.sql/i)).toBeInTheDocument();
    expect(screen.getByText(/migrate:import/i)).toBeInTheDocument();
  });

  it("routes guest sign-in prompts through sign-in overlay state", async () => {
    const user = userEvent.setup();

    vi.mocked(useCollectionQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    renderWithProviders(
      <>
        <CollectionPage />
        <LocationProbe />
      </>,
      "/",
    );

    await user.click(screen.getByRole("link", { name: /sign in to sync/i }));

    expect(screen.getByTestId("location-pathname")).toHaveTextContent("/signin");
    expect(screen.getByTestId("location-state")).toHaveTextContent('"pathname":"/"');
  });

  it("opens the add-game wizard with collection as the default destination", async () => {
    const user = userEvent.setup();
    mockUseProfile.mockReturnValue({
      profile: { id: "user-1" },
      isOwner: false,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    vi.mocked(useCollectionQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    const { container } = renderWithProviders(
      <>
        <CollectionPage />
      </>,
    );

    await user.click(screen.getByRole("button", { name: /open add game wizard/i }));

    expect(
      screen.getByText(/"isSaved":false,"isLoved":false,"isInCollection":true/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/curated collection/i).closest("div")).toHaveClass("glass-surface-panel");
    expect(container.querySelector(".library-search-section")).toHaveClass("mb-8");
  });

  it("shows the passkey prompt immediately after a post-auth redirect when the account has no passkeys", () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "user-1", email: "alice@example.com" },
      isOwner: false,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    vi.mocked(useCollectionQuery).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as never);

    renderWithProviders(<CollectionPage />, "/?passkey_prompt=1");

    expect(screen.getByText("Passkey prompt")).toBeInTheDocument();
  });
});
