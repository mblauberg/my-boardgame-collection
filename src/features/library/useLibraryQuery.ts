import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { useProfile } from "../auth/useProfile";
import type { TagRow } from "../games/games.types";
import { GUEST_LIBRARY_USER_ID, readGuestLibraryEntries } from "./guestLibraryStorage";
import { libraryKeys } from "./libraryKeys";
import { mapLibraryEntryRecord, type LibraryEntryJoin, type SharedGameTagJoin } from "./libraryMappers";

export async function fetchLibraryEntries(userId: string) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("library_entries")
    .select("*, games(*), user_game_tags(library_entry_id, user_tag_id, created_at, user_tags(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const rows = data as LibraryEntryJoin[];
  const gameIds = [...new Set(rows.map((row) => row.game_id))];

  const sharedTagsByGameId = new Map<string, TagRow[]>();
  if (gameIds.length > 0) {
    const { data: gameTags, error: gameTagsError } = await supabase
      .from("game_tags")
      .select("game_id, tag_id, tags(*)")
      .in("game_id", gameIds);

    if (gameTagsError) throw gameTagsError;

    for (const join of (gameTags ?? []) as SharedGameTagJoin[]) {
      if (!join.tags) continue;
      const current = sharedTagsByGameId.get(join.game_id) ?? [];
      current.push(join.tags);
      sharedTagsByGameId.set(join.game_id, current);
    }
  }

  return rows.map((row) => mapLibraryEntryRecord(row, sharedTagsByGameId.get(row.game_id) ?? []));
}

export function useLibraryQuery() {
  const { profile, isAuthenticated } = useProfile();
  const userId = profile?.id;
  const queryScope = isAuthenticated && userId ? userId : GUEST_LIBRARY_USER_ID;

  return useQuery({
    queryKey: libraryKeys.library(queryScope),
    retry: shouldRetrySupabaseQuery,
    enabled: isAuthenticated ? !!userId : true,
    queryFn: async () => {
      if (!isAuthenticated || !userId) {
        return readGuestLibraryEntries();
      }
      return fetchLibraryEntries(userId);
    },
  });
}
