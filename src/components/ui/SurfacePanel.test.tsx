import { render, screen } from "@testing-library/react";
import { SurfacePanel } from "./SurfacePanel";

describe("SurfacePanel", () => {
  it("renders children inside the default glass panel shell", () => {
    render(
      <SurfacePanel>
        <h2>Panel title</h2>
      </SurfacePanel>,
    );

    const heading = screen.getByRole("heading", { name: "Panel title" });
    const panel = heading.closest("div");

    expect(panel).toHaveClass("glass-surface-panel", "rounded-2xl");
    expect(panel).toHaveClass("border", "shadow-ambient");
  });

  it("applies compact spacing and accepts custom classes", () => {
    render(
      <SurfacePanel spacing="compact" className="extra-class">
        <p>Body</p>
      </SurfacePanel>,
    );

    const panel = screen.getByText("Body").closest("div");
    expect(panel).toHaveClass("p-4", "extra-class");
  });

  it("renders a semantic container when `as` is provided", () => {
    render(
      <SurfacePanel as="section">
        <h2>Semantic panel</h2>
      </SurfacePanel>,
    );

    const heading = screen.getByRole("heading", { name: "Semantic panel" });
    const panel = heading.closest("section");
    expect(panel).toHaveClass("glass-surface-panel", "rounded-2xl");
  });
});
