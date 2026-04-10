import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "./auth.types";
import { ExploreSearchProvider } from "../library/ExploreSearchContext";

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  rpc: vi.fn(),
  from: vi.fn(),
};

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

// Import after mocking
// eslint-disable-next-line import/first
import { RequireOwner } from "./RequireOwner";

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

function renderWithRouter(
  initialRoute: string,
  fixture?: { session: Session; profile: Profile }
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Configure mocks
  mockSupabase.auth.getSession.mockResolvedValue({
    data: { session: fixture?.session ?? null },
    error: null,
  });

  mockSupabase.rpc.mockResolvedValue({
    data: fixture
      ? [
          {
            account_id: fixture.profile.id,
            primary_email: fixture.profile.email,
            primary_auth_user_id: fixture.session.user.id,
          },
        ]
      : [],
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

  return render(
    <QueryClientProvider client={queryClient}>
      <ExploreSearchProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/signin" element={<div>Sign In Page</div>} />
            <Route
              path="/admin"
              element={
                <RequireOwner>
                  <div>Admin Content</div>
                </RequireOwner>
              }
            />
          </Routes>
        </MemoryRouter>
      </ExploreSearchProvider>
    </QueryClientProvider>
  );
}

describe("RequireOwner", () => {
  it("redirects non-owners away from the admin route", async () => {
    renderWithRouter("/admin", viewerFixture);

    expect(await screen.findByText(/sign in/i)).toBeInTheDocument();
    expect(screen.queryByText(/admin content/i)).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users away from the admin route", async () => {
    renderWithRouter("/admin");

    expect(await screen.findByText(/sign in/i)).toBeInTheDocument();
    expect(screen.queryByText(/admin content/i)).not.toBeInTheDocument();
  });

  it("allows owners to access the admin route", async () => {
    renderWithRouter("/admin", ownerFixture);

    expect(await screen.findByText(/admin content/i)).toBeInTheDocument();
  });
});
