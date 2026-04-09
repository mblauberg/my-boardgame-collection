import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../auth/useSession";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import {
  GUEST_LIBRARY_USER_ID,
  clearGuestLibraryEntries,
  readGuestLibraryEntries,
} from "./guestLibraryStorage";
import { libraryKeys } from "./libraryKeys";

export function useGuestLibrarySync() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSession();
  const syncedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      syncedUserRef.current = null;
      return;
    }

    if (syncedUserRef.current === user.id) {
      return;
    }

    const guestEntries = readGuestLibraryEntries();
    if (guestEntries.length === 0) {
      syncedUserRef.current = user.id;
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let isCancelled = false;

    const syncGuestEntries = async () => {
      for (const entry of guestEntries) {
        const { error } = await supabase.from("library_entries").upsert(
          {
            user_id: user.id,
            game_id: entry.gameId,
            is_saved: entry.isSaved,
            is_loved: entry.isLoved,
            is_in_collection: entry.isInCollection,
            sentiment: entry.sentiment,
            notes: entry.notes,
          },
          { onConflict: "user_id,game_id" },
        );

        if (error) {
          throw error;
        }
      }

      if (isCancelled) return;

      clearGuestLibraryEntries();
      queryClient.setQueryData(libraryKeys.library(GUEST_LIBRARY_USER_ID), []);
      queryClient.invalidateQueries({ queryKey: libraryKeys.library(user.id) });
      queryClient.invalidateQueries({ queryKey: libraryKeys.lists(user.id) });
      syncedUserRef.current = user.id;
    };

    void syncGuestEntries().catch((error) => {
      console.error("Failed to sync guest library entries after login.", error);
    });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, queryClient, user?.id]);
}
