import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { mapGameRecord } from "./gameMappers";
import { gamesKeys } from "./gamesKeys";
import type { GameWithTags, GameRow } from "./games.types";
import type { Database } from "../../types/database";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";

type GameTagJoin = {
  tag_id: string;
  tags: Database["public"]["Tables"]["tags"]["Row"] | null;
};

export function useGameDetailQuery(slug: string) {
  return useQuery({
    queryKey: gamesKeys.detail(slug),
    retry: shouldRetrySupabaseQuery,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      const { data: game, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("slug", slug)
        .eq("hidden", false)
        .single();

      if (gameError) throw gameError;
      if (!game) throw new Error("Game not found");

      const { data: gameTags, error: gameTagsError } = await supabase
        .from("game_tags")
        .select("tag_id, tags(*)")
        .eq("game_id", (game as GameRow).id);

      if (gameTagsError) throw gameTagsError;

      const gameWithTags: GameWithTags = {
        ...(game as GameRow),
        tags: (gameTags as GameTagJoin[])
          .map((gt) => gt.tags)
          .filter((tag): tag is NonNullable<typeof tag> => tag !== null),
      };

      return mapGameRecord(gameWithTags);
    },
  });
}
