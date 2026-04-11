import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpandingSearchInput } from "./ExpandingSearchInput";

describe("ExpandingSearchInput", () => {
  it("expands on demand and collapses again when left empty", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function TestHarness() {
      const [value, setValue] = useState("");

      return (
        <ExpandingSearchInput
          id="shared-search"
          value={value}
          onChange={(nextValue) => {
            onChange(nextValue);
            setValue(nextValue);
          }}
          placeholder="Search all games..."
          inputLabel="Search all games"
          expandButtonLabel="Open search"
        />
      );
    }

    render(
      <TestHarness />,
    );

    expect(screen.getByRole("button", { name: /open search/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open search/i }));

    const input = screen.getByRole("searchbox", { name: /search all games/i });
    expect(input).toHaveFocus();

    await user.type(input, "Heat");
    expect(onChange).toHaveBeenLastCalledWith("Heat");

    await user.clear(input);
    await user.tab();

    expect(screen.getByRole("button", { name: /open search/i })).toBeInTheDocument();
  });
});
