import { render, screen } from "@testing-library/react";
import { MaterialSymbol } from "./MaterialSymbol";

describe("MaterialSymbol", () => {
  it("hides decorative icon text from assistive tech by default", () => {
    render(<MaterialSymbol icon="close" data-testid="symbol" />);

    const symbol = screen.getByTestId("symbol");
    expect(symbol).toHaveClass("material-symbols-outlined");
    expect(symbol).toHaveTextContent("close");
    expect(symbol).toHaveAttribute("aria-hidden", "true");
  });

  it("supports labeled icons and filled style when requested", () => {
    render(<MaterialSymbol icon="star" filled aria-label="Featured" />);

    const symbol = screen.getByLabelText("Featured");
    expect(symbol).toHaveClass("[font-variation-settings:'FILL'_1,'wght'_400,'GRAD'_0,'opsz'_24]");
    expect(symbol).toHaveAttribute("aria-hidden", "false");
  });
});
