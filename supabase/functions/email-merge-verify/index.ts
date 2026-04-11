import { getServiceClient } from "../_shared/auth.ts";
import { createEmailMergeVerifyHandler } from "./handler.ts";

async function hashToken(raw: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function resolveAccountIdForAuthUser(authUserId: string): Promise<string> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("account_identities")
    .select("account_id,last_seen_at")
    .eq("auth_user_id", authUserId)
    .order("last_seen_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0]?.account_id ?? authUserId;
}

async function getPrimaryAuthUserIdForAccount(accountId: string): Promise<string> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("primary_auth_user_id")
    .eq("id", accountId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.primary_auth_user_id ?? accountId;
}

const handler = createEmailMergeVerifyHandler({
  hashToken,
  async getMergeToken(tokenHash) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("email_merge_tokens")
      .select("id, from_account_id, to_email")
      .eq("token_hash", tokenHash)
      .is("used_at", null)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      fromAccountId: data.from_account_id,
      toEmail: data.to_email,
    };
  },
  async markMergeTokenUsed(id) {
    const supabase = getServiceClient();
    const { error } = await supabase
      .from("email_merge_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },
  getPrimaryAuthUserIdForAccount,
  async listUsers({ page, perPage }) {
    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw error;
    }

    return {
      users: data.users.map((user) => ({
        id: user.id,
        email: user.email ?? null,
      })),
      nextPage: data.nextPage,
    };
  },
  async updateUserEmail(authUserId, email) {
    const supabase = getServiceClient();
    const { error } = await supabase.auth.admin.updateUserById(authUserId, { email });

    if (error) {
      throw error;
    }
  },
  async syncAccountEmail(accountId, email, verifiedAt) {
    const supabase = getServiceClient();
    const { error } = await supabase.rpc("sync_account_email", {
      p_account_id: accountId,
      p_email: email,
      p_is_primary: true,
      p_verified_at: verifiedAt,
    });

    if (error) {
      throw new Error(error.message);
    }
  },
  resolveAccountIdForAuthUser,
  async mergeAccountData(fromAccountId, toAccountId) {
    const supabase = getServiceClient();
    const { error } = await supabase.rpc("merge_user_data", {
      p_from_user_id: fromAccountId,
      p_to_user_id: toAccountId,
    });

    if (error) {
      throw new Error(error.message);
    }
  },
  async movePasskeys(fromAccountId, toAccountId) {
    const supabase = getServiceClient();
    const { error } = await supabase
      .from("passkeys")
      .update({ account_id: toAccountId })
      .eq("account_id", fromAccountId);

    if (error) {
      throw new Error(error.message);
    }
  },
  async moveAccountIdentities(fromAccountId, toAccountId) {
    const supabase = getServiceClient();
    const { error } = await supabase
      .from("account_identities")
      .update({ account_id: toAccountId })
      .eq("account_id", fromAccountId);

    if (error) {
      throw new Error(error.message);
    }
  },
  async deleteAuthUser(authUserId) {
    const supabase = getServiceClient();
    const { error } = await supabase.auth.admin.deleteUser(authUserId);

    if (error) {
      throw error;
    }
  },
  async generateMagicLink(email) {
    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (error || !data.properties?.hashed_token) {
      throw error ?? new Error("Missing hashed token");
    }

    return { tokenHash: data.properties.hashed_token };
  },
  now() {
    return new Date().toISOString();
  },
});

Deno.serve(handler);
