import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getServiceClient, getUserFromRequest } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const userId = await getUserFromRequest(req);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const { passkeyId } = await req.json();
  if (!passkeyId) {
    return Response.json({ error: "passkeyId required" }, { status: 400, headers: corsHeaders });
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("passkeys")
    .delete()
    .eq("id", passkeyId)
    .eq("user_id", userId);

  if (error) {
    return Response.json({ error: "Failed to delete passkey" }, { status: 500, headers: corsHeaders });
  }

  return Response.json({ ok: true }, { headers: corsHeaders });
});
