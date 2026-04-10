import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { slugify } from "../../lib/utils/slugify";
import type { Database } from "../../types/database";
import { libraryKeys } from "./libraryKeys";
import type { LibrarySentiment } from "./library.types";
import { normalizeLibraryStateSnapshot } from "./libraryState";

type LibraryEntryRow = Database["public"]["Tables"]["library_entries"]["Row"];
type LibraryEntryUpdate = Database["public"]["Tables"]["library_entries"]["Update"];

type UpsertLibraryStateInput = {
  accountId: string;
  gameId: string;
  isSaved: boolean;
  isLoved: boolean;
  isInCollection: boolean;
  sentiment?: LibrarySentiment;
  notes?: string | null;
};

type UpdateSentimentInput = {
  id: string;
  accountId: string;
  sentiment: LibrarySentiment;
};

type DeleteLibraryEntryInput = {
  id: string;
  accountId: string;
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
  accountId: string;
  selectedGame: BggSelectedGame;
  isSaved: boolean;
  isLoved: boolean;
  isInCollection: boolean;
  sentiment?: LibrarySentiment;
  notes?: string | null;
};

function resolveNormalizedLibraryState(
  input: Pick<
    UpsertLibraryStateInput,
    "isSaved" | "isLoved" | "isInCollection" | "sentiment" | "notes"
  >,
) {
  return normalizeLibraryStateSnapshot({
    isSaved: input.isSaved,
    isLoved: input.isLoved,
    isInCollection: input.isInCollection,
    sentiment: input.sentiment ?? null,
    notes: input.notes ?? null,
  });
}

async function upsertLibraryState(input: UpsertLibraryStateInput): Promise<LibraryEntryRow> {
  const supabase = getSupabaseBrowserClient();
  const nextState = resolveNormalizedLibraryState(input);

  const { data, error } = await supabase
    .from("library_entries")
    .upsert(
      {
        account_id: input.accountId,
        game_id: input.gameId,
        is_saved: nextState.isSaved,
        is_loved: nextState.isLoved,
        is_in_collection: nextState.isInCollection,
        sentiment: nextState.sentiment,
        notes: nextState.notes,
      },
      { onConflict: "account_id,game_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data as LibraryEntryRow;
}

function invalidateLibraryQueries(queryClient: ReturnType<typeof useQueryClient>, accountId: string) {
  queryClient.invalidateQueries({ queryKey: libraryKeys.library(accountId) });
  queryClient.invalidateQueries({ queryKey: libraryKeys.lists(accountId) });
}

export function useUpsertLibraryState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertLibraryStateInput) => upsertLibraryState(input),
    onSuccess: (_entry, variables) => {
      invalidateLibraryQueries(queryClient, variables.accountId);
    },
  });
}

export function useAddToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      gameId,
      sentiment,
    }: Omit<UpsertLibraryStateInput, "isSaved" | "isLoved" | "isInCollection" | "notes">) =>
      upsertLibraryState({
        accountId,
        gameId,
        sentiment,
        isSaved: false,
        isLoved: false,
        isInCollection: true,
    }),
    onSuccess: (_entry, variables) => {
      invalidateLibraryQueries(queryClient, variables.accountId);
    },
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      gameId,
      sentiment,
    }: Omit<UpsertLibraryStateInput, "isSaved" | "isLoved" | "isInCollection" | "notes">) =>
      upsertLibraryState({
        accountId,
        gameId,
        sentiment,
        isSaved: true,
        isLoved: false,
        isInCollection: false,
    }),
    onSuccess: (_entry, variables) => {
      invalidateLibraryQueries(queryClient, variables.accountId);
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
      invalidateLibraryQueries(queryClient, variables.accountId);
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
      invalidateLibraryQueries(queryClient, variables.accountId);
    },
  });
}

export function useSaveBggGameToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      selectedGame,
      isSaved,
      isLoved,
      isInCollection,
      sentiment,
      notes,
    }: SaveBggGameInput) => {
      const supabase = getSupabaseBrowserClient();
      const nextState = resolveNormalizedLibraryState({
        isSaved,
        isLoved,
        isInCollection,
        sentiment,
        notes,
      });
      const { data, error } = await supabase.rpc("save_bgg_game_for_account", {
        p_account_id: accountId,
        p_bgg_id: selectedGame.id,
        p_name: selectedGame.name,
        p_slug: slugify(selectedGame.name),
        p_bgg_url: selectedGame.bggUrl,
        p_image_url: selectedGame.imageUrl ?? undefined,
        p_published_year: selectedGame.yearPublished ?? undefined,
        p_players_min: selectedGame.playersMin ?? undefined,
        p_players_max: selectedGame.playersMax ?? undefined,
        p_play_time_min: selectedGame.playTimeMin ?? undefined,
        p_play_time_max: selectedGame.playTimeMax ?? undefined,
        p_bgg_rating: selectedGame.averageRating ?? undefined,
        p_bgg_weight: selectedGame.averageWeight ?? undefined,
        p_summary: selectedGame.summary ?? undefined,
        p_is_saved: nextState.isSaved,
        p_is_loved: nextState.isLoved,
        p_is_in_collection: nextState.isInCollection,
        p_sentiment: nextState.sentiment ?? undefined,
        p_notes: nextState.notes ?? undefined,
      });

      if (error) throw error;
      return data as LibraryEntryRow;
    },
    onSuccess: (_entry, variables) => {
      invalidateLibraryQueries(queryClient, variables.accountId);
    },
  });
}
