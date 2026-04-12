import { render, screen } from "@testing-library/react";
import type { Game } from "../../types/domain";
import { GameQuickEditForm } from "./GameQuickEditForm";

const gameFixture: Game = {
  id: "game-1",
  name: "Heat",
  slug: "heat",
  bggId: null,
  bggUrl: null,
  status: "owned",
  buyPriority: null,
  bggRating: null,
  bggWeight: null,
  playersMin: null,
  playersMax: null,
  playTimeMin: null,
  playTimeMax: null,
  category: null,
  summary: null,
  notes: null,
  recommendationVerdict: null,
  recommendationColour: null,
  gapReason: null,
  isExpansionIncluded: false,
  imageUrl: null,
  publishedYear: null,
  hidden: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  tags: [],
};

describe("GameQuickEditForm", () => {
  it("uses shared glass classes for quick-edit inputs and actions", () => {
    render(
      <GameQuickEditForm
        game={gameFixture}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByLabelText(/image url/i)).toHaveClass("glass-input-field");
    expect(screen.getByLabelText(/summary/i)).toHaveClass("glass-input-field");
    expect(screen.getByRole("button", { name: /cancel/i })).toHaveClass("glass-action-button");
    expect(screen.getByRole("button", { name: /^save$/i })).toHaveClass("glass-action-button-active");
  });
});
