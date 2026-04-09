import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

import { useGameDetailQuery } from "./useGameDetailQuery";

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

describe("useGameDetailQuery", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("treats hidden games as not found", async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              {
                id: "game-1",
                name: "Hidden Game",
                slug: "hidden-game",
                bgg_id: null,
                bgg_url: null,
                status: "archived",
                buy_priority: null,
                bgg_rating: null,
                bgg_weight: null,
                players_min: null,
                players_max: null,
                play_time_min: null,
                play_time_max: null,
                category: null,
                summary: null,
                notes: null,
                recommendation_verdict: null,
                recommendation_colour: null,
                gap_reason: null,
                is_expansion_included: false,
                image_url: null,
                published_year: null,
                hidden: true,
                created_at: "2026-04-09T00:00:00Z",
                updated_at: "2026-04-09T00:00:00Z",
              },
            ],
            error: null,
          }),
        }),
      });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useGameDetailQuery("hidden-game"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect((result.current.error as Error).message).toMatch(/game not found/i);
    });
  });
});
