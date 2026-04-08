import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { mapTag } from "../games/gameMappers";
import { tagsKeys } from "./tagsKeys";
import { gamesKeys } from "../games/gamesKeys";
import type { TagRow } from "../games/games.types";
import type { Database } from "../../types/database";

type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];

type CreateTagInput = {
  name: string;
  slug: string;
  tagType?: string | null;
  colour?: string | null;
};

type UpdateTagInput = Partial<CreateTagInput> & { id: string };

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTagInput) => {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("tags")
        .insert({
          name: input.name,
          slug: input.slug,
          tag_type: input.tagType ?? null,
          colour: input.colour ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return mapTag(data as TagRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTagInput) => {
      const supabase = getSupabaseBrowserClient();

      const patch: TagUpdate = {};
      if (input.name !== undefined) patch.name = input.name;
      if (input.slug !== undefined) patch.slug = input.slug;
      if (input.tagType !== undefined) patch.tag_type = input.tagType;
      if (input.colour !== undefined) patch.colour = input.colour;

      const { data, error } = await supabase
        .from("tags")
        .update(patch)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return mapTag(data as TagRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gamesKeys.lists() });
    },
  });
}
