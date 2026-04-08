import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { mapGameRecord } from "./gameMappers";
import { gamesKeys } from "./gamesKeys";
import type { GameWithTags, GameRow } from "./games.types";
import type { Database } from "../../types/database";

type GameTagJoin = {
  game_id: string;
  tag_id: string;
  tags: Database["public"]["Tables"]["tags"]["Row"] | null;
};

export function useAdminGamesQuery() {
  return useQuery({
    queryKey: gamesKeys.list({ admin: true }),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      const { data: games, error: gamesError } = await supabase
        .from("games")
        .select("*")
        .order("name");

      if (gamesError) throw gamesError;
      if (!games) return [];

      const { data: gameTags, error: gameTagsError } = await supabase
        .from("game_tags")
        .select("game_id, tag_id, tags(*)");

      if (gameTagsError) throw gameTagsError;

      const gamesWithTags: GameWithTags[] = (games as GameRow[]).map((game) => ({
        ...game,
        tags: (gameTags as GameTagJoin[])
          .filter((gt) => gt.game_id === game.id)
          .map((gt) => gt.tags)
          .filter((tag): tag is NonNullable<typeof tag> => tag !== null),
      }));

      return gamesWithTags.map(mapGameRecord);
    },
  });
}
