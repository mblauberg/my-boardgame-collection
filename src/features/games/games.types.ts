import type { Database } from "../../types/database";

export type GameRow = Database["public"]["Tables"]["games"]["Row"];
export type TagRow = Database["public"]["Tables"]["tags"]["Row"];

export type GameWithTags = GameRow & {
  tags: TagRow[];
};
