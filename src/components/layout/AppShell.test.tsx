import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
