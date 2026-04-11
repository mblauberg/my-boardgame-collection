import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { startAuthentication } from "@simplewebauthn/browser";
import { renderWithProviders } from "../../test/testUtils";

const { mockCancelCeremony } = vi.hoisted(() => ({
  mockCancelCeremony: vi.fn(),
}));

const mockUseProfile = vi.fn();
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockLinkIdentity = vi.fn();
const mockVerifyOtp = vi.fn();
const mockInvoke = vi.fn();

const mockSupabase = {
  auth: {
    signInWithOtp: mockSignIn,
    signOut: mockSignOut,
    signInWithOAuth: mockSignInWithOAuth,
    linkIdentity: mockLinkIdentity,
    verifyOtp: mockVerifyOtp,
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  functions: {
    invoke: mockInvoke,
  },
  from: vi.fn(),
};

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

vi.mock("@simplewebauthn/browser", () => ({
  startAuthentication: vi.fn(),
  WebAuthnAbortService: {
    cancelCeremony: mockCancelCeremony,
  },
}));

vi.mock("./useProfile", () => ({
  useProfile: () => mockUseProfile(),
}));

import { SignInForm } from "./SignInForm";
import { SignInPage } from "../../pages/SignInPage";

function renderSignInForm() {
  return renderWithProviders(<SignInForm />);
}

describe("SignInForm", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    mockUseProfile.mockReset();
    mockSignIn.mockClear();
    mockSignOut.mockClear();
    mockSignInWithOAuth.mockClear();
    mockLinkIdentity.mockClear();
    mockVerifyOtp.mockClear();
    mockInvoke.mockClear();
    mockCancelCeremony.mockClear();
    vi.mocked(startAuthentication).mockReset();
    vi.stubEnv("VITE_AUTH_ENABLED_OAUTH_PROVIDERS", "google,discord,github");

    mockSignInWithOAuth.mockImplementation(async () => {
      return { data: { url: "https://oauth.example.com/auth" }, error: null };
    });

    mockInvoke.mockImplementation(async (functionName: string) => {
      if (functionName === "passkey-auth-options") {
        return { data: null, error: { message: "not configured" } };
      }
      return { data: null, error: null };
    });

    mockUseProfile.mockReturnValue({
      profile: null,
      isOwner: false,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it("renders sign-in inside a dialog-style overlay shell", () => {
    renderWithProviders(<SignInPage />);

    expect(screen.getByRole("dialog", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders the email field before OAuth buttons", () => {
    renderSignInForm();

    const email = screen.getByPlaceholderText(/email/i);
    const googleButton = screen.getByRole("button", { name: /google/i });

    expect(email.compareDocumentPosition(googleButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("email input has autocomplete='username webauthn'", () => {
    renderSignInForm();

    const email = screen.getByPlaceholderText(/email/i);
    expect(email).toHaveAttribute("autocomplete", "username webauthn");
  });

  it("does not render a standalone passkey button", () => {
    renderSignInForm();

    expect(screen.queryByRole("button", { name: /passkey/i })).not.toBeInTheDocument();
  });

  it("does not render authenticated provider-link management inside SignInForm", () => {
    mockUseProfile.mockReturnValue({
      profile: {
        id: "user-1",
        email: "owner@example.com",
        role: "owner",
        username: "owner",
        is_profile_public: true,
        is_collection_public: true,
        is_saved_public: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      isOwner: true,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    renderSignInForm();

    expect(screen.queryByText(/link another sign-in method/i)).not.toBeInTheDocument();
  });

  it("submits a magic-link request for a valid email address", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ error: null });

    renderSignInForm();

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.click(screen.getByRole("button", { name: /continue with email/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "owner@example.com",
        options: expect.any(Object),
      });
    });
  });

  it("uses the current browser origin for magic-link redirect", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ error: null });

    renderSignInForm();

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.click(screen.getByRole("button", { name: /continue with email/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }),
        }),
      );
    });
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();

    renderSignInForm();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "invalid-email");
    await user.tab();
    await user.click(screen.getByRole("button", { name: /continue with email/i }));

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("shows success message after sending magic link", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ error: null });

    renderSignInForm();

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.click(screen.getByRole("button", { name: /continue with email/i }));

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
    expect(screen.getByTestId("auth-status-panel")).toHaveClass("glass-surface-panel");
  });

  it("shows error message when sign-in fails", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ error: { message: "Network error" } });

    renderSignInForm();

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.click(screen.getByRole("button", { name: /continue with email/i }));

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
    expect(screen.getByTestId("auth-status-panel")).toHaveAttribute("data-motion", "auth-status");
  });

  it("offers multiple OAuth sign-in options", async () => {
    renderSignInForm();

    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with apple/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with github/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeEnabled();
  });

  it("does not probe OAuth providers on mount", async () => {
    renderSignInForm();

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("passkey-auth-options");
    });

    expect(mockSignInWithOAuth).not.toHaveBeenCalled();
  });

  it("starts OAuth sign in when a provider button is clicked", async () => {
    const user = userEvent.setup();

    renderSignInForm();
    await user.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: "google",
          options: expect.objectContaining({
            redirectTo: expect.stringContaining("/auth/callback"),
          }),
        }),
      );
    });
  });

  it("disables OAuth providers omitted from the public auth env", async () => {
    const user = userEvent.setup();
    vi.stubEnv("VITE_AUTH_ENABLED_OAUTH_PROVIDERS", "google,github");

    renderSignInForm();

    const discordButton = screen.getByRole("button", { name: /continue with discord/i });
    expect(discordButton).toBeDisabled();

    await user.click(discordButton);

    expect(mockSignInWithOAuth).not.toHaveBeenCalled();
  });

  it("calls startAuthentication with useBrowserAutofill on mount", async () => {
    mockInvoke.mockImplementation(async (functionName: string) => {
      if (functionName === "passkey-auth-options") {
        return { data: { challenge: "challenge-123" }, error: null };
      }
      if (functionName === "passkey-auth-verify") {
        return { data: { token_hash: "token-hash-123" }, error: null };
      }
      return { data: null, error: null };
    });
    vi.mocked(startAuthentication).mockResolvedValue({ id: "credential-id" } as never);
    mockVerifyOtp.mockResolvedValue({ error: null });

    renderSignInForm();

    await waitFor(() => {
      expect(startAuthentication).toHaveBeenCalledWith(
        expect.objectContaining({ useBrowserAutofill: true }),
      );
    });
  });

  it("aborts the conditional request when the email form is submitted", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ error: null });
    mockInvoke.mockImplementation(async (functionName: string) => {
      if (functionName === "passkey-auth-options") {
        return { data: { challenge: "challenge-123" }, error: null };
      }
      return { data: null, error: null };
    });
    vi.mocked(startAuthentication).mockImplementation(() => new Promise(() => {}));

    renderSignInForm();

    await waitFor(() => {
      expect(startAuthentication).toHaveBeenCalled();
    });
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /continue with email/i }));

    expect(mockCancelCeremony).toHaveBeenCalled();
  });
});
