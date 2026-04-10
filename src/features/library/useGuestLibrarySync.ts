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
import {
  isGuestImportedGameId,
  normalizeLibraryStateSnapshot,
} from "./libraryState";

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
        const nextState = normalizeLibraryStateSnapshot({
          isSaved: entry.isSaved,
          isLoved: entry.isLoved,
          isInCollection: entry.isInCollection,
          sentiment: entry.sentiment,
          notes: entry.notes,
        });

        if (isGuestImportedGameId(entry.gameId)) {
          if (!entry.game.bggId) {
            throw new Error(`Guest game ${entry.game.name} is missing a BGG id.`);
          }
          if (!entry.game.bggUrl) {
            throw new Error(`Guest game ${entry.game.name} is missing a BGG URL.`);
          }

          const { error } = await supabase.rpc("save_bgg_game_for_account", {
            p_account_id: account.id,
            p_bgg_id: entry.game.bggId,
            p_name: entry.game.name,
            p_slug: entry.game.slug,
            p_bgg_url: entry.game.bggUrl,
            p_image_url: entry.game.imageUrl?.startsWith("https://")
              ? entry.game.imageUrl
              : undefined,
            p_published_year: entry.game.publishedYear ?? undefined,
            p_players_min: entry.game.playersMin ?? undefined,
            p_players_max: entry.game.playersMax ?? undefined,
            p_play_time_min: entry.game.playTimeMin ?? undefined,
            p_play_time_max: entry.game.playTimeMax ?? undefined,
            p_bgg_rating: entry.game.bggRating ?? undefined,
            p_bgg_weight: entry.game.bggWeight ?? undefined,
            p_summary: entry.game.summary ?? undefined,
            p_is_saved: nextState.isSaved,
            p_is_loved: nextState.isLoved,
            p_is_in_collection: nextState.isInCollection,
            p_sentiment: nextState.sentiment ?? undefined,
            p_notes: nextState.notes ?? undefined,
          });

          if (error) {
            throw error;
          }

          continue;
        }

        const { error } = await supabase.from("library_entries").upsert(
          {
            account_id: account.id,
            game_id: entry.gameId,
            is_saved: nextState.isSaved,
            is_loved: nextState.isLoved,
            is_in_collection: nextState.isInCollection,
            sentiment: nextState.sentiment,
            notes: nextState.notes,
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
