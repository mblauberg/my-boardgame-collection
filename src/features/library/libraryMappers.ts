import type { Database } from "../../types/database";
import { mapGameRecord, mapTag } from "../games/gameMappers";
import type { GameRow, TagRow } from "../games/games.types";
import type { LibraryEntry, LibraryEntryRow, UserGameTagRow, UserTagRow } from "./library.types";

type UserGameTagJoin = UserGameTagRow & {
  user_tags: UserTagRow | null;
};

export type LibraryEntryJoin = LibraryEntryRow & {
  games: GameRow | null;
  user_game_tags: UserGameTagJoin[] | null;
};

export type SharedGameTagJoin = Database["public"]["Tables"]["game_tags"]["Row"] & {
  tags: TagRow | null;
};

function mapUserTag(row: UserTagRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagType: null,
    colour: row.colour,
  };
}

export function mapLibraryEntryRecord(
  record: LibraryEntryJoin,
  sharedTagRows: TagRow[],
): LibraryEntry {
  if (!record.games) {
    throw new Error(`Missing shared game for library entry ${record.id}`);
  }

  const sharedTags = sharedTagRows.map(mapTag);
  const userTags = (record.user_game_tags ?? [])
    .map((join) => join.user_tags)
    .filter((tag): tag is UserTagRow => tag !== null)
    .map(mapUserTag);

  return {
    id: record.id,
    userId: record.user_id,
    gameId: record.game_id,
    listType: record.list_type,
    sentiment: record.sentiment,
    notes: record.notes,
    priority: record.priority,
    game: mapGameRecord({ ...record.games, tags: sharedTagRows }),
    sharedTags,
    userTags,
  };
}
