import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { CollectionToolbar } from "./CollectionToolbar";

describe("CollectionToolbar", () => {
  it("renders search input and filter controls", () => {
    render(
      <BrowserRouter>
        <CollectionToolbar />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/search games/i)).toBeInTheDocument();
    expect(screen.getByText(/all status/i)).toBeInTheDocument();
    expect(screen.getByText(/clear/i)).toBeInTheDocument();
  });
});
