import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { renderWithProviders } from "../../test/testUtils";
import { LibraryList } from "./LibraryList";
import type { LibraryEntry } from "../../features/library/library.types";

vi.mock("../../features/auth/useSession", () => ({
  useSession: () => ({ user: null }),
}));

vi.mock("../../features/library/useLibraryEntryMutations", () => ({
  useUpsertLibraryState: () => ({ mutate: vi.fn(), isPending: false }),
  useMoveSavedToCollection: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteLibraryEntry: () => ({ mutate: vi.fn(), isPending: false }),
}));

function createEntry(overrides: Partial<LibraryEntry> = {}): LibraryEntry {
  return {
    id: "entry-1",
    userId: "user-1",
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
  it("renders saved items without move-to-collection controls", () => {
    renderWithProviders(
      <LibraryList entries={[createEntry({ isSaved: true })]} />
    );

    expect(screen.getByRole("link", { name: /heat/i })).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /move to collection/i })).not.toBeInTheDocument();
  });

  it("renders collection entries with an in-collection badge", () => {
    renderWithProviders(
      <LibraryList entries={[createEntry({ isSaved: true, isInCollection: true })]} />
    );

    expect(screen.getByText("In Collection")).toBeInTheDocument();
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
      "/saved"
    );

    await user.click(screen.getByRole("link", { name: /heat/i }));

    expect(screen.getByText(/"from":"\/saved"/i)).toBeInTheDocument();
    expect(screen.getByText(/"surface":"saved"/i)).toBeInTheDocument();
    expect(screen.getByText(/"backgroundLocation"/i)).toBeInTheDocument();
  });
});
