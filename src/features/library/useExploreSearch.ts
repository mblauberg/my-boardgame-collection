import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { mapGameRecord } from "../games/gameMappers";
import type { GameRow, GameWithTags, TagRow } from "../games/games.types";
import { libraryKeys } from "./libraryKeys";

type GameTagJoin = {
  game_id: string;
  tag_id: string;
  tags: TagRow | null;
};

async function fetchTagsByGameId(gameIds: string[]) {
  if (gameIds.length === 0) return new Map<string, TagRow[]>();

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("game_tags")
    .select("game_id, tag_id, tags(*)")
    .in("game_id", gameIds);

  if (error) throw error;

  const tagsByGameId = new Map<string, TagRow[]>();
  for (const join of (data ?? []) as GameTagJoin[]) {
    if (!join.tags) continue;
    const current = tagsByGameId.get(join.game_id) ?? [];
    current.push(join.tags);
    tagsByGameId.set(join.game_id, current);
  }

  return tagsByGameId;
}

async function searchGames(query: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("hidden", false)
    .ilike("name", `%${query}%`)
    .order("bgg_usersrated", { ascending: false })
    .limit(20);

  if (error) throw error;

  const rows = (data ?? []) as GameRow[];
  const tagsByGameId = await fetchTagsByGameId(rows.map((r) => r.id));

  return rows.map((row) =>
    mapGameRecord({
      ...(row as GameWithTags),
      tags: tagsByGameId.get(row.id) ?? [],
    })
  );
}

export function useExploreSearch(query: string) {
  return useQuery({
    queryKey: libraryKeys.exploreSearch(query),
    queryFn: () => searchGames(query),
    retry: shouldRetrySupabaseQuery,
    enabled: query.trim().length > 0,
  });
}
