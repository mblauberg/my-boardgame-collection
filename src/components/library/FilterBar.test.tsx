import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "./FilterBar";

describe("FilterBar", () => {
  it("renders a compact control row with sort and filter actions", () => {
    const { container } = render(
      <FilterBar
        filters={{}}
        sortBy="rank"
        sortDirection="asc"
        onFiltersChange={vi.fn()}
        onSortChange={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    expect(container.firstElementChild).not.toHaveClass("glass-surface-panel");
    expect(screen.getByRole("searchbox", { name: /search games/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: /sort/i })).not.toBeInTheDocument();
  });

  it("shows active filter count and reveals advanced controls on demand", async () => {
    const user = userEvent.setup();

    render(
      <FilterBar
        filters={{ isLoved: true, playersMin: 2, playersMax: 4 }}
        sortBy="rank"
        sortDirection="asc"
        onFiltersChange={vi.fn()}
        onSortChange={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /filters \(2\)/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/player count/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /filters \(2\)/i }));

    expect(screen.getByRole("combobox", { name: /sort/i })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/player count/i)).toHaveLength(2);
    expect(screen.getByRole("button", { name: /loved/i })).toBeInTheDocument();
  });

  it("toggles sort direction from one compact button", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    render(
      <FilterBar
        filters={{}}
        sortBy="rank"
        sortDirection="asc"
        onFiltersChange={vi.fn()}
        onSortChange={onSortChange}
        onClearFilters={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /filters/i }));
    await user.click(screen.getByRole("button", { name: /sort direction ascending/i }));

    expect(onSortChange).toHaveBeenCalledWith("rank", "desc");
  });
});
