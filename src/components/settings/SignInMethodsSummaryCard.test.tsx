import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/testUtils";
import { SignInMethodsSummaryCard } from "./SignInMethodsSummaryCard";

const summary = {
  primaryEmail: "owner@example.com",
  passkeys: [],
  identities: [{ provider: "google", label: "Google" }],
  emails: [{ id: "email-1", value: "owner@example.com", isPrimary: true }],
};

describe("SignInMethodsSummaryCard", () => {
  it("uses shared glass classes for summary rows and controls", () => {
    const { container } = renderWithProviders(
      <SignInMethodsSummaryCard summary={summary} onOpen={vi.fn()} />,
    );

    expect(container.querySelector(".glass-surface-panel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /manage/i })).toHaveClass("glass-action-button");
    expect(container.querySelectorAll(".glass-selectable-card").length).toBeGreaterThan(0);
  });
});
