import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getAccountContextFromRequest, getServiceClient, getSiteUrl } from "../_shared/auth.ts";

function createRawToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function hashToken(raw: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const accountContext = await getAccountContextFromRequest(req);
  if (!accountContext) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const { newEmail } = await req.json();
  const normalizedEmail = typeof newEmail === "string" ? newEmail.trim().toLowerCase() : "";
  if (!isValidEmail(normalizedEmail)) {
    return Response.json({ error: "Invalid email" }, { status: 400, headers: corsHeaders });
  }

  const supabase = getServiceClient();

  const { data: existingRequest } = await supabase
    .from("email_merge_tokens")
    .select("id")
    .eq("from_account_id", accountContext.accountId)
    .is("used_at", null)
    .gte("expires_at", new Date().toISOString())
    .maybeSingle();

  if (existingRequest) {
    return Response.json({ ok: true }, { headers: corsHeaders });
  }

  const rawToken = createRawToken();
  const tokenHash = await hashToken(rawToken);

  const { error: insertError } = await supabase.from("email_merge_tokens").insert({
    from_account_id: accountContext.accountId,
    to_email: normalizedEmail,
    token_hash: tokenHash,
  });

  if (insertError) {
    return Response.json({ error: "Failed to create merge request" }, { status: 500, headers: corsHeaders });
  }

  const verifyUrl = `${getSiteUrl()}/auth/callback?type=email_merge&token=${encodeURIComponent(rawToken)}`;

  const { error: emailError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: normalizedEmail,
    options: {
      redirectTo: verifyUrl,
    },
  });

  if (emailError) {
    console.error("Failed to send merge confirmation email", emailError);
  }

  return Response.json({ ok: true }, { headers: corsHeaders });
});
