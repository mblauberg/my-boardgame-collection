import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { authKeys } from "../auth/authKeys";
import type { Profile } from "../auth/auth.types";
import type { Database } from "../../types/database";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type UpdateProfileInput = {
  id: string;
  username?: string | null;
  is_profile_public?: boolean;
  is_collection_public?: boolean;
  is_wishlist_public?: boolean;
};

function normalizeUsername(username: string | null | undefined) {
  const normalized = username?.trim().toLowerCase() ?? null;
  return normalized && normalized.length > 0 ? normalized : null;
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput): Promise<Profile> => {
      const supabase = getSupabaseBrowserClient();
      const username = normalizeUsername(input.username);

      const wantsPublicVisibility =
        input.is_profile_public === true ||
        input.is_collection_public === true ||
        input.is_wishlist_public === true;

      if (wantsPublicVisibility && !username) {
        throw new Error("Choose a username before enabling public profile visibility.");
      }

      const patch: ProfileUpdate = {};
      if (input.username !== undefined) patch.username = username;
      if (input.is_profile_public !== undefined) patch.is_profile_public = input.is_profile_public;
      if (input.is_collection_public !== undefined) {
        patch.is_collection_public = input.is_collection_public;
      }
      if (input.is_wishlist_public !== undefined) patch.is_wishlist_public = input.is_wishlist_public;

      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", input.id)
        .select("*")
        .single();

      if (error) {
        if ("code" in error && error.code === "23505") {
          throw new Error("That username is already taken.");
        }
        throw error;
      }

      return data as Profile;
    },
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile(profile.id) });
      queryClient.invalidateQueries({ queryKey: ["profiles", "public", profile.username ?? ""] });
      queryClient.invalidateQueries({ queryKey: ["profiles", "public"] });
    },
  });
}
