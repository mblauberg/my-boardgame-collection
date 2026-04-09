import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import type { Database } from "../../types/database";
import { libraryKeys } from "./libraryKeys";
import type { LibrarySentiment } from "./library.types";

type LibraryEntryRow = Database["public"]["Tables"]["library_entries"]["Row"];
type LibraryEntryUpdate = Database["public"]["Tables"]["library_entries"]["Update"];

type UpsertLibraryStateInput = {
  userId: string;
  gameId: string;
  isSaved: boolean;
  isLoved: boolean;
  isInCollection: boolean;
  sentiment?: LibrarySentiment;
  notes?: string | null;
};

type MoveLibraryEntryInput = {
  id: string;
  userId: string;
};

type UpdateSentimentInput = {
  id: string;
  userId: string;
  sentiment: LibrarySentiment;
};

type DeleteLibraryEntryInput = {
  id: string;
  userId: string;
};

type BggSelectedGame = {
  id: number;
  name: string;
  bggUrl: string;
  imageUrl: string | null;
  yearPublished: number | null;
  playersMin: number | null;
  playersMax: number | null;
  playTimeMin: number | null;
  playTimeMax: number | null;
  averageRating: number | null;
  averageWeight: number | null;
  summary: string | null;
};

type SaveBggGameInput = {
  userId: string;
  selectedGame: BggSelectedGame;
  isSaved: boolean;
  isLoved: boolean;
  isInCollection: boolean;
  sentiment?: LibrarySentiment;
  notes?: string | null;
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deriveLegacyListType(input: Pick<UpsertLibraryStateInput, "isSaved" | "isInCollection">) {
  return input.isInCollection ? "collection" : "wishlist";
}

async function upsertLibraryState(input: UpsertLibraryStateInput): Promise<LibraryEntryRow> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("library_entries")
    .upsert(
      {
        user_id: input.userId,
        game_id: input.gameId,
        is_saved: input.isSaved,
        is_loved: input.isLoved,
        is_in_collection: input.isInCollection,
        list_type: deriveLegacyListType(input),
        sentiment: input.sentiment ?? null,
        notes: input.notes ?? null,
      },
      { onConflict: "user_id,game_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data as LibraryEntryRow;
}

function invalidateLibraryQueries(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  queryClient.invalidateQueries({ queryKey: libraryKeys.library(userId) });
  queryClient.invalidateQueries({ queryKey: libraryKeys.lists(userId) });
}

export function useUpsertLibraryState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertLibraryStateInput) => upsertLibraryState(input),
    onSuccess: (_entry, variables) => {
      invalidateLibraryQueries(queryClient, variables.userId);
    },
  });
}

export function useAddToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      gameId,
      sentiment,
    }: Omit<UpsertLibraryStateInput, "isSaved" | "isLoved" | "isInCollection" | "notes">) =>
      upsertLibraryState({
        userId,
        gameId,
        sentiment,
        isSaved: false,
        isLoved: false,
        isInCollection: true,
      }),
    onSuccess: (_entry, variables) => {
      invalidateLibraryQueries(queryClient, variables.userId);
    },
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      gameId,
      sentiment,
    }: Omit<UpsertLibraryStateInput, "isSaved" | "isLoved" | "isInCollection" | "notes">) =>
      upsertLibraryState({
        userId,
        gameId,
        sentiment,
        isSaved: true,
        isLoved: false,
        isInCollection: false,
      }),
    onSuccess: (_entry, variables) => {
      invalidateLibraryQueries(queryClient, variables.userId);
    },
  });
}

export function useMoveWishlistToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: MoveLibraryEntryInput) => {
      const supabase = getSupabaseBrowserClient();
      const patch: LibraryEntryUpdate = { is_in_collection: true };

      const { data, error } = await supabase
        .from("library_entries")
        .update(patch)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LibraryEntryRow;
    },
    onSuccess: (_entry, variables) => {
      invalidateLibraryQueries(queryClient, variables.userId);
    },
  });
}

export function useUpdateLibraryEntrySentiment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sentiment }: UpdateSentimentInput) => {
      const supabase = getSupabaseBrowserClient();
      const patch: LibraryEntryUpdate = { sentiment };

      const { data, error } = await supabase
        .from("library_entries")
        .update(patch)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LibraryEntryRow;
    },
    onSuccess: (_entry, variables) => {
      invalidateLibraryQueries(queryClient, variables.userId);
    },
  });
}

export function useDeleteLibraryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteLibraryEntryInput) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("library_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_entry, variables) => {
      invalidateLibraryQueries(queryClient, variables.userId);
    },
  });
}

export function useSaveBggGameToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      selectedGame,
      isSaved,
      isLoved,
      isInCollection,
      sentiment,
      notes,
    }: SaveBggGameInput) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("save_bgg_game_for_user", {
        p_user_id: userId,
        p_bgg_id: selectedGame.id,
        p_name: selectedGame.name,
        p_slug: slugify(selectedGame.name),
        p_bgg_url: selectedGame.bggUrl,
        p_image_url: selectedGame.imageUrl,
        p_published_year: selectedGame.yearPublished,
        p_players_min: selectedGame.playersMin,
        p_players_max: selectedGame.playersMax,
        p_play_time_min: selectedGame.playTimeMin,
        p_play_time_max: selectedGame.playTimeMax,
        p_bgg_rating: selectedGame.averageRating,
        p_bgg_weight: selectedGame.averageWeight,
        p_summary: selectedGame.summary,
        p_is_saved: isSaved,
        p_is_loved: isLoved,
        p_is_in_collection: isInCollection,
        p_list_type: deriveLegacyListType({ isSaved, isInCollection }),
        p_sentiment: sentiment ?? null,
        p_notes: notes ?? null,
      });

      if (error) throw error;
      return data as LibraryEntryRow;
    },
    onSuccess: (_entry, variables) => {
      invalidateLibraryQueries(queryClient, variables.userId);
    },
  });
}
