import { syncCurrentAccountSecurity, AccountSecurityError } from "../_shared/accountSecurity.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    await syncCurrentAccountSecurity(req);
    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    if (error instanceof AccountSecurityError) {
      return Response.json({ error: error.message }, { status: error.status, headers: corsHeaders });
    }

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    return Response.json({ error: "Failed to sync account security" }, { status: 500, headers: corsHeaders });
  }
});
