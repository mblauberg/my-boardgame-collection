import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/testUtils";
import { SignInMethodsSheet } from "./SignInMethodsSheet";

const summary = {
  primaryEmail: "owner@example.com",
  passkeys: [],
  identities: [{ provider: "google", label: "Google" }],
  emails: [{ id: "email-1", value: "owner@example.com", isPrimary: true }],
};

describe("SignInMethodsSheet", () => {
  it("renders motion-aware backdrop and panel wrappers", () => {
    renderWithProviders(
      <SignInMethodsSheet isOpen onClose={vi.fn()} summary={summary} />,
    );

    expect(screen.getByTestId("sign-in-methods-backdrop")).toHaveAttribute(
      "data-motion",
      "security-backdrop",
    );
    expect(screen.getByRole("dialog", { name: /sign-in methods/i })).toHaveAttribute(
      "data-motion",
      "security-panel",
    );
  });

  it("uses shared glass surfaces for the security cards", () => {
    const { container } = renderWithProviders(
      <SignInMethodsSheet isOpen onClose={vi.fn()} summary={summary} />,
    );

    expect(container.querySelectorAll(".glass-surface-panel").length).toBeGreaterThanOrEqual(4);
  });
});
