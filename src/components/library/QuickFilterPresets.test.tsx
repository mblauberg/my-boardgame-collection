import { render, screen } from "@testing-library/react";
import { QuickFilterPresets } from "./QuickFilterPresets";

describe("QuickFilterPresets", () => {
  it("renders preset actions with shared glass styling", () => {
    render(
      <QuickFilterPresets
        presets={[{ label: "Plays at 5", filters: { playerCount: 5 } }]}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /plays at 5/i })).toHaveClass(
      "glass-action-button",
    );
  });
});
