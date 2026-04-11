import { getCorsHeaders, handleCors, requireMethod } from "../_shared/cors.ts";

type AuthUser = {
  id: string;
  email?: string | null;
};

export type EmailMergeVerifyDeps = {
  hashToken(raw: string): Promise<string>;
  getMergeToken(tokenHash: string): Promise<{
    id: string;
    fromAccountId: string;
    toEmail: string;
  } | null>;
  markMergeTokenUsed(id: string): Promise<void>;
  getPrimaryAuthUserIdForAccount(accountId: string): Promise<string>;
  listUsers(params: { page: number; perPage: number }): Promise<{
    users: AuthUser[];
    nextPage: number | null;
  }>;
  updateUserEmail(authUserId: string, email: string): Promise<void>;
  syncAccountEmail(accountId: string, email: string, verifiedAt: string): Promise<void>;
  resolveAccountIdForAuthUser(authUserId: string): Promise<string>;
  mergeAccountData(fromAccountId: string, toAccountId: string): Promise<void>;
  movePasskeys(fromAccountId: string, toAccountId: string): Promise<void>;
  moveAccountIdentities(fromAccountId: string, toAccountId: string): Promise<void>;
  deleteAuthUser(authUserId: string): Promise<void>;
  generateMagicLink(email: string): Promise<{ tokenHash: string }>;
  now(): string;
};

function json(req: Request, body: unknown, init?: ResponseInit): Response {
  return Response.json(body, {
    ...init,
    headers: getCorsHeaders(req, init?.headers),
  });
}

function manualSignInError(req: Request, message: string, merged: boolean): Response {
  return json(
    req,
    {
      error: message,
      merged,
      requires_manual_sign_in: true,
    },
    { status: 500 },
  );
}

async function findTargetAuthUserByEmail(
  email: string,
  excludingUserId: string,
  listUsers: EmailMergeVerifyDeps["listUsers"],
): Promise<AuthUser | null> {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { users, nextPage } = await listUsers({ page, perPage });
    const matchingUser = users.find(
      (user) => user.id !== excludingUserId && user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (matchingUser) {
      return matchingUser;
    }

    if (!nextPage) {
      return null;
    }

    page = nextPage;
  }
}

export function createEmailMergeVerifyHandler(deps: EmailMergeVerifyDeps) {
  return async (req: Request): Promise<Response> => {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const methodResponse = requireMethod(req, ["POST"]);
    if (methodResponse) return methodResponse;

    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return json(req, { error: "Token required" }, { status: 400 });
    }

    const tokenHash = await deps.hashToken(token);
    const mergeToken = await deps.getMergeToken(tokenHash);
    if (!mergeToken) {
      return json(req, { error: "Invalid or expired token" }, { status: 401 });
    }

    const { fromAccountId, toEmail } = mergeToken;
    const fromPrimaryAuthUserId = await deps.getPrimaryAuthUserIdForAccount(fromAccountId);

    let targetUser: AuthUser | null;
    try {
      targetUser = await findTargetAuthUserByEmail(toEmail, fromPrimaryAuthUserId, deps.listUsers);
    } catch (error) {
      console.error("Failed to resolve merge target", error);
      return json(req, { error: "Failed to resolve target account" }, { status: 500 });
    }

    if (!targetUser) {
      try {
        await deps.updateUserEmail(fromPrimaryAuthUserId, toEmail);
      } catch (error) {
        console.error("Failed to update merge email", error);
        return json(req, { error: "Failed to update email" }, { status: 500 });
      }

      try {
        await deps.syncAccountEmail(fromAccountId, toEmail, deps.now());
      } catch (error) {
        console.error("Failed to sync merged email", error);
        return json(req, { error: "Failed to sync account email" }, { status: 500 });
      }

      let link;
      try {
        await deps.markMergeTokenUsed(mergeToken.id);
      } catch (error) {
        console.error("Failed to finalize email merge", error);
        return json(req, { error: "Failed to finalize merge" }, { status: 500 });
      }

      try {
        link = await deps.generateMagicLink(toEmail);
      } catch (error) {
        console.error("Failed to generate merge session", error);
        return manualSignInError(
          req,
          "Email updated, but sign-in could not be completed automatically. Please sign in again.",
          false,
        );
      }

      return json(req, { token_hash: link.tokenHash, merged: false });
    }

    let targetAccountId: string;
    try {
      targetAccountId = await deps.resolveAccountIdForAuthUser(targetUser.id);
    } catch (error) {
      console.error("Failed to resolve target account id", error);
      return json(req, { error: "Failed to resolve target account" }, { status: 500 });
    }

    try {
      await deps.mergeAccountData(fromAccountId, targetAccountId);
      await deps.movePasskeys(fromAccountId, targetAccountId);
      await deps.moveAccountIdentities(fromAccountId, targetAccountId);
    } catch (error) {
      console.error("Failed to merge account data", error);
      return json(req, { error: "Failed to merge account" }, { status: 500 });
    }

    try {
      await deps.markMergeTokenUsed(mergeToken.id);
    } catch (error) {
      console.error("Failed to finalize email merge", error);
      return json(req, { error: "Failed to finalize merge" }, { status: 500 });
    }

    let link;
    try {
      link = await deps.generateMagicLink(targetUser.email ?? toEmail);
    } catch (error) {
      console.error("Failed to generate merge session", error);
      return manualSignInError(
        req,
        "Accounts merged, but sign-in could not be completed automatically. Please sign in again.",
        true,
      );
    }

    try {
      const targetPrimaryAuthUserId = await deps.getPrimaryAuthUserIdForAccount(targetAccountId);
      if (fromPrimaryAuthUserId !== targetPrimaryAuthUserId) {
        await deps.deleteAuthUser(fromPrimaryAuthUserId);
      }
    } catch (error) {
      console.error("Failed to clean up merged source auth user", error);
    }

    return json(req, { token_hash: link.tokenHash, merged: true });
  };
}
