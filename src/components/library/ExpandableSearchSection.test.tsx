import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpandableSearchSection } from "./ExpandableSearchSection";

describe("ExpandableSearchSection", () => {
  it("renders the shared expanding search surface and forwards changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function TestHarness() {
      const [value, setValue] = useState("");

      return (
        <ExpandableSearchSection
          id="catalog-search"
          value={value}
          onChange={(nextValue) => {
            onChange(nextValue);
            setValue(nextValue);
          }}
          placeholder="Search all games..."
          inputLabel="Search game catalog"
          expandButtonLabel="Open search"
          sectionClassName="explore-search-section mb-8"
        />
      );
    }

    const { container } = render(
      <TestHarness />,
    );

    expect(container.querySelector(".explore-search-section")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: /open search/i }));
    await user.type(screen.getByRole("searchbox", { name: /search game catalog/i }), "Heat");

    expect(onChange).toHaveBeenLastCalledWith("Heat");
  });
});
