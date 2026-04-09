import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameDetailOverlay } from "./GameDetailOverlay";

describe("GameDetailOverlay", () => {
  it("closes to the stored background route when the close button is pressed", async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();

    render(
      <GameDetailOverlay title="Heat" titleId="game-detail-title" onRequestClose={onRequestClose}>
        body
      </GameDetailOverlay>,
    );

    await user.click(screen.getByRole("button", { name: /close game details/i }));

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();

    render(
      <GameDetailOverlay title="Heat" titleId="game-detail-title" onRequestClose={onRequestClose}>
        body
      </GameDetailOverlay>,
    );

    await user.click(screen.getByTestId("overlay-backdrop"));

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();

    render(
      <GameDetailOverlay title="Heat" titleId="game-detail-title" onRequestClose={onRequestClose}>
        body
      </GameDetailOverlay>,
    );

    await user.keyboard("{Escape}");

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
