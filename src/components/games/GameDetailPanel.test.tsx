import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameDetailPanel } from "./GameDetailPanel";
import type { Game } from "../../types/domain";
import type { LibraryEntry } from "../../features/library/library.types";

const profileState = vi.hoisted(() => ({
  profile: null as { id: string } | null,
  isOwner: true,
  isAuthenticated: false,
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

  beforeEach(() => {
    profileState.profile = null;
    profileState.isAuthenticated = false;
    libraryQueryState.data = [];
    upsertMutationState.mutate = vi.fn();
    upsertMutationState.isPending = false;
    deleteMutationState.mutate = vi.fn();
    deleteMutationState.isPending = false;
  });

  it("renders public metadata and the BGG link for a game", () => {
    render(<GameDetailPanel game={gameFixture} />);

    expect(screen.getByAltText("Heat")).toBeInTheDocument();
    expect(screen.getByText("Published: 2022")).toBeInTheDocument();
    expect(screen.getByText("8.1")).toBeInTheDocument();
    expect(screen.queryByText("Great game for groups")).not.toBeInTheDocument();

    const bggLink = screen.getByRole("link", { name: /boardgamegeek/i });
    expect(bggLink).toHaveAttribute("href", gameFixture.bggUrl);
  });

  it("pulls the hero image under the transparent overlay header host", () => {
    render(<GameDetailPanel game={gameFixture} />);

    const image = screen.getByAltText("Heat");
    const imageWrap = image.closest("div");
    expect(imageWrap).toHaveClass("-mt-16", "md:-mt-20", "sm:-mt-24");
  });

  it("renders tags", () => {
    render(<GameDetailPanel game={gameFixture} />);
    expect(screen.getByText("Racing")).toBeInTheDocument();
  });

  it("renders summary without private note sections", () => {
    render(<GameDetailPanel game={gameFixture} />);
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("A racing game about heat management")).toBeInTheDocument();
    expect(screen.queryByText("Notes")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Heat" })).not.toBeInTheDocument();
  });

  it("renders snapshot rank metadata and provenance details", () => {
    render(<GameDetailPanel game={gameFixture} />);

    expect(screen.getByText(/overall rank/i)).toBeInTheDocument();
    expect(screen.getByText("#32")).toBeInTheDocument();
    expect(screen.getByText(/bayesian average/i)).toBeInTheDocument();
    expect(screen.getByText(/local bgg snapshot/i)).toBeInTheDocument();
    expect(screen.getByText(/updated 9 apr 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/strategy rank/i)).toBeInTheDocument();
  });

  it("renders library actions for authenticated users and preserves existing state on toggle", async () => {
    const user = userEvent.setup();
    profileState.profile = { id: "user-1" };
    profileState.isAuthenticated = true;
    libraryQueryState.data = [
      createEntry({
        isSaved: true,
        isLoved: false,
        isInCollection: true,
        sentiment: "like",
        notes: "Great with six players",
      }),
    ];

    render(<GameDetailPanel game={gameFixture} />);

    const lovedButton = screen.getByRole("button", { name: /loved/i });
    expect(screen.getByRole("button", { name: /saved/i })).toHaveAttribute("aria-pressed", "true");
    expect(lovedButton).toHaveAttribute("aria-pressed", "false");

    await user.click(lovedButton);

    expect(upsertMutationState.mutate).toHaveBeenCalledWith({
      userId: "user-1",
      gameId: gameFixture.id,
      isSaved: true,
      isLoved: true,
      isInCollection: true,
      sentiment: "like",
      notes: "Great with six players",
    });
    expect(deleteMutationState.mutate).not.toHaveBeenCalled();
  });

  it("deletes the entry when the last active library state is removed", async () => {
    const user = userEvent.setup();
    profileState.profile = { id: "user-1" };
    profileState.isAuthenticated = true;
    libraryQueryState.data = [
      createEntry({
        isLoved: true,
      }),
    ];

    render(<GameDetailPanel game={gameFixture} />);

    await user.click(screen.getByRole("button", { name: /loved/i }));

    expect(deleteMutationState.mutate).toHaveBeenCalledWith({
      id: "entry-1",
      userId: "user-1",
    });
    expect(upsertMutationState.mutate).not.toHaveBeenCalled();
  });
});
