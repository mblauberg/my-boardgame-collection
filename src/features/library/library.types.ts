import type { Game, Tag } from "../../types/domain";
import type { Database } from "../../types/database";

export type LibraryListType = "collection" | "wishlist";
export type LibrarySentiment = "like" | "dislike" | "neutral" | null;

export type LibraryEntryRow = Database["public"]["Tables"]["library_entries"]["Row"];
export type UserTagRow = Database["public"]["Tables"]["user_tags"]["Row"];
export type UserGameTagRow = Database["public"]["Tables"]["user_game_tags"]["Row"];

export type LibraryEntry = {
  id: string;
  userId: string;
  gameId: string;
  listType: LibraryListType;
  sentiment: LibrarySentiment;
  notes: string | null;
  priority: number | null;
  game: Game;
  sharedTags: Tag[];
  userTags: Tag[];
};
