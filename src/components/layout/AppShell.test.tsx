import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/testUtils";
import { AppShell } from "./AppShell";

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
    expect(screen.getByText("Route body")).toBeInTheDocument();
  });
});
