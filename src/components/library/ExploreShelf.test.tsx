import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/testUtils";
import { ExploreShelf } from "./ExploreShelf";
import type { Game } from "../../types/domain";
import type { LibraryEntry } from "../../features/library/library.types";

const profileState = vi.hoisted(() => ({
  profile: { id: "user-1" },
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
    userId: "user-1",
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

describe("ExploreShelf", () => {
  beforeEach(() => {
    profileState.profile = { id: "user-1" };
    profileState.isAuthenticated = true;
    libraryQueryState.data = [];
    upsertMutationState.mutate = vi.fn();
    upsertMutationState.isPending = false;
    deleteMutationState.mutate = vi.fn();
    deleteMutationState.isPending = false;
  });

  it("renders a saved quick action for each explore game", async () => {
    renderWithProviders(
      <ExploreShelf title="Trending now" entries={[gameFixture]} />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saved/i })).toHaveAttribute("aria-pressed", "false");
    });
  });

  it("upserts saved state from explore while preserving other library state", async () => {
    const user = userEvent.setup();
    libraryQueryState.data = [
      createEntry({
        isSaved: false,
        isLoved: true,
        isInCollection: false,
        sentiment: "like",
        notes: "Race night staple",
      }),
    ];

    renderWithProviders(
      <ExploreShelf title="Trending now" entries={[gameFixture]} />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saved/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /saved/i }));

    expect(upsertMutationState.mutate).toHaveBeenCalledWith({
      userId: "user-1",
      gameId: gameFixture.id,
      isSaved: true,
      isLoved: true,
      isInCollection: false,
      sentiment: "like",
      notes: "Race night staple",
    });
    expect(deleteMutationState.mutate).not.toHaveBeenCalled();
  });

  it("deletes the library entry when saved is toggled off and no state remains", async () => {
    const user = userEvent.setup();
    libraryQueryState.data = [
      createEntry({
        isSaved: true,
      }),
    ];

    renderWithProviders(
      <ExploreShelf title="Trending now" entries={[gameFixture]} />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saved/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /saved/i }));

    expect(deleteMutationState.mutate).toHaveBeenCalledWith({
      id: "entry-1",
      userId: "user-1",
    });
    expect(upsertMutationState.mutate).not.toHaveBeenCalled();
  });

  it("shows in-collection badge instead of saved action when game is in collection", async () => {
    libraryQueryState.data = [
      createEntry({
        isSaved: false,
        isInCollection: true,
      }),
    ];

    renderWithProviders(
      <ExploreShelf title="Trending now" entries={[gameFixture]} />
    );

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /saved/i })).not.toBeInTheDocument();
      expect(screen.getByText("In Collection")).toBeInTheDocument();
    });
  });
});
