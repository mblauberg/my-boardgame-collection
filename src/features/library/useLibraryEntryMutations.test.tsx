import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockFrom = vi.fn();
const mockRpc = vi.fn();
const mockSupabase = { from: mockFrom, rpc: mockRpc };

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

import { useSaveBggGameToLibrary, useUpsertLibraryState } from "./useLibraryEntryMutations";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { queryClient, Wrapper };
}

describe("useUpsertLibraryState", () => {
  it("normalizes saved and collection state before upserting", async () => {
    const upsertSpy = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: "entry-1",
            account_id: "account-1",
            game_id: "game-1",
            is_saved: true,
            is_loved: false,
            is_in_collection: true,
            sentiment: null,
            notes: "Race night shelf",
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
    const { result } = renderHook(() => useUpsertLibraryState(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        accountId: "account-1",
        gameId: "game-1",
        isSaved: true,
        isLoved: false,
        isInCollection: true,
        notes: "Race night shelf",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: "account-1",
        game_id: "game-1",
        is_saved: false,
        is_loved: false,
        is_in_collection: true,
        sentiment: null,
        notes: "Race night shelf",
      }),
      expect.objectContaining({ onConflict: "account_id,game_id" }),
    );
  });
});

describe("useSaveBggGameToLibrary", () => {
  it("calls the transactional save RPC with the independent library state payload", async () => {
    mockRpc.mockResolvedValue({
      data: {
        id: "entry-1",
        account_id: "account-1",
        game_id: "game-1",
        is_saved: true,
        is_loved: true,
        is_in_collection: false,
        sentiment: "like",
        notes: "Watch for a discount.",
        priority: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      error: null,
    });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSaveBggGameToLibrary(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        accountId: "account-1",
        selectedGame: {
          id: 123,
          name: "Heat",
          bggUrl: "https://boardgamegeek.com/boardgame/123/heat",
          imageUrl: null,
          yearPublished: 2023,
          playersMin: 1,
          playersMax: 6,
          playTimeMin: 30,
          playTimeMax: 60,
          averageRating: 7.9,
          averageWeight: 2.2,
          summary: "Race cars.",
        },
        isSaved: true,
        isLoved: true,
        isInCollection: false,
        sentiment: "like",
        notes: "Watch for a discount.",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockRpc).toHaveBeenCalledWith(
      "save_bgg_game_for_account",
      expect.objectContaining({
        p_account_id: "account-1",
        p_bgg_id: 123,
        p_name: "Heat",
        p_is_saved: true,
        p_is_loved: true,
        p_is_in_collection: false,
        p_sentiment: "like",
        p_notes: "Watch for a discount.",
      }),
    );
  });
});
