import { render, screen } from "@testing-library/react";
import { SignInOverlayFrame } from "./SignInOverlayFrame";

describe("SignInOverlayFrame", () => {
  it("uses shared surface panel tokens for the dialog shell", () => {
    render(
      <SignInOverlayFrame onRequestClose={vi.fn()}>
        <p>Sign-in content</p>
      </SignInOverlayFrame>,
    );

    const dialog = screen.getByRole("dialog", { name: /sign in/i });
    expect(dialog).toHaveClass("glass-surface-panel", "rounded-2xl", "shadow-ambient");
  });
});
