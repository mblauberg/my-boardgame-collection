import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ExploreShelf } from "./ExploreShelf";
import type { Game } from "../../types/domain";

const game: Game = {
  id: "game-1",
  name: "A Fake Artist",
  slug: "a-fake-artist",
  bggId: null,
  bggUrl: null,
  status: "archived",
  buyPriority: null,
  bggRating: 7,
  bggWeight: 1.1,
  playersMin: 5,
  playersMax: 10,
  playTimeMin: 20,
  playTimeMax: 20,
  category: null,
  summary: "Draw one line and bluff.",
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

function LocationStateProbe() {
  const location = useLocation();
  return <pre>{JSON.stringify(location.state)}</pre>;
}

describe("ExploreShelf", () => {
  it("preserves the explore route as link state for game detail navigation", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <Routes>
          <Route path="/explore" element={<ExploreShelf title="For You" entries={[game]} />} />
          <Route path="/game/:slug" element={<LocationStateProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("link", { name: /a fake artist/i }));

    expect(screen.getByText(/"from":"\/explore"/i)).toBeInTheDocument();
    expect(screen.getByText(/"backgroundLocation"/i)).toBeInTheDocument();
  });
});
