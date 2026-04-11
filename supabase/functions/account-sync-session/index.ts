import {
  syncCurrentAccountSecurity,
  AccountSecurityError,
  getAccountSecuritySummaryForRequest,
} from "../_shared/accountSecurity.ts";
import { getCorsHeaders, handleCors, requireMethod } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const methodResponse = requireMethod(req, ["POST"]);
  if (methodResponse) return methodResponse;

  const headers = getCorsHeaders(req);
  try {
    await syncCurrentAccountSecurity(req);
    const summary = await getAccountSecuritySummaryForRequest(req);
    return Response.json(
      { ok: true, needsPasskeyPrompt: summary.passkeys.length === 0 },
      { headers },
    );
  } catch (error) {
    if (error instanceof AccountSecurityError) {
      return Response.json({ error: error.message }, { status: error.status, headers });
    }

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500, headers });
    }

    return Response.json({ error: "Failed to sync account security" }, { status: 500, headers });
  }
});
