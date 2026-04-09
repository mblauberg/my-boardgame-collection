import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

vi.mock("../../lib/supabase/runtimeErrors", () => ({
  shouldRetrySupabaseQuery: () => false,
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
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: new Error("Game not found"),
    });
    const hiddenEq = vi.fn().mockReturnValue({ single });
    const slugEq = vi.fn().mockReturnValue({ eq: hiddenEq });

    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: slugEq,
        }),
      });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useGameDetailQuery("hidden-game"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect((result.current.error as Error).message).toMatch(/game not found/i);
    });

    expect(slugEq).toHaveBeenCalledWith("slug", "hidden-game");
    expect(hiddenEq).toHaveBeenCalledWith("hidden", false);
  });
});
