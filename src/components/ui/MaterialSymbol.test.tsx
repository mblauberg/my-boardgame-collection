import { render, screen } from "@testing-library/react";
import { MaterialSymbol } from "./MaterialSymbol";

describe("MaterialSymbol", () => {
  it("hides decorative icon text from assistive tech by default", () => {
    render(<MaterialSymbol icon="close" data-testid="symbol" />);

    const symbol = screen.getByTestId("symbol");
    expect(symbol).toHaveClass("material-symbols-outlined");
    expect(symbol).toHaveTextContent("close");
    expect(symbol).toHaveAttribute("aria-hidden", "true");
    expect(symbol).not.toHaveAttribute("role");
  });

  it("supports labeled icons and filled style when requested", () => {
    render(<MaterialSymbol icon="star" filled aria-label="Featured" />);

    const symbol = screen.getByRole("img", { name: "Featured" });
    expect(symbol).toHaveClass("material-symbols-filled");
    expect(symbol).toHaveAttribute("role", "img");
    expect(symbol).toHaveAttribute("aria-hidden", "false");
  });
});
