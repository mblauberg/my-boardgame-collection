import { getCorsHeaders, handleCors, requireMethod } from "../_shared/cors.ts";
import { getAccountContextFromRequest, getServiceClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const methodResponse = requireMethod(req, ["POST"]);
  if (methodResponse) return methodResponse;

  const accountContext = await getAccountContextFromRequest(req);
  const headers = getCorsHeaders(req);
  if (!accountContext) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("passkeys")
    .select("id, device_name, last_used_at, created_at")
    .eq("account_id", accountContext.accountId)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Failed to fetch passkeys" }, { status: 500, headers });
  }

  return Response.json({ passkeys: data ?? [] }, { headers });
});
