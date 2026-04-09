import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "./auth.types";

// Mock the Supabase client at the top level
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
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
import { useProfile } from "./useProfile";

// Test fixtures
const ownerFixture: { session: Session; profile: Profile } = {
  session: {
    access_token: "mock-token",
    refresh_token: "mock-refresh",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: "owner-user-id",
      email: "owner@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    },
  } as Session,
  profile: {
    id: "owner-user-id",
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
      id: "viewer-user-id",
      email: "viewer@example.com",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    },
  } as Session,
  profile: {
    id: "viewer-user-id",
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

  // Configure the mocks for this specific test
  mockSupabase.auth.getSession.mockResolvedValue({
    data: { session: fixture?.session ?? null },
    error: null,
  });

  mockSupabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: fixture?.profile ?? null,
          error: fixture ? null : { message: "Not found" },
        }),
      }),
    }),
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useProfile", () => {
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

  it("marks the signed-in viewer as not editable", async () => {
    const { result } = renderHook(() => useProfile(), {
      wrapper: createAuthTestWrapper(viewerFixture),
    });

    await waitFor(() => expect(result.current.isOwner).toBe(false));
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
