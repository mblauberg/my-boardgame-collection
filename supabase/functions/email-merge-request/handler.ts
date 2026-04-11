import { getCorsHeaders, handleCors, requireMethod } from "../_shared/cors.ts";

export type EmailMergeRequestDeps = {
  getAccountContextFromRequest(req: Request): Promise<{ accountId: string } | null>;
  findActiveMergeRequest(accountId: string): Promise<{ id: string } | null>;
  createMergeRequest(input: {
    fromAccountId: string;
    toEmail: string;
    tokenHash: string;
  }): Promise<{ id: string }>;
  deleteMergeRequest(id: string): Promise<void>;
  generateConfirmationLink(email: string, verifyUrl: string): Promise<void>;
  createRawToken(): string;
  hashToken(raw: string): Promise<string>;
  getSiteUrl(): string;
};

function json(req: Request, body: unknown, init?: ResponseInit): Response {
  return Response.json(body, {
    ...init,
    headers: getCorsHeaders(req, init?.headers),
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function createEmailMergeRequestHandler(deps: EmailMergeRequestDeps) {
  return async (req: Request): Promise<Response> => {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const methodResponse = requireMethod(req, ["POST"]);
    if (methodResponse) return methodResponse;

    const accountContext = await deps.getAccountContextFromRequest(req);
    if (!accountContext) {
      return json(req, { error: "Unauthorized" }, { status: 401 });
    }

    const { newEmail } = await req.json();
    const normalizedEmail = typeof newEmail === "string" ? newEmail.trim().toLowerCase() : "";
    if (!isValidEmail(normalizedEmail)) {
      return json(req, { error: "Invalid email" }, { status: 400 });
    }

    const existingRequest = await deps.findActiveMergeRequest(accountContext.accountId);
    if (existingRequest) {
      return json(req, { ok: true });
    }

    const rawToken = deps.createRawToken();
    const tokenHash = await deps.hashToken(rawToken);
    const mergeRequest = await deps.createMergeRequest({
      fromAccountId: accountContext.accountId,
      toEmail: normalizedEmail,
      tokenHash,
    });

    const verifyUrl = `${deps.getSiteUrl()}/auth/callback?type=email_merge&token=${encodeURIComponent(rawToken)}`;

    try {
      await deps.generateConfirmationLink(normalizedEmail, verifyUrl);
    } catch (error) {
      try {
        await deps.deleteMergeRequest(mergeRequest.id);
      } catch (cleanupError) {
        console.error("Failed to clean up merge request after confirmation link error", cleanupError);
      }

      console.error("Failed to create merge confirmation email", error);
      return json(req, { error: "Failed to create confirmation email" }, { status: 500 });
    }

    return json(req, { ok: true });
  };
}
