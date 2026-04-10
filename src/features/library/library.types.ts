import type { Game, Tag } from "../../types/domain";
import type { Database } from "../../types/database";

export type LibrarySurface = "collection" | "saved";
export type LibraryListType = LibrarySurface | "wishlist";
export type LibrarySentiment = "like" | "dislike" | "neutral" | null;

export type LibraryEntryRow = Database["public"]["Tables"]["library_entries"]["Row"];
export type UserTagRow = Database["public"]["Tables"]["user_tags"]["Row"];
export type UserGameTagRow = Database["public"]["Tables"]["user_game_tags"]["Row"];

export type LibraryEntry = {
  id: string;
  accountId?: string;
  userId?: string;
  gameId: string;
  isSaved: boolean;
  isLoved: boolean;
  isInCollection: boolean;
  listType?: LibraryListType;
  sentiment: LibrarySentiment;
  notes: string | null;
  priority: number | null;
  game: Game;
  sharedTags: Tag[];
  userTags: Tag[];
};
