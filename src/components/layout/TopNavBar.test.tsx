import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/testUtils";
import { TopNavBar } from "./TopNavBar";

vi.mock("../../features/auth/useProfile", () => ({
  useProfile: () => ({ isAuthenticated: false }),
}));

describe("TopNavBar", () => {
  it("uses larger mobile sizing for dark mode and account controls", () => {
    renderWithProviders(<TopNavBar />);

    expect(screen.getByRole("button", { name: /toggle dark mode/i })).toHaveClass(
      "h-14",
      "w-14",
      "md:h-10",
      "md:w-10",
    );

    expect(screen.getByRole("button", { name: /open account/i })).toHaveClass(
      "h-14",
      "w-14",
      "md:h-10",
      "md:w-10",
    );
  });
});
