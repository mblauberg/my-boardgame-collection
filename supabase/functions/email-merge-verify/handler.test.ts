import { afterEach, describe, expect, it, vi } from "vitest";
import { createEmailMergeVerifyHandler } from "./handler.ts";

describe("createEmailMergeVerifyHandler", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("searches across auth user pages before merging and only consumes the token after success", async () => {
    vi.stubGlobal("Deno", {
      env: {
        get(name: string) {
          if (name === "SITE_URL") return "https://app.example.com";
          return undefined;
        },
      },
    });

    const listUsers = vi
      .fn()
      .mockResolvedValueOnce({
        users: [{ id: "source-user", email: "old@example.com" }],
        nextPage: 2,
      })
      .mockResolvedValueOnce({
        users: [{ id: "target-user", email: "merged@example.com" }],
        nextPage: null,
      });
    const markMergeTokenUsed = vi.fn().mockResolvedValue(undefined);
    const mergeAccountData = vi.fn().mockResolvedValue(undefined);
    const movePasskeys = vi.fn().mockResolvedValue(undefined);
    const moveAccountIdentities = vi.fn().mockResolvedValue(undefined);
    const deleteAuthUser = vi.fn().mockResolvedValue(undefined);
    const generateMagicLink = vi.fn().mockResolvedValue({ tokenHash: "session-token" });

    const handler = createEmailMergeVerifyHandler({
      hashToken: vi.fn().mockResolvedValue("hashed-token"),
      getMergeToken: vi.fn().mockResolvedValue({
        id: "merge-token-row",
        fromAccountId: "account-1",
        toEmail: "merged@example.com",
      }),
      markMergeTokenUsed,
      getPrimaryAuthUserIdForAccount: vi
        .fn()
        .mockResolvedValueOnce("source-user")
        .mockResolvedValueOnce("target-user"),
      listUsers,
      updateUserEmail: vi.fn(),
      syncAccountEmail: vi.fn(),
      resolveAccountIdForAuthUser: vi.fn().mockResolvedValue("account-2"),
      mergeAccountData,
      movePasskeys,
      moveAccountIdentities,
      deleteAuthUser,
      generateMagicLink,
      now: () => "2026-04-11T00:00:00.000Z",
    });

    const response = await handler(
      new Request("https://project.supabase.co/functions/v1/email-merge-verify", {
        method: "POST",
        headers: {
          Origin: "https://app.example.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: "raw-token" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ token_hash: "session-token", merged: true });
    expect(listUsers).toHaveBeenNthCalledWith(1, { page: 1, perPage: 1000 });
    expect(listUsers).toHaveBeenNthCalledWith(2, { page: 2, perPage: 1000 });
    expect(generateMagicLink).toHaveBeenCalledWith("merged@example.com");
    expect(mergeAccountData).toHaveBeenCalledWith("account-1", "account-2");
    expect(movePasskeys).toHaveBeenCalledWith("account-1", "account-2");
    expect(moveAccountIdentities).toHaveBeenCalledWith("account-1", "account-2");
    expect(deleteAuthUser).toHaveBeenCalledWith("source-user");
    expect(markMergeTokenUsed).toHaveBeenCalledWith("merge-token-row");
    expect(generateMagicLink.mock.invocationCallOrder[0]).toBeLessThan(mergeAccountData.mock.invocationCallOrder[0]);
    expect(mergeAccountData.mock.invocationCallOrder[0]).toBeLessThan(markMergeTokenUsed.mock.invocationCallOrder[0]);
  });

  it("keeps the token reusable when merge work fails before completion", async () => {
    vi.stubGlobal("Deno", {
      env: {
        get(name: string) {
          if (name === "SITE_URL") return "https://app.example.com";
          return undefined;
        },
      },
    });

    const markMergeTokenUsed = vi.fn().mockResolvedValue(undefined);

    const handler = createEmailMergeVerifyHandler({
      hashToken: vi.fn().mockResolvedValue("hashed-token"),
      getMergeToken: vi.fn().mockResolvedValue({
        id: "merge-token-row",
        fromAccountId: "account-1",
        toEmail: "merged@example.com",
      }),
      markMergeTokenUsed,
      getPrimaryAuthUserIdForAccount: vi
        .fn()
        .mockResolvedValueOnce("source-user")
        .mockResolvedValueOnce("target-user"),
      listUsers: vi.fn().mockResolvedValue({
        users: [{ id: "target-user", email: "merged@example.com" }],
        nextPage: null,
      }),
      updateUserEmail: vi.fn(),
      syncAccountEmail: vi.fn(),
      resolveAccountIdForAuthUser: vi.fn().mockResolvedValue("account-2"),
      mergeAccountData: vi.fn().mockRejectedValue(new Error("merge failed")),
      movePasskeys: vi.fn(),
      moveAccountIdentities: vi.fn(),
      deleteAuthUser: vi.fn(),
      generateMagicLink: vi.fn().mockResolvedValue({ tokenHash: "session-token" }),
      now: () => "2026-04-11T00:00:00.000Z",
    });

    const response = await handler(
      new Request("https://project.supabase.co/functions/v1/email-merge-verify", {
        method: "POST",
        headers: {
          Origin: "https://app.example.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: "raw-token" }),
      }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to merge account" });
    expect(markMergeTokenUsed).not.toHaveBeenCalled();
  });
});
