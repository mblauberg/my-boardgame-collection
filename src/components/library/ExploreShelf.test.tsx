import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExploreShelf } from "./ExploreShelf";
import type { Game } from "../../types/domain";
import type { LibraryEntry } from "../../features/library/library.types";
import { renderWithProviders } from "../../test/testUtils";

const libraryQueryState = vi.hoisted(() => ({
  data: [] as LibraryEntry[],
}));

const libraryStateActions = vi.hoisted(() => ({
  toggleSaved: vi.fn(),
  isPending: false,
}));

vi.mock("../../features/library/useLibraryQuery", () => ({
  useLibraryQuery: () => libraryQueryState,
}));

vi.mock("../../features/library/useLibraryStateActions", () => ({
  useLibraryStateActions: () => libraryStateActions,
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
    accountId: "account-1",
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
    libraryQueryState.data = [];
    libraryStateActions.toggleSaved.mockReset();
    libraryStateActions.isPending = false;
  });

  it("renders a saved quick action for explore games that are not in the collection", () => {
    renderWithProviders(<ExploreShelf title="Trending now" entries={[gameFixture]} />);

    expect(screen.getByRole("button", { name: /saved/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("delegates saved toggles through the shared library state hook", async () => {
    const user = userEvent.setup();
    const entry = createEntry({ isSaved: true });
    libraryQueryState.data = [entry];

    renderWithProviders(<ExploreShelf title="Trending now" entries={[gameFixture]} />);

    await user.click(screen.getByRole("button", { name: /saved/i }));

    expect(libraryStateActions.toggleSaved).toHaveBeenCalledWith(gameFixture, entry);
  });

  it("shows an in-collection badge when the game already belongs to the collection", () => {
    libraryQueryState.data = [createEntry({ isInCollection: true })];

    renderWithProviders(<ExploreShelf title="Trending now" entries={[gameFixture]} />);

    expect(screen.getByText("In Collection")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /saved/i })).not.toBeInTheDocument();
  });
});
