import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Game } from "../../types/domain";
import { upsertGuestLibraryEntry, readGuestLibraryEntries } from "./guestLibraryStorage";

const sessionState = vi.hoisted(() => ({
  account: null as { id: string } | null,
  isAuthenticated: false,
}));

const upsertSpy = vi.fn();
const mockSupabase = {
  from: vi.fn(() => ({
    upsert: upsertSpy,
  })),
};

vi.mock("../accounts/useAccount", () => ({
  useAccount: () => ({
    account: sessionState.account,
    isAuthenticated: sessionState.isAuthenticated,
    isLoading: false,
    error: null,
  }),
}));

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => mockSupabase,
}));

import { useGuestLibrarySync } from "./useGuestLibrarySync";

const gameFixture: Game = {
  id: "game-1",
  name: "Heat",
  slug: "heat",
  bggId: 366013,
  bggUrl: "https://boardgamegeek.com/boardgame/366013/heat",
  status: "owned",
  buyPriority: null,
  bggRating: 8.1,
  bggWeight: 2.5,
  playersMin: 1,
  playersMax: 6,
  playTimeMin: 30,
  playTimeMax: 60,
  category: "Racing",
  summary: "A racing game about heat management",
  notes: null,
  recommendationVerdict: null,
  recommendationColour: null,
  gapReason: null,
  isExpansionIncluded: false,
  imageUrl: "https://example.com/heat.jpg",
  publishedYear: 2022,
  hidden: false,
  createdAt: "",
  updatedAt: "",
  tags: [],
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { Wrapper };
}

describe("useGuestLibrarySync", () => {
  beforeEach(() => {
    sessionState.account = null;
    sessionState.isAuthenticated = false;
    upsertSpy.mockReset();
    mockSupabase.from.mockClear();
    localStorage.clear();
  });

  it("syncs guest entries to Supabase after login and clears guest storage", async () => {
    upsertGuestLibraryEntry({
      game: gameFixture,
      isSaved: true,
      isLoved: false,
      isInCollection: false,
      sentiment: null,
      notes: "Guest note",
    });

    upsertSpy.mockResolvedValue({
      data: { id: "entry-1" },
      error: null,
    });

    sessionState.account = { id: "account-1" };
    sessionState.isAuthenticated = true;

    const { Wrapper } = makeWrapper();
    renderHook(() => useGuestLibrarySync(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          account_id: "account-1",
          game_id: gameFixture.id,
          is_saved: true,
          is_loved: false,
          is_in_collection: false,
          notes: "Guest note",
        }),
        expect.objectContaining({ onConflict: "account_id,game_id" }),
      ),
    );

    await waitFor(() => expect(readGuestLibraryEntries()).toHaveLength(0));
  });
});
