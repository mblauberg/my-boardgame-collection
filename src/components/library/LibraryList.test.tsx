import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LibraryList } from "./LibraryList";
import type { LibraryEntry } from "../../features/library/library.types";

function createEntry(listType: LibraryEntry["listType"]): LibraryEntry {
  return {
    id: "entry-1",
    userId: "user-1",
    gameId: "game-1",
    listType,
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
  };
}

describe("LibraryList", () => {
  it("renders wishlist items with a move-to-collection button", () => {
    render(
      <MemoryRouter>
        <LibraryList entries={[createEntry("wishlist")]} onMoveToCollection={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /heat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move to collection/i })).toBeInTheDocument();
  });

  it("does not render move-to-collection for collection entries", () => {
    render(
      <MemoryRouter>
        <LibraryList entries={[createEntry("collection")]} onMoveToCollection={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("button", { name: /move to collection/i })).not.toBeInTheDocument();
  });

  it("passes route state through game links when provided", () => {
    render(
      <MemoryRouter>
        <LibraryList
          entries={[createEntry("collection")]}
          getGameLinkState={() => ({ from: "/wishlist" })}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /heat/i })).toHaveAttribute("href", "/game/heat");
  });
});
