import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createElement } from "react";
import { gamesKeys } from "./gamesKeys";

const mockGetSession = vi.fn();
const requestBggRefresh = vi.fn();

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

vi.mock("./bggApi", () => ({
  requestBggRefresh: (...args: unknown[]) => requestBggRefresh(...args),
}));

import { useBggRefreshMutation } from "./useBggRefreshMutation";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return { queryClient, Wrapper };
}

describe("useBggRefreshMutation", () => {
  it("uses the current session token and invalidates cached game queries on success", async () => {
    const { queryClient, Wrapper } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: "owner-token",
        },
      },
      error: null,
    });

    requestBggRefresh.mockResolvedValue({
      metadata: {
        bgg_id: 174430,
        bgg_url: "https://boardgamegeek.com/boardgame/174430",
        bgg_rating: 8.2,
        bgg_weight: 2.4,
        published_year: 2015,
      },
    });

    const { result } = renderHook(() => useBggRefreshMutation(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ gameId: "game-1" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(requestBggRefresh).toHaveBeenCalledWith({
      accessToken: "owner-token",
      gameId: "game-1",
    });
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: gamesKeys.lists() }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: gamesKeys.details() }),
    );
  });
});
