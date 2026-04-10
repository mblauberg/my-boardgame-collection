import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/testUtils";
import { HorizontalShelf } from "./HorizontalShelf";
import type { Game } from "../../types/domain";
import type { LibraryEntry } from "../../features/library/library.types";

const profileState = vi.hoisted(() => ({
  profile: { id: "user-1" } as { id: string } | null,
  isOwner: true,
  isAuthenticated: true,
  isLoading: false,
  error: null,
}));

const libraryQueryState = vi.hoisted(() => ({
  data: [] as LibraryEntry[],
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

vi.mock("../../features/auth/useProfile", () => ({
  useProfile: () => profileState,
}));

vi.mock("../../features/library/useLibraryQuery", () => ({
  useLibraryQuery: () => libraryQueryState,
}));

vi.mock("../../features/library/useLibraryEntryMutations", () => ({
  useUpsertLibraryState: () => upsertMutationState,
  useDeleteLibraryEntry: () => deleteMutationState,
}));

vi.mock("../../features/library/guestLibraryStorage", () => ({
  GUEST_LIBRARY_USER_ID: "__guest__",
  upsertGuestLibraryEntry: guestStorageState.upsertGuestLibraryEntry,
  removeGuestLibraryEntry: guestStorageState.removeGuestLibraryEntry,
}));

const gameFixture: Game = {
  id: "game-1",
  name: "Heat",
  slug: "heat",
  bggId: 366013,
  bggUrl: null,
  status: "archived",
  buyPriority: null,
  bggRating: 8.1,
  bggWeight: 2.5,
  playersMin: 1,
  playersMax: 6,
  playTimeMin: 30,
  playTimeMax: 60,
  category: "Racing",
  summary: "Push your car through the final corner.",
  notes: null,
  recommendationVerdict: null,
  recommendationColour: null,
  gapReason: null,
  isExpansionIncluded: false,
  imageUrl: null,
  publishedYear: 2022,
  hidden: false,
  createdAt: "",
  updatedAt: "",
  tags: [],
};

function createEntry(overrides: Partial<LibraryEntry> = {}): LibraryEntry {
  return {
    id: "entry-1",
    accountId: "user-1",
    gameId: gameFixture.id,
    isSaved: false,
    isLoved: false,
    isInCollection: false,
    listType: "saved",
    sentiment: null,
    notes: null,
    priority: null,
    game: gameFixture,
    sharedTags: [],
    userTags: [],
    ...overrides,
  };
}

describe("HorizontalShelf", () => {
  beforeEach(() => {
    profileState.profile = { id: "user-1" };
    profileState.isAuthenticated = true;
    libraryQueryState.data = [];
    upsertMutationState.mutate = vi.fn();
    upsertMutationState.isPending = false;
    deleteMutationState.mutate = vi.fn();
    deleteMutationState.isPending = false;
    guestStorageState.upsertGuestLibraryEntry.mockReset();
    guestStorageState.removeGuestLibraryEntry.mockReset();
  });

  it("renders saved quick actions for in-collection games", async () => {
    libraryQueryState.data = [
      createEntry({
        isSaved: false,
        isInCollection: true,
      }),
    ];

    renderWithProviders(
      <HorizontalShelf title="Quick picks" entries={[gameFixture]} />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saved/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /saved/i })).toHaveAttribute("aria-pressed", "false");
    });
  });

  it("preserves collection state when toggling saved on for in-collection games", async () => {
    const user = userEvent.setup();
    libraryQueryState.data = [
      createEntry({
        isSaved: false,
        isLoved: true,
        isInCollection: true,
        sentiment: "like",
        notes: "Great game",
      }),
    ];

    renderWithProviders(
      <HorizontalShelf title="Quick picks" entries={[gameFixture]} />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saved/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /saved/i }));

    expect(upsertMutationState.mutate).toHaveBeenCalledWith({
      accountId: "user-1",
      gameId: gameFixture.id,
      isSaved: true,
      isLoved: true,
      isInCollection: true,
      sentiment: "like",
      notes: "Great game",
    });
    expect(deleteMutationState.mutate).not.toHaveBeenCalled();
  });

  it("lets guests save from horizontal shelves using local guest storage", async () => {
    const user = userEvent.setup();
    profileState.profile = null;
    profileState.isAuthenticated = false;
    libraryQueryState.data = [
      createEntry({
        accountId: "__guest__",
        isSaved: false,
        isLoved: true,
        isInCollection: false,
        sentiment: "like",
        notes: "Guest shortlist",
      }),
    ];

    renderWithProviders(<HorizontalShelf title="Quick picks" entries={[gameFixture]} />);

    await user.click(screen.getByRole("button", { name: /saved/i }));

    expect(guestStorageState.upsertGuestLibraryEntry).toHaveBeenCalledWith({
      game: gameFixture,
      isSaved: true,
      isLoved: true,
      isInCollection: false,
      sentiment: "like",
      notes: "Guest shortlist",
    });
    expect(upsertMutationState.mutate).not.toHaveBeenCalled();
  });
});
