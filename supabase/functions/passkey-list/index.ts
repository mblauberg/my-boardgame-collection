import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getAccountContextFromRequest, getServiceClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const accountContext = await getAccountContextFromRequest(req);
  if (!accountContext) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("passkeys")
    .select("id, device_name, last_used_at, created_at")
    .eq("account_id", accountContext.accountId)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Failed to fetch passkeys" }, { status: 500, headers: corsHeaders });
  }

  return Response.json({ passkeys: data ?? [] }, { headers: corsHeaders });
});
