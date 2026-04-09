import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockRpc = vi.fn();
const mockFrom = vi.fn();
const mockSupabase = { rpc: mockRpc, from: mockFrom };

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

import { usePublicLibraryQuery } from "./usePublicLibraryQuery";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { Wrapper };
}

describe("usePublicLibraryQuery", () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockFrom.mockReset();
  });

  it("requests the saved public library surface without translating it to wishlist", async () => {
    mockRpc.mockResolvedValue({
      data: [],
      error: null,
    });

    const { Wrapper } = makeWrapper();
    renderHook(() => usePublicLibraryQuery("alice", "saved"), { wrapper: Wrapper });

    await waitFor(() =>
      expect(mockRpc).toHaveBeenCalledWith("get_public_library", {
        p_username: "alice",
        p_list_type: "saved",
      }),
    );
  });

  it("filters hidden games from public-library results", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          profile_id: "user-1",
          username: "alice",
          library_entry_id: "entry-visible",
          game_id: "game-visible",
          game_name: "Visible Game",
          game_slug: "visible-game",
          bgg_id: null,
          bgg_url: null,
          bgg_rating: null,
          bgg_weight: null,
          players_min: null,
          players_max: null,
          play_time_min: null,
          play_time_max: null,
          category: null,
          summary: null,
          is_expansion_included: false,
          image_url: null,
          published_year: null,
          saved_at: "2026-04-09T00:00:00Z",
          hidden: false,
        },
        {
          profile_id: "user-1",
          username: "alice",
          library_entry_id: "entry-hidden",
          game_id: "game-hidden",
          game_name: "Hidden Game",
          game_slug: "hidden-game",
          bgg_id: null,
          bgg_url: null,
          bgg_rating: null,
          bgg_weight: null,
          players_min: null,
          players_max: null,
          play_time_min: null,
          play_time_max: null,
          category: null,
          summary: null,
          is_expansion_included: false,
          image_url: null,
          published_year: null,
          saved_at: "2026-04-09T00:00:00Z",
          hidden: true,
        },
      ],
      error: null,
    });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => usePublicLibraryQuery("alice", "saved"), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.data?.entries).toHaveLength(1);
      expect(result.current.data?.entries[0]?.game.name).toBe("Visible Game");
    });
  });
});
