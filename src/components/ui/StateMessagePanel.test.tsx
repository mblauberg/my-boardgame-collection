import { render, screen } from "@testing-library/react";
import { StateMessagePanel } from "./StateMessagePanel";

describe("StateMessagePanel", () => {
  it("renders a centered error state with title and description", () => {
    render(
      <StateMessagePanel
        tone="error"
        title="Account settings unavailable"
        description="There was a problem loading your profile."
        align="center"
      />,
    );

    const title = screen.getByText(/account settings unavailable/i);
    expect(title).toBeInTheDocument();
    expect(screen.getByText(/there was a problem loading your profile/i)).toBeInTheDocument();
    expect(title.closest("div")).toHaveClass("border-error/20");
  });

  it("renders compact success copy with an action slot", () => {
    render(
      <StateMessagePanel
        tone="success"
        title="Accounts merged successfully."
        description="You are now signed in with your combined account."
        size="compact"
        actions={<button type="button">Dismiss</button>}
      />,
    );

    expect(screen.getByText(/accounts merged successfully/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dismiss/i })).toBeInTheDocument();
  });

  it("renders neutral informational copy without a title", () => {
    render(
      <StateMessagePanel
        tone="neutral"
        description="Sign in to view your account security."
      />,
    );

    expect(screen.getByText(/sign in to view your account security/i)).toBeInTheDocument();
  });
});
