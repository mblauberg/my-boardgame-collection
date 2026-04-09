import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { mapGameRecord } from "./gameMappers";
import { gamesKeys } from "./gamesKeys";
import type { GameWithTags, GameRow } from "./games.types";
import type { Database } from "../../types/database";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { fetchAllRows } from "../../lib/supabase/fetchAllRows";

type GameTagJoin = {
  game_id: string;
  tag_id: string;
  tags: Database["public"]["Tables"]["tags"]["Row"] | null;
};

export function useGamesQuery() {
  return useQuery({
    queryKey: gamesKeys.list({}),
    retry: shouldRetrySupabaseQuery,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      const games = await fetchAllRows<GameRow>(async (from, to) =>
        await supabase
          .from("games")
          .select("*")
          .eq("hidden", false)
          .order("name")
          .order("id")
          .range(from, to),
      );
      if (!games) return [];

      const gameTags = await fetchAllRows<GameTagJoin>(async (from, to) =>
        await supabase
          .from("game_tags")
          .select("game_id, tag_id, tags(*)")
          .order("game_id")
          .order("tag_id")
          .range(from, to),
      );

      const tagsByGameId = new Map<string, NonNullable<GameTagJoin["tags"]>[]>();
      for (const gameTag of gameTags) {
        if (!gameTag.tags) continue;
        const current = tagsByGameId.get(gameTag.game_id) ?? [];
        current.push(gameTag.tags);
        tagsByGameId.set(gameTag.game_id, current);
      }

      const gamesWithTags: GameWithTags[] = games.map((game) => ({
        ...game,
        tags: tagsByGameId.get(game.id) ?? [],
      }));

      return gamesWithTags.map(mapGameRecord);
    },
  });
}
