import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "../accounts/useAccount";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import {
  GUEST_LIBRARY_USER_ID,
  clearGuestLibraryEntries,
  readGuestLibraryEntries,
} from "./guestLibraryStorage";
import { libraryKeys } from "./libraryKeys";

export function useGuestLibrarySync() {
  const queryClient = useQueryClient();
  const { account, isAuthenticated } = useAccount();
  const syncedAccountRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !account?.id) {
      syncedAccountRef.current = null;
      return;
    }

    if (syncedAccountRef.current === account.id) {
      return;
    }

    const guestEntries = readGuestLibraryEntries();
    if (guestEntries.length === 0) {
      syncedAccountRef.current = account.id;
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let isCancelled = false;

    const syncGuestEntries = async () => {
      for (const entry of guestEntries) {
        const { error } = await supabase.from("library_entries").upsert(
          {
            account_id: account.id,
            game_id: entry.gameId,
            is_saved: entry.isSaved,
            is_loved: entry.isLoved,
            is_in_collection: entry.isInCollection,
            sentiment: entry.sentiment,
            notes: entry.notes,
          },
          { onConflict: "account_id,game_id" },
        );

        if (error) {
          throw error;
        }
      }

      if (isCancelled) return;

      clearGuestLibraryEntries();
      queryClient.setQueryData(libraryKeys.library(GUEST_LIBRARY_USER_ID), []);
      queryClient.invalidateQueries({ queryKey: libraryKeys.library(account.id) });
      queryClient.invalidateQueries({ queryKey: libraryKeys.lists(account.id) });
      syncedAccountRef.current = account.id;
    };

    void syncGuestEntries().catch((error) => {
      console.error("Failed to sync guest library entries after login.", error);
    });

    return () => {
      isCancelled = true;
    };
  }, [account?.id, isAuthenticated, queryClient]);
}
