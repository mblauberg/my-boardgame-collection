import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();
const mockGetSession = vi.fn();
const mockInvoke = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: mockGetSession,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
    functions: {
      invoke: mockInvoke,
    },
  }),
}));

import { AuthCallbackPage } from "./AuthCallbackPage";

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthCallbackPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AuthCallbackPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockGetSession.mockReset();
    mockInvoke.mockReset();
    mockSignOut.mockReset();
    mockOnAuthStateChange.mockClear();
  });

  it("syncs account security before redirecting to the collection after sign-in", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token", user: { id: "user-1" } } },
      error: null,
    });
    mockInvoke.mockResolvedValue({ data: { ok: true, needsPasskeyPrompt: false }, error: null });

    renderPage();

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("account-sync-session", undefined);
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("adds the post-login prompt flag when the synced account still needs a passkey", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token", user: { id: "user-1" } } },
      error: null,
    });
    mockInvoke.mockResolvedValue({ data: { ok: true, needsPasskeyPrompt: true }, error: null });

    renderPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/?passkey_prompt=1", { replace: true });
    });
  });
});
