import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { gamesKeys } from "./gamesKeys";
import { libraryKeys } from "../library/libraryKeys";

// Mock Supabase
const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

// Import after mocking
import { useUpdateGame, useCreateGame } from "./useGameMutations";

const gameRowFixture = {
  id: "game-1",
  name: "Heat",
  slug: "heat",
  bgg_id: 366013,
  bgg_url: null,
  status: "owned" as const,
  buy_priority: null,
  bgg_rating: 8.1,
  bgg_weight: 2.5,
  players_min: 1,
  players_max: 6,
  play_time_min: 30,
  play_time_max: 60,
  category: "Racing",
  summary: null,
  notes: null,
  recommendation_verdict: null,
  recommendation_colour: null,
  gap_reason: null,
  is_expansion_included: false,
  image_url: null,
  published_year: 2022,
  hidden: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { queryClient, Wrapper };
}

describe("useUpdateGame", () => {
  it("invalidates the games list query after a successful update", async () => {
    const { queryClient, Wrapper } = makeWrapper();

    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: gameRowFixture, error: null }),
          }),
        }),
      }),
    });

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateGame(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "game-1", name: "Heat Updated" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: gamesKeys.lists() }),
    );
  });

  it("returns the saved row shape on success", async () => {
    const { Wrapper } = makeWrapper();

    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: gameRowFixture, error: null }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useUpdateGame(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "game-1", name: "Heat" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({ id: "game-1", name: "Heat" });
  });

  it("invalidates library-backed card queries after a successful update", async () => {
    const { queryClient, Wrapper } = makeWrapper();

    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: gameRowFixture, error: null }),
          }),
        }),
      }),
    });

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateGame(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "game-1", summary: "Updated summary" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: libraryKeys.all }),
    );
  });
});

describe("useCreateGame", () => {
  it("invalidates the games list query after a successful create", async () => {
    const { queryClient, Wrapper } = makeWrapper();

    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: gameRowFixture, error: null }),
        }),
      }),
    });

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateGame(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ name: "Heat", slug: "heat", status: "owned" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: gamesKeys.lists() }),
    );
  });
});

describe("useUpdateGame - buy order mutations", () => {
  it("saves buyPriority updates", async () => {
    const { Wrapper } = makeWrapper();

    const updateSpy = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { ...gameRowFixture, buy_priority: 5 }, error: null }),
        }),
      }),
    });

    mockFrom.mockReturnValue({ update: updateSpy });

    const { result } = renderHook(() => useUpdateGame(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "game-1", buyPriority: 5 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ buy_priority: 5 }));
  });

  it("converts buy to owned", async () => {
    const { Wrapper } = makeWrapper();

    const updateSpy = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { ...gameRowFixture, status: "owned" }, error: null }),
        }),
      }),
    });

    mockFrom.mockReturnValue({ update: updateSpy });

    const { result } = renderHook(() => useUpdateGame(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "game-1", status: "owned" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ status: "owned" }));
  });

  it("converts buy to cut", async () => {
    const { Wrapper } = makeWrapper();

    const updateSpy = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { ...gameRowFixture, status: "cut" }, error: null }),
        }),
      }),
    });

    mockFrom.mockReturnValue({ update: updateSpy });

    const { result } = renderHook(() => useUpdateGame(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "game-1", status: "cut" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ status: "cut" }));
  });
});

describe("useUpdateGame – recommendation fields", () => {
  it("persists recommendationVerdict and recommendationColour", async () => {
    const { Wrapper } = makeWrapper();

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: gameRowFixture, error: null }),
        }),
      }),
    });
    mockFrom.mockReturnValue({ update: updateMock });

    const { result } = renderHook(() => useUpdateGame(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        id: "game-1",
        recommendationVerdict: "Strong fit",
        recommendationColour: "#22c55e",
        gapReason: "Fills co-op gap",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        recommendation_verdict: "Strong fit",
        recommendation_colour: "#22c55e",
        gap_reason: "Fills co-op gap",
      }),
    );
  });

  it("promotes new_rec to buy by updating status", async () => {
    const { Wrapper } = makeWrapper();

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...gameRowFixture, status: "buy" },
            error: null,
          }),
        }),
      }),
    });
    mockFrom.mockReturnValue({ update: updateMock });

    const { result } = renderHook(() => useUpdateGame(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "game-1", status: "buy" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ status: "buy" }));
  });

  it("promotes new_rec to owned by updating status", async () => {
    const { Wrapper } = makeWrapper();

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...gameRowFixture, status: "owned" },
            error: null,
          }),
        }),
      }),
    });
    mockFrom.mockReturnValue({ update: updateMock });

    const { result } = renderHook(() => useUpdateGame(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "game-1", status: "owned" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ status: "owned" }));
  });
});
