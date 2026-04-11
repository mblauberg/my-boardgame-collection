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

  it("renders a sliding active capsule in the mobile tab bar", () => {
    renderWithProviders(<BottomTabBar />, "/explore");

    expect(screen.getByTestId("bottom-nav-indicator")).toBeInTheDocument();
  });
});
