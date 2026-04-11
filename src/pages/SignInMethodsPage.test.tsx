import { screen } from "@testing-library/react";
import { SignInMethodsPage } from "./SignInMethodsPage";
import { renderWithProviders } from "../test/testUtils";

const mockUseProfile = vi.fn();
const mockUseAccountSecuritySummary = vi.fn();

vi.mock("../features/auth/useProfile", () => ({
  useProfile: () => mockUseProfile(),
}));

vi.mock("../features/auth/useAccountSecuritySummary", () => ({
  useAccountSecuritySummary: () => mockUseAccountSecuritySummary(),
}));

describe("SignInMethodsPage", () => {
  beforeEach(() => {
    mockUseProfile.mockReset();
    mockUseAccountSecuritySummary.mockReset();
  });

  it("shows the shared neutral state panel when the user is signed out", () => {
    mockUseProfile.mockReturnValue({
      isAuthenticated: false,
      profile: null,
      isOwner: false,
      isLoading: false,
      error: null,
    });
    mockUseAccountSecuritySummary.mockReturnValue({
      data: null,
      isLoading: false,
    });

    renderWithProviders(<SignInMethodsPage />, "/settings/sign-in-methods");

    expect(screen.getByText(/sign in to view your account security/i)).toBeInTheDocument();
  });
});
