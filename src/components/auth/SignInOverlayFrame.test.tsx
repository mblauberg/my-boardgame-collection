import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/testUtils";
import { SignInOverlayFrame } from "./SignInOverlayFrame";

describe("SignInOverlayFrame", () => {
  it("renders motion-aware backdrop and panel wrappers", () => {
    renderWithProviders(
      <SignInOverlayFrame isStandalone onRequestClose={vi.fn()}>
        <div>Sign in content</div>
      </SignInOverlayFrame>,
    );

    expect(screen.getByTestId("sign-in-overlay-backdrop")).toHaveAttribute(
      "data-motion",
      "auth-backdrop",
    );
    expect(screen.getByRole("dialog", { name: /sign in/i })).toHaveAttribute(
      "data-motion",
      "auth-panel",
    );
  });

  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();

    renderWithProviders(
      <SignInOverlayFrame isStandalone onRequestClose={onRequestClose}>
        <div>Sign in content</div>
      </SignInOverlayFrame>,
    );

    await user.click(screen.getByTestId("sign-in-overlay-backdrop"));

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
