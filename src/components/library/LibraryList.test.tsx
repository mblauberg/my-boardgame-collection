import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { LibraryList } from "./LibraryList";
import type { LibraryEntry } from "../../features/library/library.types";

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
    render(
      <MemoryRouter>
        <LibraryList entries={[createEntry({ isSaved: true })]} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /heat/i })).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /move to collection/i })).not.toBeInTheDocument();
  });

  it("renders collection entries with an in-collection badge", () => {
    render(
      <MemoryRouter>
        <LibraryList entries={[createEntry({ isSaved: true, isInCollection: true })]} />
      </MemoryRouter>,
    );

    expect(screen.getByText("In Collection")).toBeInTheDocument();
  });

  it("passes route state through game links when provided", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/saved"]}>
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
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("link", { name: /heat/i }));

    expect(screen.getByText(/"from":"\/saved"/i)).toBeInTheDocument();
    expect(screen.getByText(/"surface":"saved"/i)).toBeInTheDocument();
    expect(screen.getByText(/"backgroundLocation"/i)).toBeInTheDocument();
  });
});
