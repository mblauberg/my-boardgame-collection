import { generateAuthenticationOptions } from "npm:@simplewebauthn/server";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getRpIdForRequest, getServiceClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = getServiceClient();

  const options = await generateAuthenticationOptions({
    rpID: getRpIdForRequest(req),
    userVerification: "required",
    allowCredentials: [],
  });

  const { error } = await supabase.from("passkey_challenges").insert({
    user_id: null,
    challenge: options.challenge,
  });

  if (error) {
    return Response.json(
      { error: "Failed to store challenge" },
      { status: 500, headers: corsHeaders },
    );
  }

  return Response.json(options, { headers: corsHeaders });
});
