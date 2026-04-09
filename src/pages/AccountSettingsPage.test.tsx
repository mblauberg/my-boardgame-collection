import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AccountSettingsPage } from "./AccountSettingsPage";

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

vi.mock("../components/library/AddGameWizardOverlay", () => ({
  AddGameWizardOverlay: ({
    isOpen,
    defaultState,
  }: {
    isOpen: boolean;
    defaultState?: { isSaved: boolean; isLoved: boolean; isInCollection: boolean };
  }) =>
    isOpen ? <div>{`Add game wizard (${JSON.stringify(defaultState)})`}</div> : null,
}));

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

    render(
      <MemoryRouter>
        <AccountSettingsPage />
      </MemoryRouter>,
    );

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

  it("opens the add-game wizard in collection mode", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AccountSettingsPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /add new game/i }));

    expect(
      screen.getByText(/"isSaved":false,"isLoved":false,"isInCollection":true/i),
    ).toBeInTheDocument();
  });

  it("shows the Supabase error message when save rejects with a structured error object", async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValue({
      code: "42703",
      message: "column profiles.is_saved_public does not exist",
    });

    render(
      <MemoryRouter>
        <AccountSettingsPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /save settings/i }));

    expect(
      await screen.findByText(/column profiles\.is_saved_public does not exist/i),
    ).toBeInTheDocument();
  });
});
