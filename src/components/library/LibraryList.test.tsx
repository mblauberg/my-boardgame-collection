import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { LibraryList } from "./LibraryList";
import type { LibraryEntry } from "../../features/library/library.types";
import { renderWithProviders } from "../../test/testUtils";

const libraryStateActions = vi.hoisted(() => ({
  toggleLoved: vi.fn(),
  moveToCollection: vi.fn(),
  isPending: false,
}));

vi.mock("../../features/library/useLibraryStateActions", () => ({
  useLibraryStateActions: () => libraryStateActions,
}));

function createEntry(overrides: Partial<LibraryEntry> = {}): LibraryEntry {
  return {
    id: "entry-1",
    accountId: "user-1",
    gameId: "game-1",
    isSaved: false,
    isLoved: false,
    isInCollection: false,
    listType: "saved",
    sentiment: null,
    notes: null,
    priority: null,
    game: {
      id: "game-1",
      name: "Heat",
      slug: "heat",
      bggId: null,
      bggUrl: null,
      status: "archived",
      buyPriority: null,
      bggRating: 7.9,
      bggWeight: 2.1,
      playersMin: 1,
      playersMax: 6,
      playTimeMin: 30,
      playTimeMax: 60,
      category: null,
      summary: "Race to the finish line.",
      notes: null,
      recommendationVerdict: null,
      recommendationColour: null,
      gapReason: null,
      isExpansionIncluded: false,
      imageUrl: null,
      publishedYear: 2023,
      hidden: false,
      createdAt: "",
      updatedAt: "",
      tags: [],
    },
    sharedTags: [],
    userTags: [],
    ...overrides,
  };
}

function LocationStateProbe() {
  const location = useLocation();
  return <pre>{JSON.stringify(location.state)}</pre>;
}

describe("LibraryList", () => {
  beforeEach(() => {
    libraryStateActions.toggleLoved.mockReset();
    libraryStateActions.moveToCollection.mockReset();
    libraryStateActions.isPending = false;
  });

  it.each([
    ["collection", "Your collection is empty."],
    ["saved", "Your saved games list is empty."],
  ] as const)(
    "shows an explore-first empty state when the %s library has no games",
    (cardContext, expectedMessage) => {
      renderWithProviders(<LibraryList entries={[]} totalCount={0} cardContext={cardContext} />);

      expect(screen.getByText(expectedMessage)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /explore page/i })).toHaveAttribute("href", "/explore");
      expect(screen.queryByText(/no games found matching your filters/i)).not.toBeInTheDocument();
    },
  );

  it("keeps the filter-specific empty state when filters hide existing games", () => {
    renderWithProviders(<LibraryList entries={[]} totalCount={3} cardContext="collection" />);

    expect(screen.getByText(/no games found matching your filters/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /explore page/i })).not.toBeInTheDocument();
  });

  it("renders saved items with a saved badge outside of a page-specific card context", () => {
    renderWithProviders(<LibraryList entries={[createEntry({ isSaved: true })]} />);

    expect(screen.getByRole("link", { name: /heat/i })).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /move to collection/i })).not.toBeInTheDocument();
  });

  it("delegates the saved-page move action through the shared library state hook", async () => {
    const user = userEvent.setup();
    const entry = createEntry({ isSaved: true });

    renderWithProviders(
      <LibraryList entries={[entry]} cardContext="saved" getGameLinkState={() => ({ from: "/saved" })} />,
      "/saved",
    );

    await user.click(screen.getByRole("button", { name: /move to collection/i }));

    expect(libraryStateActions.moveToCollection).toHaveBeenCalledWith(entry.game, entry);
  });

  it("passes route state through game links when provided", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route
          path="/saved"
          element={
            <LibraryList
              entries={[createEntry({ isInCollection: true })]}
              getGameLinkState={() => ({ surface: "saved" })}
            />
          }
        />
        <Route path="/game/:slug" element={<LocationStateProbe />} />
      </Routes>,
      "/saved",
    );

    await user.click(screen.getByRole("link", { name: /heat/i }));

    expect(screen.getByText(/"from":"\/saved"/i)).toBeInTheDocument();
    expect(screen.getByText(/"surface":"saved"/i)).toBeInTheDocument();
    expect(screen.getByText(/"backgroundLocation"/i)).toBeInTheDocument();
  });

  it("renders local-only guest imports without a game-detail link", () => {
    renderWithProviders(
      <LibraryList
        entries={[
          createEntry({
            id: "guest-entry",
            accountId: "__guest__",
            gameId: "guest-bgg:999",
            game: {
              ...createEntry().game,
              id: "guest-bgg:999",
              name: "Everdell",
              slug: "everdell-guest-bgg-999",
              bggId: 999,
            },
          }),
        ]}
      />,
    );

    expect(screen.queryByRole("link", { name: /everdell/i })).not.toBeInTheDocument();
    expect(screen.getByText("Everdell")).toBeInTheDocument();
  });
});
