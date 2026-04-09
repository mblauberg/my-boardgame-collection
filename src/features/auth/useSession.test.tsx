import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSubscription = { unsubscribe: vi.fn() };

const mockSupabase = {
  auth: {
    getSession: mockGetSession,
    onAuthStateChange: mockOnAuthStateChange,
  },
};

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

import { useSession } from "./useSession";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { Wrapper };
}

function makeSession(id: string): Session {
  return {
    access_token: `token-${id}`,
    refresh_token: `refresh-${id}`,
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id,
      email: `${id}@example.com`,
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    },
  } as Session;
}

describe("useSession", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockOnAuthStateChange.mockReset();
    mockSubscription.unsubscribe = vi.fn();
  });

  it("subscribes to auth state changes on mount", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: mockSubscription } });

    const { Wrapper } = makeWrapper();
    renderHook(() => useSession(), { wrapper: Wrapper });

    await waitFor(() => expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1));
    expect(mockOnAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it("updates immediately on SIGNED_IN auth events", async () => {
    let authCallback: ((event: string, session: Session | null) => void) | undefined;

    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: mockSubscription } };
    });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSession(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));

    act(() => {
      authCallback?.("SIGNED_IN", makeSession("user-1"));
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.id).toBe("user-1");
    });
  });

  it("clears immediately on SIGNED_OUT auth events", async () => {
    let authCallback: ((event: string, session: Session | null) => void) | undefined;

    mockGetSession.mockResolvedValue({
      data: { session: makeSession("user-1") },
      error: null,
    });
    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: mockSubscription } };
    });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSession(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      authCallback?.("SIGNED_OUT", null);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });
});
