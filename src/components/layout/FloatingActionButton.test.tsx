import { render, screen } from "@testing-library/react";
import { FloatingActionButton } from "./FloatingActionButton";

describe("FloatingActionButton", () => {
  it("uses shared glass CTA styling", () => {
    render(<FloatingActionButton />);

    const button = screen.getByRole("button", { name: /open add game wizard/i });
    expect(button).toHaveClass(
      "glass-action-button",
      "glass-action-button-active",
    );
    expect(button).toHaveClass("bottom-32", "md:bottom-8");
  });
});
