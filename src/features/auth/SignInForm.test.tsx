import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Mock the Supabase client
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockLinkIdentity = vi.fn();
const mockSupabase = {
  auth: {
    signInWithOtp: mockSignIn,
    signOut: mockSignOut,
    signInWithOAuth: mockSignInWithOAuth,
    linkIdentity: mockLinkIdentity,
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  from: vi.fn(),
};

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

// Import after mocking
// eslint-disable-next-line import/first
import { SignInForm } from "./SignInForm";

function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("SignInForm", () => {
  beforeEach(() => {
    mockSignIn.mockClear();
    mockSignOut.mockClear();
    mockSignInWithOAuth.mockClear();
    mockLinkIdentity.mockClear();
    mockSignInWithOAuth.mockImplementation(async ({ options }: { options?: { skipBrowserRedirect?: boolean } }) => {
      if (options?.skipBrowserRedirect) {
        return { data: { url: "https://oauth.example.com/preflight" }, error: null };
      }

      return { data: { url: "https://oauth.example.com/auth" }, error: null };
    });
  });

  it("submits a magic-link request for a valid email address", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ error: null });

    render(<SignInForm />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "owner@example.com",
        options: expect.any(Object),
      });
    });
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();

    render(<SignInForm />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "invalid-email");
    await user.tab(); // Trigger blur to validate
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("shows success message after sending magic link", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ error: null });

    render(<SignInForm />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
  });

  it("shows error message when sign-in fails", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ error: { message: "Network error" } });

    render(<SignInForm />, { wrapper: TestWrapper });

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  it("offers multiple OAuth sign-in options", async () => {
    render(<SignInForm />, { wrapper: TestWrapper });

    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with apple/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with github/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /continue with google/i })).toBeEnabled();
    });
  });

  it("starts OAuth sign in when a provider button is clicked", async () => {
    const user = userEvent.setup();

    render(<SignInForm />, { wrapper: TestWrapper });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /continue with google/i })).toBeEnabled();
    });

    await user.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => {
      const calls = mockSignInWithOAuth.mock.calls.map(([arg]) => arg);
      const interactiveGoogleCall = calls.find(
        (call) => call.provider === "google" && !call.options?.skipBrowserRedirect,
      );

      expect(interactiveGoogleCall).toEqual(
        expect.objectContaining({
          provider: "google",
          options: expect.objectContaining({
            redirectTo: expect.stringContaining("/auth/callback"),
          }),
        }),
      );
    });
  });

  it("greys out unavailable OAuth providers and keeps them unclickable", async () => {
    const user = userEvent.setup();
    mockSignInWithOAuth.mockImplementation(async ({ provider, options }) => {
      if (options?.skipBrowserRedirect) {
        if (provider === "apple") {
          return {
            data: { url: null },
            error: { message: "Unsupported provider: missing OAuth secret" },
          };
        }

        return { data: { url: "https://oauth.example.com/preflight" }, error: null };
      }

      return { data: { url: "https://oauth.example.com/auth" }, error: null };
    });

    render(<SignInForm />, { wrapper: TestWrapper });

    const appleButton = screen.getByRole("button", { name: /continue with apple/i });
    await waitFor(() => {
      expect(appleButton).toBeDisabled();
    });

    await user.click(appleButton);

    const interactiveAppleCalls = mockSignInWithOAuth.mock.calls
      .map(([arg]) => arg)
      .filter((call) => call.provider === "apple" && !call.options?.skipBrowserRedirect);

    expect(interactiveAppleCalls).toHaveLength(0);
  });
});
