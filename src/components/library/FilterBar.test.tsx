import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "./FilterBar";

describe("FilterBar", () => {
  const filterToggleName = /^filters(?: \(\d+\))?$/i;

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
    expect(screen.getByRole("searchbox", { name: /search games/i })).toHaveClass("glass-input-field");
    expect(screen.getByRole("button", { name: /open search/i })).toHaveClass("glass-action-button");
    expect(screen.getByRole("button", { name: filterToggleName })).toHaveClass("glass-action-button");
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

    expect(screen.getByRole("button", { name: filterToggleName })).toBeInTheDocument();
    expect(screen.queryByLabelText(/player count/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: filterToggleName }));

    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
    expect(screen.getByText(/player count/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /loved games/i })).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: filterToggleName }));
    await user.click(screen.getByRole("button", { name: /rank/i }));

    expect(onSortChange).toHaveBeenCalledWith("rank", "desc");
  });

  it("clips the collapsed advanced filters container to avoid mobile viewport overflow", () => {
    render(
      <FilterBar
        filters={{}}
        sortBy="rank"
        sortDirection="asc"
        onFiltersChange={vi.fn()}
        onSortChange={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    expect(screen.getByTestId("advanced-filters-container")).toHaveClass("overflow-x-clip");
  });
});
