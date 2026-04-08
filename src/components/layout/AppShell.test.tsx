import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock useProfile before importing AppShell
vi.mock("../../features/auth/useProfile", () => ({
  useProfile: () => ({
    profile: null,
    isOwner: false,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),
}));

// eslint-disable-next-line import/first
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders the project title and primary navigation", () => {
    render(
      <MemoryRouter>
        <AppShell>
          <div>Route body</div>
        </AppShell>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /board game collection/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Collection" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Scenarios" })).toHaveAttribute("href", "/scenarios");
    expect(screen.getByText("Route body")).toBeInTheDocument();
  });
});
