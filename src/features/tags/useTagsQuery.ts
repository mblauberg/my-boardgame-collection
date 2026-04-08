import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { mapTag } from "../games/gameMappers";
import { tagsKeys } from "./tagsKeys";
import type { TagRow } from "../games/games.types";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";

export function useTagsQuery() {
  return useQuery({
    queryKey: tagsKeys.list(),
    retry: shouldRetrySupabaseQuery,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("tag_type", { ascending: true, nullsFirst: false })
        .order("name");

      if (error) throw error;
      if (!data) return [];

      return (data as TagRow[]).map(mapTag);
    },
  });
}
