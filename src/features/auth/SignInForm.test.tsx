import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Mock the Supabase client
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
const mockSupabase = {
  auth: {
    signInWithOtp: mockSignIn,
    signOut: mockSignOut,
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
});
