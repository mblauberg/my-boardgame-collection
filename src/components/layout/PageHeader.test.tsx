import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders inside the shared glass surface panel shell", () => {
    const { container } = render(
      <MemoryRouter>
        <PageHeader eyebrow="Library" title="Your Games" description="Browse your collection." />
      </MemoryRouter>,
    );

    expect(container.querySelector("header > div")).toHaveClass(
      "glass-surface-panel",
      "rounded-2xl",
      "shadow-ambient",
    );
    expect(screen.getByRole("heading", { name: /your games/i })).toBeInTheDocument();
  });
});
