import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RecommendationEditor } from "./RecommendationEditor";
import type { Game } from "../../types/domain";

const baseGame: Game = {
  id: "game-1",
  name: "Arnak",
  slug: "arnak",
  bggId: null,
  bggUrl: null,
  status: "new_rec",
  buyPriority: null,
  bggRating: null,
  bggWeight: null,
  playersMin: null,
  playersMax: null,
  playTimeMin: null,
  playTimeMax: null,
  category: null,
  summary: "Great engine builder",
  notes: "Overlaps with Wingspan",
  recommendationVerdict: "Strong fit",
  recommendationColour: "#22c55e",
  gapReason: "Fills co-op gap",
  isExpansionIncluded: false,
  imageUrl: null,
  publishedYear: null,
  hidden: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  tags: [],
};

describe("RecommendationEditor", () => {
  it("renders form fields pre-filled with game data", () => {
    render(<RecommendationEditor game={baseGame} onSave={() => {}} onCancel={() => {}} />);
    expect(screen.getByDisplayValue("Strong fit")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Great engine builder")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Overlaps with Wingspan")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Fills co-op gap")).toBeInTheDocument();
  });

  it("calls onSave with updated values on submit", async () => {
    const onSave = vi.fn();
    render(<RecommendationEditor game={baseGame} onSave={onSave} onCancel={() => {}} />);

    const verdictInput = screen.getByDisplayValue("Strong fit");
    fireEvent.change(verdictInput, { target: { value: "Updated verdict" } });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ recommendationVerdict: "Updated verdict" }),
        expect.anything(),
      );
    });
  });

  it("calls onCancel when cancel button clicked", () => {
    const onCancel = vi.fn();
    render(<RecommendationEditor game={baseGame} onSave={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
