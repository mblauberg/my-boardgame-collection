import { render, screen } from "@testing-library/react";
import { QuickFilterPresets } from "./QuickFilterPresets";

describe("QuickFilterPresets", () => {
  it("renders preset actions with shared glass styling", () => {
    render(
      <QuickFilterPresets
        presets={[{ label: "Party Games", filters: { playersMin: 5 } }]}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /party games/i })).toHaveClass(
      "glass-action-button",
    );
  });
});
