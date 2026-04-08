import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { gamesKeys } from "./gamesKeys";
import type { GameRow } from "./games.types";
import type { GameStatus } from "../../types/domain";
import type { Database } from "../../types/database";

type GameUpdate = Database["public"]["Tables"]["games"]["Update"];

type CreateGameInput = {
  name: string;
  slug: string;
  status: GameStatus;
  bggId?: number | null;
  bggUrl?: string | null;
  buyPriority?: number | null;
  bggRating?: number | null;
  bggWeight?: number | null;
  playersMin?: number | null;
  playersMax?: number | null;
  playTimeMin?: number | null;
  playTimeMax?: number | null;
  category?: string | null;
  summary?: string | null;
  notes?: string | null;
  recommendationVerdict?: string | null;
  recommendationColour?: string | null;
  gapReason?: string | null;
  imageUrl?: string | null;
  publishedYear?: number | null;
  hidden?: boolean;
};

type UpdateGameInput = Partial<CreateGameInput> & { id: string };

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGameInput): Promise<GameRow> => {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("games")
        .insert({
          name: input.name,
          slug: input.slug,
          status: input.status,
          bgg_id: input.bggId ?? null,
          bgg_url: input.bggUrl ?? null,
          buy_priority: input.buyPriority ?? null,
          bgg_rating: input.bggRating ?? null,
          bgg_weight: input.bggWeight ?? null,
          players_min: input.playersMin ?? null,
          players_max: input.playersMax ?? null,
          play_time_min: input.playTimeMin ?? null,
          play_time_max: input.playTimeMax ?? null,
          category: input.category ?? null,
          summary: input.summary ?? null,
          notes: input.notes ?? null,
          recommendation_verdict: input.recommendationVerdict ?? null,
          recommendation_colour: input.recommendationColour ?? null,
          gap_reason: input.gapReason ?? null,
          image_url: input.imageUrl ?? null,
          published_year: input.publishedYear ?? null,
          hidden: input.hidden ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as GameRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamesKeys.lists() });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateGameInput): Promise<GameRow> => {
      const supabase = getSupabaseBrowserClient();

      const patch: GameUpdate = {};
      if (input.name !== undefined) patch.name = input.name;
      if (input.slug !== undefined) patch.slug = input.slug;
      if (input.status !== undefined) patch.status = input.status;
      if (input.bggId !== undefined) patch.bgg_id = input.bggId;
      if (input.bggUrl !== undefined) patch.bgg_url = input.bggUrl;
      if (input.buyPriority !== undefined) patch.buy_priority = input.buyPriority;
      if (input.bggRating !== undefined) patch.bgg_rating = input.bggRating;
      if (input.bggWeight !== undefined) patch.bgg_weight = input.bggWeight;
      if (input.playersMin !== undefined) patch.players_min = input.playersMin;
      if (input.playersMax !== undefined) patch.players_max = input.playersMax;
      if (input.playTimeMin !== undefined) patch.play_time_min = input.playTimeMin;
      if (input.playTimeMax !== undefined) patch.play_time_max = input.playTimeMax;
      if (input.category !== undefined) patch.category = input.category;
      if (input.summary !== undefined) patch.summary = input.summary;
      if (input.notes !== undefined) patch.notes = input.notes;
      if (input.recommendationVerdict !== undefined) patch.recommendation_verdict = input.recommendationVerdict;
      if (input.recommendationColour !== undefined) patch.recommendation_colour = input.recommendationColour;
      if (input.gapReason !== undefined) patch.gap_reason = input.gapReason;
      if (input.imageUrl !== undefined) patch.image_url = input.imageUrl;
      if (input.publishedYear !== undefined) patch.published_year = input.publishedYear;
      if (input.hidden !== undefined) patch.hidden = input.hidden;

      const { data, error } = await supabase
        .from("games")
        .update(patch)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data as GameRow;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: gamesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gamesKeys.details() });
    },
  });
}

export function useUpdateGameTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId, tagIds }: { gameId: string; tagIds: string[] }) => {
      const supabase = getSupabaseBrowserClient();

      const { error: deleteError } = await supabase
        .from("game_tags")
        .delete()
        .eq("game_id", gameId);

      if (deleteError) throw deleteError;

      if (tagIds.length === 0) return;

      const rows = tagIds.map((tagId) => ({ game_id: gameId, tag_id: tagId }));
      const { error: insertError } = await supabase.from("game_tags").insert(rows);

      if (insertError) throw insertError;
    },
    onSuccess: (_data, { gameId }) => {
      queryClient.invalidateQueries({ queryKey: gamesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gamesKeys.details() });
    },
  });
}
