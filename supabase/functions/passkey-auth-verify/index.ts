import { verifyAuthenticationResponse } from "npm:@simplewebauthn/server";
import { isoBase64URL } from "npm:@simplewebauthn/server/helpers";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getExpectedOrigin, getRpIdForRequest, getServiceClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const { credential, challenge } = await req.json();
  if (!credential?.id || !challenge) {
    return Response.json({ error: "Missing credential or challenge" }, { status: 400, headers: corsHeaders });
  }

  const supabase = getServiceClient();

  const { data: challengeRow, error: challengeError } = await supabase
    .from("passkey_challenges")
    .select("id, challenge")
    .eq("challenge", challenge)
    .is("user_id", null)
    .gte("expires_at", new Date().toISOString())
    .single();

  if (challengeError || !challengeRow) {
    return Response.json({ error: "Invalid or expired challenge" }, { status: 401, headers: corsHeaders });
  }

  const { data: passkey, error: passkeyError } = await supabase
    .from("passkeys")
    .select("user_id, credential_id, public_key, counter, transports")
    .eq("credential_id", credential.id)
    .single();

  if (passkeyError || !passkey) {
    return Response.json({ error: "Passkey not found" }, { status: 401, headers: corsHeaders });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: getExpectedOrigin(req),
      expectedRPID: getRpIdForRequest(req),
      credential: {
        id: passkey.credential_id,
        publicKey: isoBase64URL.toBuffer(passkey.public_key),
        counter: passkey.counter,
        transports: passkey.transports ?? [],
      },
    });
  } catch (_error) {
    return Response.json({ error: "Verification failed" }, { status: 401, headers: corsHeaders });
  }

  if (!verification.verified) {
    return Response.json({ error: "Verification failed" }, { status: 401, headers: corsHeaders });
  }

  const { error: updateError } = await supabase
    .from("passkeys")
    .update({
      counter: verification.authenticationInfo.newCounter,
      last_used_at: new Date().toISOString(),
    })
    .eq("credential_id", credential.id);

  if (updateError) {
    return Response.json({ error: "Failed to update passkey usage" }, { status: 500, headers: corsHeaders });
  }

  await supabase.from("passkey_challenges").delete().eq("id", challengeRow.id);

  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(passkey.user_id);
  const email = userData.user?.email;
  if (userError || !email) {
    return Response.json({ error: "User not found" }, { status: 500, headers: corsHeaders });
  }

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError || !linkData.properties?.hashed_token) {
    return Response.json({ error: "Session generation failed" }, { status: 500, headers: corsHeaders });
  }

  return Response.json({ token_hash: linkData.properties.hashed_token }, { headers: corsHeaders });
});
