import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/testUtils";
import { AppShell } from "./AppShell";

vi.mock("../../features/auth/useProfile", () => ({
  useProfile: () => ({ isAuthenticated: false }),
}));

describe("AppShell", () => {
  it("renders the current shell navigation and route body", () => {
    renderWithProviders(
      <AppShell>
        <div>Route body</div>
      </AppShell>
    );

    expect(screen.getByRole("link", { name: /my board game collection/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Collection" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Saved" })).toHaveAttribute("href", "/saved");
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("href", "/explore");
    // AppShell has TopNavBar and BottomTabBar — both are <nav>; target the top one by its dark mode class
    const navs = screen.getAllByRole("navigation");
    const topNav = navs.find(nav => nav.classList.contains("dark:bg-[rgb(28_27_27/0.86)]"));
    expect(topNav).toBeDefined();
    expect(screen.getByText("Route body")).toBeInTheDocument();
  });
});
