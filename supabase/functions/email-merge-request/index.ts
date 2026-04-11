import { getAccountContextFromRequest, getServiceClient, getSiteUrl } from "../_shared/auth.ts";
import { createEmailMergeRequestHandler } from "./handler.ts";

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

const handler = createEmailMergeRequestHandler({
  getAccountContextFromRequest,
  async findActiveMergeRequest(accountId) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("email_merge_tokens")
      .select("id")
      .eq("from_account_id", accountId)
      .is("used_at", null)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
  async createMergeRequest({ fromAccountId, toEmail, tokenHash }) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("email_merge_tokens")
      .insert({
        from_account_id: fromAccountId,
        to_email: toEmail,
        token_hash: tokenHash,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create merge request");
    }

    return { id: data.id };
  },
  async deleteMergeRequest(id) {
    const supabase = getServiceClient();
    const { error } = await supabase.from("email_merge_tokens").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },
  async generateConfirmationLink(email, verifyUrl) {
    const supabase = getServiceClient();
    const { error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: verifyUrl,
      },
    });

    if (error) {
      throw error;
    }
  },
  createRawToken,
  hashToken,
  getSiteUrl,
});

Deno.serve(handler);
