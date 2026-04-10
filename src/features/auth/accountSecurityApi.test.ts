const mockInvoke = vi.fn();

vi.mock("../../lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    functions: {
      invoke: mockInvoke,
    },
  }),
}));

// eslint-disable-next-line import/first
import { fetchAccountSecuritySummary, syncAccountSession } from "./accountSecurityApi";

describe("accountSecurityApi", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it("invokes account-sync-session for the signed-in user", async () => {
    mockInvoke.mockResolvedValue({ data: { ok: true, needsPasskeyPrompt: true }, error: null });

    const result = await syncAccountSession();

    expect(mockInvoke).toHaveBeenCalledWith("account-sync-session", undefined);
    expect(result).toEqual({ needsPasskeyPrompt: true });
  });

  it("loads account-security-summary from the edge function", async () => {
    mockInvoke.mockResolvedValue({
      data: {
        primaryEmail: "alice@example.com",
        secondaryEmails: [{ email: "a@example.com" }],
        identities: [{ provider: "google", email: "alice@example.com" }],
        passkeys: [],
      },
      error: null,
    });

    const summary = await fetchAccountSecuritySummary();

    expect(mockInvoke).toHaveBeenCalledWith("account-security-summary", {});
    expect(summary.primaryEmail).toBe("alice@example.com");
  });
});
