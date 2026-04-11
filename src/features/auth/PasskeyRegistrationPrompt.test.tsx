import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasskeyRegistrationPrompt, PASSKEY_PROMPT_SUPPRESSION_KEY } from "./PasskeyRegistrationPrompt";

const mockInvoke = vi.fn();
const mockStartRegistration = vi.fn();
const mockGetSession = vi.fn();

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
    functions: {
      invoke: mockInvoke,
    },
  }),
}));

vi.mock("@simplewebauthn/browser", () => ({
  startRegistration: (...args: unknown[]) => mockStartRegistration(...args),
}));

vi.mock("@iconify/react", () => ({
  Icon: ({ icon, ...props }: { icon: string }) => <span data-icon={icon} {...props} />,
}));

describe("PasskeyRegistrationPrompt", () => {
  beforeEach(() => {
    localStorage.clear();
    mockInvoke.mockReset();
    mockStartRegistration.mockReset();
    mockGetSession.mockReset();
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: "test-access-token",
        },
      },
      error: null,
    });
  });

  it("renders when user has no passkeys and is not suppressed", async () => {
    const { container } = render(<PasskeyRegistrationPrompt hasPasskeys={false} compact />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /set up passkey/i })).toBeInTheDocument();
    });
    expect(container.firstElementChild).toHaveClass("glass-surface-panel");
    expect(screen.getByRole("button", { name: /set up passkey/i })).toHaveClass(
      "glass-action-button-active",
    );
    expect(screen.getByRole("button", { name: /maybe later/i })).toHaveClass("glass-action-button");
  });

  it("does not render when user already has passkeys", () => {
    render(<PasskeyRegistrationPrompt hasPasskeys />);

    expect(screen.queryByRole("button", { name: /set up passkey/i })).not.toBeInTheDocument();
  });

  it("does not render when suppression flag is within 30 days", () => {
    localStorage.setItem(PASSKEY_PROMPT_SUPPRESSION_KEY, Date.now().toString());

    render(<PasskeyRegistrationPrompt hasPasskeys={false} />);

    expect(screen.queryByRole("button", { name: /set up passkey/i })).not.toBeInTheDocument();
  });

  it("dismisses and stores suppression flag when 'Maybe later' is clicked", async () => {
    const user = userEvent.setup();

    render(<PasskeyRegistrationPrompt hasPasskeys={false} />);
    await user.click(screen.getByRole("button", { name: /maybe later/i }));

    expect(screen.queryByRole("button", { name: /set up passkey/i })).not.toBeInTheDocument();
    expect(localStorage.getItem(PASSKEY_PROMPT_SUPPRESSION_KEY)).not.toBeNull();
  });

  it("sends bearer auth when requesting passkey registration options", async () => {
    const user = userEvent.setup();
    mockInvoke.mockResolvedValueOnce({
      data: { challenge: "challenge-1" },
      error: null,
    });
    mockStartRegistration.mockResolvedValue({ id: "credential-id" });
    mockInvoke.mockResolvedValueOnce({
      data: { ok: true },
      error: null,
    });

    render(<PasskeyRegistrationPrompt hasPasskeys={false} />);
    await user.click(await screen.findByRole("button", { name: /set up passkey/i }));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith(
        "passkey-register-options",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-access-token",
          }),
        }),
      );
    });
  });
});
