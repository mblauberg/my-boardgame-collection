import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";
import { AccountSettingsPage } from "./AccountSettingsPage";
import { renderWithProviders } from "../test/testUtils";

const useProfile = vi.fn();
const mutateAsync = vi.fn();
const mockInvoke = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();

vi.mock("../features/auth/useProfile", () => ({
  useProfile: () => useProfile(),
}));

vi.mock("../features/profiles/useUpdateProfileMutation", () => ({
  useUpdateProfileMutation: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

vi.mock("../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      signOut: mockSignOut,
      getSession: mockGetSession,
    },
    functions: {
      invoke: mockInvoke,
    },
  }),
}));

function renderAccountSettingsPage(initialRoute = "/settings") {
  renderWithProviders(<AccountSettingsPage />, initialRoute);
}

describe("AccountSettingsPage", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mockInvoke.mockReset();
    mockSignOut.mockReset();
    mockGetSession.mockReset();

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: "test-access-token",
          user: {
            id: "user-1",
            email: "alice@example.com",
            app_metadata: { provider: "google" },
            identities: [{ provider: "google" }],
          },
        },
      },
      error: null,
    });

    mockInvoke.mockImplementation(async (functionName: string) => {
      if (functionName === "passkey-list") {
        return { data: { passkeys: [] }, error: null };
      }
      return { data: null, error: null };
    });

    useProfile.mockReturnValue({
      profile: {
        id: "user-1",
        email: "alice@example.com",
        role: "viewer",
        username: "alice",
        is_profile_public: true,
        is_collection_public: true,
        is_saved_public: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      isOwner: false,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  });

  it("renders a quiet sign-in methods card with a premium no-passkey state", async () => {
    renderAccountSettingsPage();

    expect(await screen.findByRole("button", { name: /^sign-in methods$/i })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /set up passkey/i })).toBeInTheDocument();
    expect(screen.getAllByText(/alice@example.com/i).length).toBeGreaterThan(0);
  });

  it("opens sign-in methods in a floating sheet on desktop", async () => {
    const user = userEvent.setup();

    renderAccountSettingsPage();
    await user.click(screen.getByRole("button", { name: /^sign-in methods$/i }));

    const dialog = screen.getByRole("dialog", { name: /sign-in methods/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/^linked providers$/i)).toBeInTheDocument();
  });

  it("loads the profile values and saves updates through the profile mutation", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({ id: "user-1" });

    renderAccountSettingsPage();

    const usernameInput = screen.getByLabelText(/username/i);
    expect(usernameInput).toHaveValue("alice");
    expect(screen.getByRole("checkbox", { name: /public profile/i })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /public collection/i })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /public saved/i })).not.toBeChecked();

    await user.clear(usernameInput);
    await user.type(usernameInput, "collector-alice");
    await user.click(screen.getByRole("checkbox", { name: /public saved/i }));
    await user.click(screen.getByRole("button", { name: /save settings/i }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        accountId: "user-1",
        username: "collector-alice",
        is_profile_public: true,
        is_collection_public: true,
        is_saved_public: true,
      }),
    );
  });

  it("renders a profile link when the signed-in user has a username", () => {
    renderAccountSettingsPage();

    expect(screen.getByRole("link", { name: /view profile/i })).toHaveAttribute(
      "href",
      "/u/alice",
    );
  });

  it("removes placeholder settings sections from the old account page", () => {
    renderAccountSettingsPage();

    expect(screen.queryByText(/notifications/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/share your collection/i)).not.toBeInTheDocument();
  });
});
