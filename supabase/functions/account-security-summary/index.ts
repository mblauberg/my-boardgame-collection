import {
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
    const summary = await getAccountSecuritySummaryForRequest(req);
    return Response.json(summary, { headers });
  } catch (error) {
    if (error instanceof AccountSecurityError) {
      return Response.json({ error: error.message }, { status: error.status, headers });
    }

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500, headers });
    }

    return Response.json({ error: "Failed to load account security summary" }, { status: 500, headers });
  }
});
