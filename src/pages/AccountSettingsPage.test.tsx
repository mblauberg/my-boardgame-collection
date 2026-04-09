import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AccountSettingsPage } from "./AccountSettingsPage";
import { ThemeProvider } from "../lib/theme";

const useProfile = vi.fn();
const mutateAsync = vi.fn();

vi.mock("../features/auth/useProfile", () => ({
  useProfile: () => useProfile(),
}));

vi.mock("../features/profiles/useUpdateProfileMutation", () => ({
  useUpdateProfileMutation: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

function renderAccountSettingsPage() {
  render(
    <MemoryRouter>
      <ThemeProvider>
        <AccountSettingsPage />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe("AccountSettingsPage", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    useProfile.mockReturnValue({
      profile: {
        id: "user-1",
        email: "alice@example.com",
        role: "viewer",
        username: "alice",
        is_profile_public: true,
        is_collection_public: true,
        is_saved_public: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      isOwner: false,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  });

  it("loads the profile values and saves updates through the profile mutation", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({ id: "user-1" });

    renderAccountSettingsPage();

    const usernameInput = screen.getByLabelText(/username/i);
    expect(usernameInput).toHaveValue("alice");
    expect(screen.getByRole("checkbox", { name: /public profile/i })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /public collection/i })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /public saved/i })).not.toBeChecked();

    await user.clear(usernameInput);
    await user.type(usernameInput, "collector-alice");
    await user.click(screen.getByRole("checkbox", { name: /public saved/i }));
    await user.click(screen.getByRole("button", { name: /save settings/i }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        id: "user-1",
        username: "collector-alice",
        is_profile_public: true,
        is_collection_public: true,
        is_saved_public: true,
      }),
    );
  });

  it("shows the current public visibility summary", () => {
    renderAccountSettingsPage();

    expect(screen.getByText(/profile: public/i)).toBeInTheDocument();
    expect(screen.getByText(/collection: public/i)).toBeInTheDocument();
    expect(screen.getByText(/saved: private/i)).toBeInTheDocument();
  });

  it("renders a profile link when the signed-in user has a username", () => {
    renderAccountSettingsPage();

    expect(screen.getByRole("link", { name: /view profile/i })).toHaveAttribute(
      "href",
      "/u/alice",
    );
  });

  it("shows the Supabase error message when save rejects with a structured error object", async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValue({
      code: "42703",
      message: "column profiles.is_saved_public does not exist",
    });

    renderAccountSettingsPage();

    await user.click(screen.getByRole("button", { name: /save settings/i }));

    expect(
      await screen.findByText(/column profiles\.is_saved_public does not exist/i),
    ).toBeInTheDocument();
  });

  it("toggles the global theme and persists it", async () => {
    const user = userEvent.setup();

    renderAccountSettingsPage();

    await user.click(screen.getByRole("button", { name: /toggle dark mode/i }));

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("renders accessible icon-only buttons with proper aria-label", () => {
    renderAccountSettingsPage();

    expect(screen.getByRole("button", { name: /toggle dark mode/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view profile/i })).toBeInTheDocument();
  });

  it("uses explicit dark-mode text and surface classes for readability", () => {
    renderAccountSettingsPage();

    const heroHeading = screen.getByRole("heading", { name: /manage your account/i });
    expect(heroHeading).toHaveClass("dark:text-[rgb(229_226_225)]");

    const saveButton = screen.getByRole("button", { name: /save settings/i });
    expect(saveButton.closest("form")).toHaveClass("dark:bg-[rgb(28_27_27)]");
  });
});
