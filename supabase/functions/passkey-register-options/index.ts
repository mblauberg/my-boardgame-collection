import { generateRegistrationOptions } from "npm:@simplewebauthn/server";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getRpIdForRequest, getServiceClient, getUserFromRequest } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const userId = await getUserFromRequest(req);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const supabase = getServiceClient();
  const { data: existingPasskeys } = await supabase
    .from("passkeys")
    .select("credential_id, transports")
    .eq("user_id", userId);

  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  const userEmail = userData.user?.email ?? userId;

  const options = await generateRegistrationOptions({
    rpName: "My Boardgame Collection",
    rpID: getRpIdForRequest(req),
    userID: new TextEncoder().encode(userId),
    userName: userEmail,
    userDisplayName: userEmail,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "required",
    },
    excludeCredentials: (existingPasskeys ?? []).map((passkey) => ({
      id: passkey.credential_id,
      transports: passkey.transports ?? [],
    })),
  });

  const { error: insertError } = await supabase.from("passkey_challenges").insert({
    user_id: userId,
    challenge: options.challenge,
  });

  if (insertError) {
    return Response.json({ error: "Failed to store challenge" }, { status: 500, headers: corsHeaders });
  }

  return Response.json(options, { headers: corsHeaders });
});
