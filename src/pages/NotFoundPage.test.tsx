import { screen } from "@testing-library/react";
import { NotFoundPage } from "./NotFoundPage";
import { renderWithProviders } from "../test/testUtils";

describe("NotFoundPage", () => {
  it("uses a section container for the not-found message", () => {
    const { container } = renderWithProviders(<NotFoundPage />);

    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
    expect(container.querySelector("section")).toBeInTheDocument();
  });
});
