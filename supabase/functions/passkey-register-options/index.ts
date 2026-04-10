import { generateRegistrationOptions } from "npm:@simplewebauthn/server";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import {
  getAccountContextFromRequest,
  getAuthUserFromRequest,
  getRpIdForRequest,
  getServiceClient,
} from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const authUser = await getAuthUserFromRequest(req);
  const accountContext = await getAccountContextFromRequest(req);
  if (!authUser || !accountContext) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const supabase = getServiceClient();
  const { data: existingPasskeys } = await supabase
    .from("passkeys")
    .select("credential_id, transports")
    .eq("account_id", accountContext.accountId);

  const userEmail = authUser.email ?? accountContext.primaryAuthUserId;

  const options = await generateRegistrationOptions({
    rpName: "My Boardgame Collection",
    rpID: getRpIdForRequest(req),
    userID: new TextEncoder().encode(accountContext.accountId),
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
    account_id: accountContext.accountId,
    challenge: options.challenge,
  });

  if (insertError) {
    return Response.json({ error: "Failed to store challenge" }, { status: 500, headers: corsHeaders });
  }

  return Response.json(options, { headers: corsHeaders });
});
