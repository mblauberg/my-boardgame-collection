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

  it("keeps keyboard focus trapped inside the dialog", async () => {
    const user = userEvent.setup();

    render(
      <>
        <button>Outside action</button>
        <GameDetailOverlay title="Heat" titleId="game-detail-title" onRequestClose={vi.fn()}>
          <button>Inside action</button>
        </GameDetailOverlay>
      </>,
    );

    const closeButton = screen.getByRole("button", { name: /close game details/i });
    const insideButton = screen.getByRole("button", { name: /inside action/i });
    const outsideButton = screen.getByRole("button", { name: /outside action/i });

    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(insideButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();
    expect(outsideButton).not.toHaveFocus();
  });

  it("uses the trophy-room backdrop and header treatment", () => {
    render(
      <GameDetailOverlay title="Heat" titleId="game-detail-title" onRequestClose={vi.fn()} onEdit={vi.fn()}>
        body
      </GameDetailOverlay>,
    );

    const backdrop = screen.getByTestId("overlay-backdrop");
    const panel = screen.getByTestId("overlay-panel");
    const header = screen.getByTestId("overlay-header");
    const title = screen.getByRole("heading", { name: "Heat" });
    const closeButton = screen.getByRole("button", { name: /close game details/i });
    const editButton = screen.getByRole("button", { name: /edit game/i });

    expect(backdrop).toHaveAttribute("data-motion", "backdrop");
    expect(panel).toHaveAttribute("data-motion", "panel");
    expect(backdrop.className).toContain("bg-on-surface/10");
    expect(backdrop.className).not.toContain("bg-black/50");
    expect(header.className).not.toContain("border-b");
    expect(header.className).toContain("overlay-floating-header");
    expect(header.className).toContain("bg-transparent");
    expect(title.className).toContain("overlay-header-title-pill");
    expect(closeButton.className).toContain("overlay-header-action-pill");
    expect(editButton.className).toContain("overlay-header-action-pill");
    expect(closeButton).toHaveClass("h-10", "w-10", "p-0");
    expect(editButton).toHaveClass("h-10", "w-10", "p-0");
  });
});
