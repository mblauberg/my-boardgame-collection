import { afterEach, describe, expect, it, vi } from "vitest";
import { createEmailMergeRequestHandler } from "./handler.ts";

describe("createEmailMergeRequestHandler", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns an error and cleans up the token when confirmation link generation fails", async () => {
    vi.stubGlobal("Deno", {
      env: {
        get(name: string) {
          if (name === "SITE_URL") return "https://app.example.com";
          return undefined;
        },
      },
    });

    const getAccountContextFromRequest = vi.fn().mockResolvedValue({ accountId: "account-1" });
    const findActiveMergeRequest = vi.fn().mockResolvedValue(null);
    const createMergeRequest = vi.fn().mockResolvedValue({ id: "token-row-1" });
    const deleteMergeRequest = vi.fn().mockResolvedValue(undefined);
    const generateConfirmationLink = vi.fn().mockRejectedValue(new Error("mail unavailable"));
    const hashToken = vi.fn().mockResolvedValue("hashed-token");

    const handler = createEmailMergeRequestHandler({
      getAccountContextFromRequest,
      findActiveMergeRequest,
      createMergeRequest,
      deleteMergeRequest,
      generateConfirmationLink,
      createRawToken: () => "raw-token",
      getSiteUrl: () => "https://app.example.com",
      hashToken,
    });

    const response = await handler(
      new Request("https://project.supabase.co/functions/v1/email-merge-request", {
        method: "POST",
        headers: {
          Authorization: "Bearer token",
          Origin: "https://app.example.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newEmail: "Merged@example.com " }),
      }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to create confirmation email" });
    expect(hashToken).toHaveBeenCalledWith("raw-token");
    expect(createMergeRequest).toHaveBeenCalledWith({
      fromAccountId: "account-1",
      toEmail: "merged@example.com",
      tokenHash: "hashed-token",
    });
    expect(generateConfirmationLink).toHaveBeenCalledWith(
      "merged@example.com",
      "https://app.example.com/auth/callback?type=email_merge&token=raw-token",
    );
    expect(deleteMergeRequest).toHaveBeenCalledWith("token-row-1");
  });
});
