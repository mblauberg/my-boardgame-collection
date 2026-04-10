import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { renderWithProviders } from "../../test/testUtils";
import { AppShell } from "./AppShell";

vi.mock("../../features/auth/useProfile", () => ({
  useProfile: () => ({ isAuthenticated: false }),
}));

function LocationProbe() {
  const location = useLocation();

  return (
    <div>
      <div data-testid="location-pathname">{location.pathname}</div>
      <div data-testid="location-state">{JSON.stringify(location.state)}</div>
    </div>
  );
}

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
    expect(screen.getByRole("button", { name: /toggle dark mode/i })).toBeInTheDocument();
    // AppShell has TopNavBar and BottomTabBar — both are <nav>; target the top one by glass-nav class
    const navs = screen.getAllByRole("navigation");
    const topNav = navs.find(nav => nav.classList.contains("glass-nav"));
    expect(topNav).toBeDefined();
    expect(screen.getByText("Route body")).toBeInTheDocument();
  });

  it("routes signed-out account access through sign-in overlay state", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <>
        <AppShell>
          <div>Route body</div>
        </AppShell>
        <LocationProbe />
      </>,
      "/saved",
    );

    await user.click(screen.getByRole("button", { name: /open account/i }));

    expect(screen.getByTestId("location-pathname")).toHaveTextContent("/signin");
    expect(screen.getByTestId("location-state")).toHaveTextContent('"pathname":"/saved"');
  });
});
