import { describe, expect, it } from "vitest";
import {
  getActiveProviderState,
  getVerifiedEmailCandidates,
} from "./accountSecurityLogic";

describe("accountSecurityLogic", () => {
  it("marks the active oauth provider as rejected when its email is not verified", () => {
    const user = {
      email: "alice@example.com",
      email_confirmed_at: null,
      app_metadata: { provider: "discord" },
      identities: [
        {
          provider: "discord",
          id: "discord-user",
          identity_data: {
            email: "alice@example.com",
            email_verified: false,
          },
        },
      ],
    };

    expect(getActiveProviderState(user)).toEqual({
      email: "alice@example.com",
      isEmailVerified: false,
      provider: "discord",
      shouldReject: true,
    });
  });

  it("collects verified email candidates for same-email auto-linking", () => {
    const user = {
      email: "alice@example.com",
      email_confirmed_at: null,
      app_metadata: { provider: "google" },
      identities: [
        {
          provider: "google",
          id: "google-user",
          identity_data: {
            email: "alice@example.com",
            email_verified: true,
          },
        },
        {
          provider: "github",
          id: "github-user",
          identity_data: {
            email: "alice@users.noreply.github.com",
            email_verified: false,
          },
        },
      ],
    };

    expect(getVerifiedEmailCandidates(user)).toEqual(["alice@example.com"]);
  });
});
