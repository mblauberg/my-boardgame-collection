import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { useAccount } from "../accounts/useAccount";
import type { TagRow } from "../games/games.types";
import { libraryKeys } from "./libraryKeys";
import { mapLibraryEntryRecord, type LibraryEntryJoin, type SharedGameTagJoin } from "./libraryMappers";
import { GUEST_LIBRARY_USER_ID, readGuestLibraryEntries } from "./guestLibraryStorage";

export async function fetchLibraryEntries(accountId: string) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("library_entries")
    .select("*, games(*), user_game_tags(library_entry_id, user_tag_id, created_at, user_tags(*))")
    .eq("account_id", accountId)
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
  const { account, isAuthenticated, isLoading } = useAccount();
  const accountId = account?.id;

  // Guests use localStorage; authenticated users use Supabase.
  // Wait for auth state to resolve before running either path.
  return useQuery({
    queryKey: libraryKeys.library(isAuthenticated ? accountId : GUEST_LIBRARY_USER_ID),
    retry: shouldRetrySupabaseQuery,
    enabled: !isLoading,
    queryFn: () => {
      if (isAuthenticated && accountId) {
        return fetchLibraryEntries(accountId);
      }
      return readGuestLibraryEntries();
    },
  });
}
