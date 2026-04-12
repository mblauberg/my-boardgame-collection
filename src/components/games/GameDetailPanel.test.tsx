import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameDetailPanel } from "./GameDetailPanel";
import type { Game } from "../../types/domain";
import type { LibraryEntry } from "../../features/library/library.types";
import { renderWithProviders } from "../../test/testUtils";

const libraryQueryState = vi.hoisted(() => ({
  data: [] as LibraryEntry[],
  isLoading: false,
}));

const libraryStateActions = vi.hoisted(() => ({
  toggleSaved: vi.fn(),
  toggleLoved: vi.fn(),
  toggleCollection: vi.fn(),
  isPending: false,
}));

vi.mock("../../features/library/useLibraryQuery", () => ({
  useLibraryQuery: () => libraryQueryState,
}));

vi.mock("../../features/library/useLibraryStateActions", () => ({
  useLibraryStateActions: () => libraryStateActions,
}));

describe("GameDetailPanel", () => {
  const gameFixture: Game = {
    id: "1",
    name: "Heat",
    slug: "heat",
    bggId: 366013,
    bggUrl: "https://boardgamegeek.com/boardgame/366013/heat",
    status: "owned",
    buyPriority: null,
    bggRating: 8.1,
    bggWeight: 2.5,
    bggRank: 32,
    bggBayesAverage: 7.9,
    bggUsersRated: 52311,
    isExpansion: false,
    abstractsRank: null,
    cgsRank: null,
    childrensGamesRank: null,
    familyGamesRank: null,
    partyGamesRank: null,
    strategyGamesRank: 58,
    thematicRank: null,
    wargamesRank: null,
    bggDataSource: "bgg_csv",
    bggDataUpdatedAt: "2026-04-09T00:00:00.000Z",
    bggSnapshotPayload: { rank: "32" },
    playersMin: 1,
    playersMax: 6,
    playTimeMin: 30,
    playTimeMax: 60,
    category: "Racing",
    summary: "A racing game about heat management",
    notes: "Great game for groups",
    recommendationVerdict: null,
    recommendationColour: null,
    gapReason: null,
    isExpansionIncluded: false,
    imageUrl: "https://example.com/heat.jpg",
    publishedYear: 2022,
    hidden: false,
    createdAt: "",
    updatedAt: "",
    tags: [
      { id: "t1", name: "Racing", slug: "racing", tagType: "theme", colour: "#ff0000" },
    ],
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

  beforeEach(() => {
    libraryQueryState.data = [];
    libraryStateActions.toggleSaved.mockReset();
    libraryStateActions.toggleLoved.mockReset();
    libraryStateActions.toggleCollection.mockReset();
    libraryStateActions.isPending = false;
  });

  it("renders public metadata and the BGG link for a game", () => {
    renderWithProviders(<GameDetailPanel game={gameFixture} />);

    expect(screen.getByRole("img", { name: "Heat" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Heat" }).closest('[data-motion-id="game-card-image-heat"]')).toBeInTheDocument();
    expect(screen.getByText("Published: 2022")).toBeInTheDocument();
    expect(screen.getByText("8.1")).toBeInTheDocument();
    expect(screen.queryByText("Great game for groups")).not.toBeInTheDocument();

    const bggLink = screen.getByRole("link", { name: /view on boardgamegeek/i });
    expect(bggLink).toHaveAttribute("href", gameFixture.bggUrl);
  });

  it("renders tags and summary", () => {
    renderWithProviders(<GameDetailPanel game={gameFixture} />);

    expect(screen.getByText("Racing")).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("A racing game about heat management")).toBeInTheDocument();
  });

  it("skips the snapshot updated label when the backend timestamp is invalid", () => {
    const malformedGame = {
      ...gameFixture,
      bggDataUpdatedAt: "not-a-date",
    } as Game;

    renderWithProviders(<GameDetailPanel game={malformedGame} />);

    expect(screen.getByText(/local bgg snapshot/i)).toBeInTheDocument();
    expect(screen.queryByText(/updated/i)).not.toBeInTheDocument();
  });

  it("delegates library action clicks through the shared library state hook", async () => {
    const user = userEvent.setup();
    const entry = createEntry({
      isSaved: true,
      isLoved: true,
      isInCollection: false,
    });
    libraryQueryState.data = [entry];

    renderWithProviders(<GameDetailPanel game={gameFixture} />);

    await user.click(screen.getByRole("button", { name: /saved/i }));
    await user.click(screen.getByRole("button", { name: /loved/i }));
    await user.click(screen.getByRole("button", { name: /in collection/i }));

    expect(libraryStateActions.toggleSaved).toHaveBeenCalledWith(gameFixture, entry);
    expect(libraryStateActions.toggleLoved).toHaveBeenCalledWith(gameFixture, entry);
    expect(libraryStateActions.toggleCollection).toHaveBeenCalledWith(gameFixture, entry);
  });
});
