import { render, screen } from "@testing-library/react";
import { useSlidingIndicator } from "./useSlidingIndicator";

function IndicatorHarness({ activeIndex }: { activeIndex: number }) {
  const { containerRef, indicatorStyle } = useSlidingIndicator({
    activeIndex,
    selector: "button",
  });

  return (
    <div ref={containerRef}>
      <div data-testid="indicator" style={{ left: indicatorStyle.left, width: indicatorStyle.width }} />
      <button
        ref={(node) => {
          if (!node) return;
          Object.defineProperty(node, "offsetLeft", { configurable: true, value: 12 });
          Object.defineProperty(node, "offsetWidth", { configurable: true, value: 88 });
        }}
        type="button"
      >
        Collection
      </button>
      <button
        ref={(node) => {
          if (!node) return;
          Object.defineProperty(node, "offsetLeft", { configurable: true, value: 104 });
          Object.defineProperty(node, "offsetWidth", { configurable: true, value: 96 });
        }}
        type="button"
      >
        Saved
      </button>
    </div>
  );
}

describe("useSlidingIndicator", () => {
  it("measures the active item width and left offset", () => {
    render(<IndicatorHarness activeIndex={1} />);

    expect(screen.getByTestId("indicator")).toHaveStyle({
      left: "104px",
      width: "96px",
    });
  });
});
