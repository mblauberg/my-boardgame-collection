import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/auth.ts";

async function hashToken(raw: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function resolveAccountIdForAuthUser(
  authUserId: string,
): Promise<string> {
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

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const { token } = await req.json();
  if (!token || typeof token !== "string") {
    return Response.json({ error: "Token required" }, { status: 400, headers: corsHeaders });
  }

  const supabase = getServiceClient();
  const tokenHash = await hashToken(token);

  const { data: mergeToken, error: tokenError } = await supabase
    .from("email_merge_tokens")
    .select("id, from_account_id, to_email")
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gte("expires_at", new Date().toISOString())
    .single();

  if (tokenError || !mergeToken) {
    return Response.json({ error: "Invalid or expired token" }, { status: 401, headers: corsHeaders });
  }

  await supabase
    .from("email_merge_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", mergeToken.id);

  const { from_account_id: fromAccountId, to_email: toEmail } = mergeToken;
  const fromPrimaryAuthUserId = await getPrimaryAuthUserIdForAccount(fromAccountId);

  const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) {
    return Response.json({ error: "Failed to check target email" }, { status: 500, headers: corsHeaders });
  }

  const targetUser = usersPage.users.find(
    (user) => user.email?.toLowerCase() === toEmail.toLowerCase() && user.id !== fromPrimaryAuthUserId,
  );

  let merged = false;
  let survivingUserEmail = toEmail;

  if (!targetUser) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(fromPrimaryAuthUserId, {
      email: toEmail,
    });
    if (updateError) {
      return Response.json({ error: "Failed to update email" }, { status: 500, headers: corsHeaders });
    }

    const { error: syncEmailError } = await supabase.rpc("sync_account_email", {
      p_account_id: fromAccountId,
      p_email: toEmail,
      p_is_primary: true,
      p_verified_at: new Date().toISOString(),
    });
    if (syncEmailError) {
      return Response.json({ error: "Failed to sync account email" }, { status: 500, headers: corsHeaders });
    }
  } else {
    const targetAccountId = await resolveAccountIdForAuthUser(targetUser.id);

    const { error: mergeError } = await supabase.rpc("merge_user_data", {
      p_from_user_id: fromAccountId,
      p_to_user_id: targetAccountId,
    });
    if (mergeError) {
      return Response.json({ error: "Failed to merge user data" }, { status: 500, headers: corsHeaders });
    }

    const { error: movePasskeysError } = await supabase
      .from("passkeys")
      .update({ account_id: targetAccountId })
      .eq("account_id", fromAccountId);
    if (movePasskeysError) {
      return Response.json({ error: "Failed to move passkeys" }, { status: 500, headers: corsHeaders });
    }

    const { error: moveIdentitiesError } = await supabase
      .from("account_identities")
      .update({ account_id: targetAccountId })
      .eq("account_id", fromAccountId);
    if (moveIdentitiesError) {
      return Response.json({ error: "Failed to move account identities" }, { status: 500, headers: corsHeaders });
    }

    const targetPrimaryAuthUserId = await getPrimaryAuthUserIdForAccount(targetAccountId);
    if (fromPrimaryAuthUserId !== targetPrimaryAuthUserId) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(fromPrimaryAuthUserId);
      if (deleteError) {
        return Response.json({ error: "Failed to finalize merge" }, { status: 500, headers: corsHeaders });
      }
    }

    const { data: survivingUserData, error: survivingUserError } = await supabase.auth.admin.getUserById(
      targetPrimaryAuthUserId,
    );
    if (survivingUserError) {
      return Response.json({ error: "Failed to resolve surviving account" }, { status: 500, headers: corsHeaders });
    }

    survivingUserEmail = survivingUserData.user?.email ?? targetUser.email ?? toEmail;
    merged = true;
  }

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: survivingUserEmail,
  });

  if (linkError || !linkData.properties?.hashed_token) {
    return Response.json({ error: "Session generation failed" }, { status: 500, headers: corsHeaders });
  }

  return Response.json(
    { token_hash: linkData.properties.hashed_token, merged },
    { headers: corsHeaders },
  );
});
