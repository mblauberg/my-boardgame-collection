import { generateAuthenticationOptions } from "npm:@simplewebauthn/server";
import { getCorsHeaders, handleCors, requireMethod } from "../_shared/cors.ts";
import { getRpIdForRequest, getServiceClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const methodResponse = requireMethod(req, ["POST"]);
  if (methodResponse) return methodResponse;

  const supabase = getServiceClient();
  const headers = getCorsHeaders(req);

  const options = await generateAuthenticationOptions({
    rpID: getRpIdForRequest(req),
    userVerification: "required",
    allowCredentials: [],
  });

  const { error } = await supabase.from("passkey_challenges").insert({
    account_id: null,
    challenge: options.challenge,
  });

  if (error) {
    return Response.json(
      { error: "Failed to store challenge" },
      { status: 500, headers },
    );
  }

  return Response.json(options, { headers });
});
