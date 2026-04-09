import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

const searchBggGames = vi.fn();

vi.mock("./bggApi", () => ({
  searchBggGames: (...args: unknown[]) => searchBggGames(...args),
}));

import { useBggSearchQuery } from "./useBggSearchQuery";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return { Wrapper };
}

describe("useBggSearchQuery", () => {
  it("searches BGG when the query is long enough", async () => {
    searchBggGames.mockResolvedValue({
      results: [{ id: 123, name: "Heat", yearPublished: 2023 }],
      source: {
        kind: "api",
        label: "Live BGG",
        updatedAt: null,
      },
    });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useBggSearchQuery("Heat"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(searchBggGames).toHaveBeenCalledWith("Heat");
    expect(result.current.data).toEqual({
      results: [{ id: 123, name: "Heat", yearPublished: 2023 }],
      source: {
        kind: "api",
        label: "Live BGG",
        updatedAt: null,
      },
    });
  });
});
