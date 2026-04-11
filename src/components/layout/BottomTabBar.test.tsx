import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/testUtils";
import { BottomTabBar } from "./BottomTabBar";

vi.mock("../../features/auth/useProfile", () => ({
  useProfile: () => ({ isAuthenticated: false }),
}));

describe("BottomTabBar", () => {
  it("renders only collection, saved, and explore tabs on mobile", () => {
    renderWithProviders(<BottomTabBar />);

    expect(screen.getByRole("link", { name: /collection/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /saved/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /account/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /account/i })).not.toBeInTheDocument();
  });

  it("renders the active route icon with filled material symbol classes", () => {
    renderWithProviders(<BottomTabBar />, "/saved");

    const activeIcon = screen.getByText("bookmark");
    expect(activeIcon).toHaveClass("material-symbols-filled");
    expect(activeIcon).not.toHaveAttribute("style");
  });
});
