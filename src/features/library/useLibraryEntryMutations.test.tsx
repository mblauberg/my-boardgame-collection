import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

import { useAddToWishlist } from "./useLibraryEntryMutations";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { queryClient, Wrapper };
}

describe("useAddToWishlist", () => {
  it("upserts the expected wishlist payload", async () => {
    const upsertSpy = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: "entry-1",
            user_id: "user-1",
            game_id: "game-1",
            list_type: "wishlist",
            sentiment: null,
            notes: null,
            priority: null,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          },
          error: null,
        }),
      }),
    });

    mockFrom.mockReturnValue({ upsert: upsertSpy });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useAddToWishlist(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ userId: "user-1", gameId: "game-1" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        game_id: "game-1",
        list_type: "wishlist",
      }),
      expect.objectContaining({ onConflict: "user_id,game_id" }),
    );
  });
});
