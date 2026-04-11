import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";

const mockRpc = vi.fn();
const mockSyncAccountSession = vi.fn();
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  rpc: mockRpc,
};

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

vi.mock("../auth/accountSecurityApi", () => ({
  syncAccountSession: () => mockSyncAccountSession(),
}));

import { useAccount } from "./useAccount";

function createTestWrapper(session: Session | null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  mockSupabase.auth.getSession.mockResolvedValue({
    data: { session },
    error: null,
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return Wrapper;
}

describe("useAccount", () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockSyncAccountSession.mockReset();
  });

  it("loads the current account context for the signed-in user", async () => {
    const session = {
      access_token: "token",
      refresh_token: "refresh-token",
      expires_in: 3600,
      token_type: "bearer",
      user: {
        id: "user-1",
        email: "alice@example.com",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      },
    } as Session;

    mockRpc.mockResolvedValue({
      data: [
        {
          account_id: "account-1",
          primary_auth_user_id: "user-1",
          primary_email: "alice@example.com",
        },
      ],
      error: null,
    });

    const { result } = renderHook(() => useAccount(), {
      wrapper: createTestWrapper(session),
    });

    await waitFor(() => {
      expect(result.current.account?.id).toBe("account-1");
      expect(result.current.account?.primaryEmail).toBe("alice@example.com");
      expect(result.current.account?.primaryAuthUserId).toBe("user-1");
    });
  });

  it("returns no account when the user is signed out", async () => {
    const { result } = renderHook(() => useAccount(), {
      wrapper: createTestWrapper(null),
    });

    await waitFor(() => {
      expect(result.current.account).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it("syncs the account session and retries when account context is initially missing", async () => {
    const session = {
      access_token: "token",
      refresh_token: "refresh-token",
      expires_in: 3600,
      token_type: "bearer",
      user: {
        id: "user-1",
        email: "alice@example.com",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      },
    } as Session;

    mockRpc
      .mockResolvedValueOnce({
        data: [],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            account_id: "account-1",
            primary_auth_user_id: "user-1",
            primary_email: "alice@example.com",
          },
        ],
        error: null,
      });
    mockSyncAccountSession.mockResolvedValue({
      needsPasskeyPrompt: false,
    });

    const { result } = renderHook(() => useAccount(), {
      wrapper: createTestWrapper(session),
    });

    await waitFor(() => {
      expect(result.current.account?.id).toBe("account-1");
    });

    expect(mockSyncAccountSession).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledTimes(2);
  });
});
