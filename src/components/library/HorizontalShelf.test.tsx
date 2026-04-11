import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/testUtils";
import { HorizontalShelf } from "./HorizontalShelf";
import type { Game } from "../../types/domain";
import type { LibraryEntry } from "../../features/library/library.types";

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

describe("HorizontalShelf", () => {
  beforeEach(() => {
    libraryQueryState.data = [];
    libraryStateActions.toggleSaved.mockReset();
    libraryStateActions.isPending = false;
  });

  it("shows an in-collection badge instead of a saved toggle for owned games", () => {
    libraryQueryState.data = [createEntry({ isInCollection: true })];

    renderWithProviders(<HorizontalShelf title="Quick picks" entries={[gameFixture]} />);

    expect(screen.getByText("In Collection")).toHaveClass("inline-flex", "glass-badge");
    expect(screen.queryByRole("button", { name: /saved/i })).not.toBeInTheDocument();
  });

  it("renders the saved quick action for non-collection games", async () => {
    const user = userEvent.setup();
    const entry = createEntry({ isSaved: true });
    libraryQueryState.data = [entry];

    renderWithProviders(<HorizontalShelf title="Quick picks" entries={[gameFixture]} />);

    await user.click(screen.getByRole("button", { name: /saved/i }));

    expect(libraryStateActions.toggleSaved).toHaveBeenCalledWith(gameFixture, entry);
  });
});
