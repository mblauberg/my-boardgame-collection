import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Game } from "../../types/domain";
import type { LibraryEntry } from "./library.types";

const accountState = vi.hoisted(() => ({
  account: null as { id: string } | null,
  isAuthenticated: false,
  isLoading: false,
}));

const upsertMutationState = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}));

const deleteMutationState = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}));

const guestStorageState = vi.hoisted(() => ({
  upsertGuestLibraryEntry: vi.fn(),
  removeGuestLibraryEntry: vi.fn(),
}));

vi.mock("../accounts/useAccount", () => ({
  useAccount: () => ({
    account: accountState.account,
    isAuthenticated: accountState.isAuthenticated,
    isLoading: accountState.isLoading,
    error: null,
  }),
}));

vi.mock("./useLibraryEntryMutations", () => ({
  useUpsertLibraryState: () => upsertMutationState,
  useDeleteLibraryEntry: () => deleteMutationState,
}));

vi.mock("./guestLibraryStorage", () => ({
  GUEST_LIBRARY_USER_ID: "__guest__",
  upsertGuestLibraryEntry: guestStorageState.upsertGuestLibraryEntry,
  removeGuestLibraryEntry: guestStorageState.removeGuestLibraryEntry,
}));

import { useLibraryStateActions } from "./useLibraryStateActions";

const gameFixture: Game = {
  id: "game-1",
  name: "Heat",
  slug: "heat",
  bggId: 366013,
  bggUrl: "https://boardgamegeek.com/boardgame/366013/heat",
  status: "archived",
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

function createEntry(overrides: Partial<LibraryEntry> = {}): LibraryEntry {
  return {
    id: "entry-1",
    accountId: "account-1",
    gameId: gameFixture.id,
    isSaved: false,
    isLoved: false,
    isInCollection: false,
    listType: "saved",
    sentiment: "like",
    notes: "Guest note",
    priority: null,
    game: gameFixture,
    sharedTags: [],
    userTags: [],
    ...overrides,
  };
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return Wrapper;
}

describe("useLibraryStateActions", () => {
  beforeEach(() => {
    accountState.account = null;
    accountState.isAuthenticated = false;
    accountState.isLoading = false;
    upsertMutationState.mutate.mockReset();
    deleteMutationState.mutate.mockReset();
    guestStorageState.upsertGuestLibraryEntry.mockReset();
    guestStorageState.removeGuestLibraryEntry.mockReset();
  });

  it("moves authenticated collection entries into saved without leaving both states active", () => {
    accountState.account = { id: "account-1" };
    accountState.isAuthenticated = true;
    const entry = createEntry({ isSaved: false, isInCollection: true });

    const { result } = renderHook(() => useLibraryStateActions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.toggleSaved(gameFixture, entry);
    });

    expect(upsertMutationState.mutate).toHaveBeenCalledWith({
      accountId: "account-1",
      gameId: gameFixture.id,
      isSaved: true,
      isLoved: false,
      isInCollection: false,
      sentiment: "like",
      notes: "Guest note",
    });
  });

  it("moves authenticated saved entries into the collection", () => {
    accountState.account = { id: "account-1" };
    accountState.isAuthenticated = true;
    const entry = createEntry({ isSaved: true, isInCollection: false });

    const { result } = renderHook(() => useLibraryStateActions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.toggleCollection(gameFixture, entry);
    });

    expect(upsertMutationState.mutate).toHaveBeenCalledWith({
      accountId: "account-1",
      gameId: gameFixture.id,
      isSaved: false,
      isLoved: false,
      isInCollection: true,
      sentiment: "like",
      notes: "Guest note",
    });
  });

  it("deletes the entry when the final active state is removed", () => {
    accountState.account = { id: "account-1" };
    accountState.isAuthenticated = true;
    const entry = createEntry({ isLoved: true, sentiment: null, notes: null });

    const { result } = renderHook(() => useLibraryStateActions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.toggleLoved(gameFixture, entry);
    });

    expect(deleteMutationState.mutate).toHaveBeenCalledWith({
      id: "entry-1",
      accountId: "account-1",
    });
  });

  it("writes normalized guest state changes to local storage", () => {
    const entry = createEntry({
      accountId: "__guest__",
      isSaved: true,
      isInCollection: false,
      isLoved: true,
    });

    const { result } = renderHook(() => useLibraryStateActions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.moveToCollection(gameFixture, entry);
    });

    expect(guestStorageState.upsertGuestLibraryEntry).toHaveBeenCalledWith({
      game: gameFixture,
      isSaved: false,
      isLoved: true,
      isInCollection: true,
      sentiment: "like",
      notes: "Guest note",
    });
  });
});
