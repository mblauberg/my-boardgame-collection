import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { startRegistration } from "@simplewebauthn/browser";
import { AccountSettingsPage } from "./AccountSettingsPage";
import { ThemeProvider } from "../lib/theme";

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

vi.mock("@simplewebauthn/browser", () => ({
  startRegistration: vi.fn(),
}));

function renderAccountSettingsPage() {
  render(
    <MemoryRouter>
      <ThemeProvider>
        <AccountSettingsPage />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe("AccountSettingsPage", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mockInvoke.mockReset();
    mockSignOut.mockReset();
    mockGetSession.mockReset();
    vi.mocked(startRegistration).mockReset();

    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "test-access-token" } },
      error: null,
    });

    mockInvoke.mockImplementation(async (functionName: string) => {
      if (functionName === "passkey-list") {
        return { data: { passkeys: [] }, error: null };
      }
      if (functionName === "email-merge-request") {
        return { data: { ok: true }, error: null };
      }
      if (functionName === "passkey-register-options") {
        return {
          data: {
            challenge: "challenge-1",
            rp: { name: "Test RP", id: "localhost" },
            user: { id: "user-id", name: "alice@example.com", displayName: "alice@example.com" },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          },
          error: null,
        };
      }
      if (functionName === "passkey-register-verify") {
        return { data: { ok: true }, error: null };
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

  it("email field is editable", () => {
    renderAccountSettingsPage();

    const emailInput = screen.getByRole("textbox", { name: /^email$/i });
    expect(emailInput).not.toBeDisabled();
  });

  it("shows confirmation message after submitting new email", async () => {
    const user = userEvent.setup();

    renderAccountSettingsPage();

    const emailInput = screen.getByRole("textbox", { name: /^email$/i });
    await user.clear(emailInput);
    await user.type(emailInput, "new@example.com");
    await user.click(screen.getByRole("button", { name: /update email/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email to confirm the change/i)).toBeInTheDocument();
    });
  });

  it("passes the user's JWT when requesting passkey registration options", async () => {
    const user = userEvent.setup();
    vi.mocked(startRegistration).mockResolvedValue({
      id: "cred-1",
      rawId: "cred-1",
      response: {
        attestationObject: "attestation",
        clientDataJSON: "client-data",
      },
      type: "public-key",
      clientExtensionResults: {},
    } as never);

    renderAccountSettingsPage();

    await user.click(screen.getByRole("button", { name: /add passkey/i }));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith(
        "passkey-register-options",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-access-token",
          }),
        }),
      );
    });
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
        id: "user-1",
        username: "collector-alice",
        is_profile_public: true,
        is_collection_public: true,
        is_saved_public: true,
      }),
    );
  });

  it("shows the current public visibility summary", () => {
    renderAccountSettingsPage();

    expect(screen.getByText(/profile: public/i)).toBeInTheDocument();
    expect(screen.getByText(/collection: public/i)).toBeInTheDocument();
    expect(screen.getByText(/saved: private/i)).toBeInTheDocument();
  });

  it("renders a profile link when the signed-in user has a username", () => {
    renderAccountSettingsPage();

    expect(screen.getByRole("link", { name: /view profile/i })).toHaveAttribute(
      "href",
      "/u/alice",
    );
  });

  it("shows the Supabase error message when save rejects with a structured error object", async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValue({
      code: "42703",
      message: "column profiles.is_saved_public does not exist",
    });

    renderAccountSettingsPage();

    await user.click(screen.getByRole("button", { name: /save settings/i }));

    expect(
      await screen.findByText(/column profiles\.is_saved_public does not exist/i),
    ).toBeInTheDocument();
  });

  it("does not render the theme toggle in account settings", () => {
    renderAccountSettingsPage();

    expect(screen.queryByRole("button", { name: /toggle dark mode/i })).not.toBeInTheDocument();
  });

  it("renders accessible profile action with proper aria-label", () => {
    renderAccountSettingsPage();

    expect(screen.getByRole("link", { name: /view profile/i })).toBeInTheDocument();
  });

  it("uses explicit dark-mode text and surface classes for readability", () => {
    renderAccountSettingsPage();

    const heroHeading = screen.getByRole("heading", { name: /manage your account/i });
    expect(heroHeading).toHaveClass("text-on-surface");

    const saveButton = screen.getByRole("button", { name: /save settings/i });
    expect(saveButton.closest("form")).toHaveClass("dark:bg-[rgb(28_27_27)]");
  });
});
