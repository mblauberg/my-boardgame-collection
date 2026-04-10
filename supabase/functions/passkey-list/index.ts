import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getServiceClient, getUserFromRequest } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const userId = await getUserFromRequest(req);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("passkeys")
    .select("id, device_name, last_used_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Failed to fetch passkeys" }, { status: 500, headers: corsHeaders });
  }

  return Response.json({ passkeys: data ?? [] }, { headers: corsHeaders });
});
