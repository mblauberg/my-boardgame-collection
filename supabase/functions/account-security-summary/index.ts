import {
  AccountSecurityError,
  getAccountSecuritySummaryForRequest,
} from "../_shared/accountSecurity.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const summary = await getAccountSecuritySummaryForRequest(req);
    return Response.json(summary, { headers: corsHeaders });
  } catch (error) {
    if (error instanceof AccountSecurityError) {
      return Response.json({ error: error.message }, { status: error.status, headers: corsHeaders });
    }

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    return Response.json({ error: "Failed to load account security summary" }, { status: 500, headers: corsHeaders });
  }
});
