import { render, screen } from "@testing-library/react";
import { MaterialSymbol } from "./MaterialSymbol";

describe("MaterialSymbol", () => {
  it("renders an outlined material symbol by default", () => {
    render(<MaterialSymbol icon="close" aria-label="Close" />);

    const symbol = screen.getByLabelText("Close");
    expect(symbol).toHaveClass("material-symbols-outlined");
    expect(symbol).toHaveTextContent("close");
    expect(symbol).not.toHaveStyle({ fontVariationSettings: "'FILL' 1" });
  });

  it("renders a filled material symbol class when requested", () => {
    render(<MaterialSymbol icon="star" filled aria-label="Featured" />);

    const symbol = screen.getByLabelText("Featured");
    expect(symbol).toHaveClass("[font-variation-settings:'FILL'_1,'wght'_400,'GRAD'_0,'opsz'_24]");
    expect(symbol).not.toHaveAttribute("style");
  });
});
