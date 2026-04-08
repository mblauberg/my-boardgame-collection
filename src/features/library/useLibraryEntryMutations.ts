import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import type { Database } from "../../types/database";
import { libraryKeys } from "./libraryKeys";
import type { LibraryListType, LibrarySentiment } from "./library.types";

type LibraryEntryRow = Database["public"]["Tables"]["library_entries"]["Row"];
type LibraryEntryUpdate = Database["public"]["Tables"]["library_entries"]["Update"];

type UpsertLibraryEntryInput = {
  userId: string;
  gameId: string;
  listType: LibraryListType;
  sentiment?: LibrarySentiment;
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

async function upsertLibraryEntry(input: UpsertLibraryEntryInput): Promise<LibraryEntryRow> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("library_entries")
    .upsert(
      {
        user_id: input.userId,
        game_id: input.gameId,
        list_type: input.listType,
        sentiment: input.sentiment ?? null,
      },
      { onConflict: "user_id,game_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data as LibraryEntryRow;
}

function invalidateLibraryQueries(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  queryClient.invalidateQueries({ queryKey: libraryKeys.lists(userId) });
}

export function useAddToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, gameId, sentiment }: Omit<UpsertLibraryEntryInput, "listType">) =>
      upsertLibraryEntry({ userId, gameId, sentiment, listType: "collection" }),
    onSuccess: (_entry, variables) => {
      invalidateLibraryQueries(queryClient, variables.userId);
    },
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, gameId, sentiment }: Omit<UpsertLibraryEntryInput, "listType">) =>
      upsertLibraryEntry({ userId, gameId, sentiment, listType: "wishlist" }),
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
      const patch: LibraryEntryUpdate = { list_type: "collection" };

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
