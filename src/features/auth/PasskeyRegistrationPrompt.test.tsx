import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasskeyRegistrationPrompt, PASSKEY_PROMPT_SUPPRESSION_KEY } from "./PasskeyRegistrationPrompt";

const mockInvoke = vi.fn();
const mockStartRegistration = vi.fn();

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    functions: {
      invoke: mockInvoke,
    },
  }),
}));

vi.mock("@simplewebauthn/browser", () => ({
  startRegistration: (...args: unknown[]) => mockStartRegistration(...args),
}));

describe("PasskeyRegistrationPrompt", () => {
  beforeEach(() => {
    localStorage.clear();
    mockInvoke.mockReset();
    mockStartRegistration.mockReset();
  });

  it("renders when user has no passkeys and is not suppressed", async () => {
    render(<PasskeyRegistrationPrompt hasPasskeys={false} />);

    await waitFor(() => {
      expect(screen.getByText(/sign in faster next time/i)).toBeInTheDocument();
    });
  });

  it("does not render when user already has passkeys", () => {
    render(<PasskeyRegistrationPrompt hasPasskeys />);

    expect(screen.queryByText(/sign in faster next time/i)).not.toBeInTheDocument();
  });

  it("does not render when suppression flag is within 30 days", () => {
    localStorage.setItem(PASSKEY_PROMPT_SUPPRESSION_KEY, Date.now().toString());

    render(<PasskeyRegistrationPrompt hasPasskeys={false} />);

    expect(screen.queryByText(/sign in faster next time/i)).not.toBeInTheDocument();
  });

  it("dismisses and stores suppression flag when 'Maybe later' is clicked", async () => {
    const user = userEvent.setup();

    render(<PasskeyRegistrationPrompt hasPasskeys={false} />);
    await user.click(screen.getByRole("button", { name: /maybe later/i }));

    expect(screen.queryByText(/sign in faster next time/i)).not.toBeInTheDocument();
    expect(localStorage.getItem(PASSKEY_PROMPT_SUPPRESSION_KEY)).not.toBeNull();
  });
});
