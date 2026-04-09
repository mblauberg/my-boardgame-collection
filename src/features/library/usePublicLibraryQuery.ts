import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { libraryKeys } from "./libraryKeys";
import type { LibraryEntry, LibraryListType } from "./library.types";
import type { Database } from "../../types/database";
import type { TagRow } from "../games/games.types";
import { mapGameRecord } from "../games/gameMappers";

type PublicLibraryRow = Database["public"]["Functions"]["get_public_library"]["Returns"][number];
type PublicLibraryRowWithOptionalHidden = PublicLibraryRow & { hidden?: boolean };
type SharedGameTagJoin = Database["public"]["Tables"]["game_tags"]["Row"] & {
  tags: TagRow | null;
};

export function usePublicLibraryQuery(username: string, listType: LibraryListType) {
  const normalizedUsername = username.trim().toLowerCase();

  return useQuery({
    queryKey: libraryKeys.public(normalizedUsername, listType),
    retry: shouldRetrySupabaseQuery,
    enabled: normalizedUsername.length > 0,
    queryFn: async (): Promise<{ username: string; entries: LibraryEntry[] } | null> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("get_public_library", {
        p_username: normalizedUsername,
        p_list_type: listType,
      });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const rows = (data as PublicLibraryRowWithOptionalHidden[]).filter((row) => !row.hidden);
      if (rows.length === 0) return null;

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

      const entries: LibraryEntry[] = rows.map((row) => {
        const sharedTagRows = sharedTagsByGameId.get(row.game_id) ?? [];
        const sharedTags = sharedTagRows.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          tagType: tag.tag_type,
          colour: tag.colour,
        }));

        return {
          id: row.library_entry_id,
          userId: row.profile_id,
          gameId: row.game_id,
          isSaved: listType === "saved",
          isLoved: false,
          isInCollection: listType === "collection",
          listType,
          sentiment: null,
          notes: null,
          priority: null,
          game: mapGameRecord({
            id: row.game_id,
            name: row.game_name,
            slug: row.game_slug,
            bgg_id: row.bgg_id,
            bgg_url: row.bgg_url,
            status: "archived",
            buy_priority: null,
            bgg_rating: row.bgg_rating,
            bgg_weight: row.bgg_weight,
            players_min: row.players_min,
            players_max: row.players_max,
            play_time_min: row.play_time_min,
            play_time_max: row.play_time_max,
            category: row.category,
            summary: row.summary,
            notes: null,
            recommendation_verdict: null,
            recommendation_colour: null,
            gap_reason: null,
            is_expansion_included: row.is_expansion_included,
            image_url: row.image_url,
            published_year: row.published_year,
            hidden: false,
            created_at: row.saved_at,
            updated_at: row.saved_at,
            tags: sharedTagRows,
          }),
          sharedTags,
          userTags: [],
        };
      });

      return {
        username: rows[0].username,
        entries,
      };
    },
  });
}
