import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders with the default glass badge treatment", () => {
    render(<StatusBadge>Owned</StatusBadge>);

    const badge = screen.getByText("Owned");
    expect(badge).toHaveClass("glass-badge", "rounded-full");
    expect(badge).toHaveClass("text-on-primary-fixed");
  });

  it("renders a neutral variant for subtle status chips", () => {
    render(<StatusBadge tone="neutral">Wishlist</StatusBadge>);

    const badge = screen.getByText("Wishlist");
    expect(badge).toHaveClass("bg-surface-container-high");
    expect(badge).toHaveClass("text-on-surface");
  });

  it("supports compact size for tight layouts", () => {
    render(<StatusBadge size="compact">New</StatusBadge>);

    expect(screen.getByText("New")).toHaveClass("px-2", "py-1", "text-[10px]");
  });
});
