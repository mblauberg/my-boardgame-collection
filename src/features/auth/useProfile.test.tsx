import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "./auth.types";

const mockRpc = vi.fn();
const mockMaybeSingle = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  rpc: mockRpc,
  from: mockFrom,
};

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

import { useProfile } from "./useProfile";

const ownerFixture: { session: Session; profile: Profile } = {
  session: {
    access_token: "mock-token",
    refresh_token: "mock-refresh",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: "auth-user-owner",
      email: "owner@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    },
  } as Session,
  profile: {
    id: "account-owner",
    email: "owner@example.com",
    role: "owner",
    username: "owner-user",
    is_profile_public: false,
    is_collection_public: false,
    is_saved_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

const viewerFixture: { session: Session; profile: Profile } = {
  session: {
    access_token: "mock-token-viewer",
    refresh_token: "mock-refresh-viewer",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: "auth-user-viewer",
      email: "viewer@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    },
  } as Session,
  profile: {
    id: "account-viewer",
    email: "viewer@example.com",
    role: "viewer",
    username: null,
    is_profile_public: false,
    is_collection_public: false,
    is_saved_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

function createAuthTestWrapper(fixture?: { session: Session; profile: Profile }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  mockSupabase.auth.getSession.mockResolvedValue({
    data: { session: fixture?.session ?? null },
    error: null,
  });

  mockRpc.mockResolvedValue({
    data: fixture
      ? [
          {
            account_id: fixture.profile.id,
            primary_auth_user_id: fixture.session.user.id,
            primary_email: fixture.profile.email,
          },
        ]
      : [],
    error: null,
  });

  mockMaybeSingle.mockResolvedValue({
    data: fixture?.profile ?? null,
    error: fixture ? null : { message: "Not found" },
  });

  mockEq.mockReturnValue({ single: mockMaybeSingle });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockFrom.mockImplementation((table: string) => {
    if (table === "profiles") {
      return { select: mockSelect };
    }
    throw new Error(`Unexpected table ${table}`);
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useProfile", () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockMaybeSingle.mockReset();
    mockEq.mockReset();
    mockSelect.mockReset();
    mockFrom.mockReset();
    mockSupabase.auth.getSession.mockReset();
  });

  it("loads the current profile by account id instead of auth user id assumptions", async () => {
    const fixture = {
      session: {
        ...viewerFixture.session,
        user: { ...viewerFixture.session.user, id: "auth-user-1" },
      },
      profile: {
        ...viewerFixture.profile,
        id: "account-1",
      },
    };

    const { result } = renderHook(() => useProfile(), {
      wrapper: createAuthTestWrapper(fixture),
    });

    await waitFor(() => {
      expect(result.current.profile?.id).toBe("account-1");
    });

    expect(mockRpc).toHaveBeenCalledWith("get_current_account_context");
    expect(mockEq).toHaveBeenCalledWith("id", "account-1");
  });

  it("marks the signed-in owner as editable", async () => {
    const { result } = renderHook(() => useProfile(), {
      wrapper: createAuthTestWrapper(ownerFixture),
    });

    await waitFor(() => expect(result.current.isOwner).toBe(true));
  });

  it("returns the public profile settings on the signed-in profile", async () => {
    const { result } = renderHook(() => useProfile(), {
      wrapper: createAuthTestWrapper(viewerFixture),
    });

    await waitFor(() => {
      expect(result.current.profile?.username).toBeNull();
      expect(result.current.profile?.is_profile_public).toBe(false);
      expect(result.current.profile?.is_collection_public).toBe(false);
      expect(result.current.profile?.is_saved_public).toBe(false);
    });
  });

  it("marks unauthenticated users as not editable", async () => {
    const { result } = renderHook(() => useProfile(), {
      wrapper: createAuthTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isOwner).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
