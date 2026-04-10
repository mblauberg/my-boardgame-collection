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

function mapSentiment(value: string | null): LibraryEntry["sentiment"] {
  if (value === "like" || value === "dislike" || value === "neutral") {
    return value;
  }
  return null;
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

  const isSaved = record.is_saved;
  const isLoved = record.is_loved;
  const isInCollection = record.is_in_collection;

  return {
    id: record.id,
    accountId: record.account_id,
    userId: record.account_id,
    gameId: record.game_id,
    isSaved,
    isLoved,
    isInCollection,
    listType: isInCollection ? "collection" : isSaved ? "saved" : undefined,
    sentiment: mapSentiment(record.sentiment),
    notes: record.notes,
    priority: record.priority,
    game: mapGameRecord({ ...record.games, tags: sharedTagRows }),
    sharedTags,
    userTags,
  };
}
