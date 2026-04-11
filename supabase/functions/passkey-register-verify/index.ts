import { verifyRegistrationResponse } from "npm:@simplewebauthn/server";
import { isoBase64URL } from "npm:@simplewebauthn/server/helpers";
import { getCorsHeaders, handleCors, requireMethod } from "../_shared/cors.ts";
import {
  getAccountContextFromRequest,
  getExpectedOrigin,
  getRpIdForRequest,
  getServiceClient,
} from "../_shared/auth.ts";

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

  const { credential, challenge, deviceName } = await req.json();
  if (!credential || !challenge) {
    return Response.json({ error: "Missing credential or challenge" }, { status: 400, headers });
  }

  const supabase = getServiceClient();
  const { data: challengeRow, error: challengeError } = await supabase
    .from("passkey_challenges")
    .select("id, challenge")
    .eq("challenge", challenge)
    .eq("account_id", accountContext.accountId)
    .gte("expires_at", new Date().toISOString())
    .single();

  if (challengeError || !challengeRow) {
    return Response.json({ error: "Invalid or expired challenge" }, { status: 401, headers });
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: getExpectedOrigin(req),
      expectedRPID: getRpIdForRequest(req),
    });
  } catch (_error) {
    return Response.json({ error: "Verification failed" }, { status: 401, headers });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return Response.json({ error: "Verification failed" }, { status: 401, headers });
  }

  const registrationCredential = verification.registrationInfo.credential;
  const transports = credential.response?.transports ?? registrationCredential.transports ?? [];

  const { error: insertError } = await supabase.from("passkeys").insert({
    account_id: accountContext.accountId,
    credential_id: registrationCredential.id,
    public_key: isoBase64URL.fromBuffer(registrationCredential.publicKey),
    counter: registrationCredential.counter,
    transports,
    device_name: deviceName ?? null,
  });

  if (insertError) {
    return Response.json({ error: "Failed to save passkey" }, { status: 500, headers });
  }

  await supabase.from("passkey_challenges").delete().eq("id", challengeRow.id);

  return Response.json({ ok: true }, { headers });
});
