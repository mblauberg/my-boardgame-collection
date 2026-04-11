import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import type { Json, Database } from "../../types/database";
import { mapGameRecord } from "./gameMappers";
import type { GameRow, GameWithTags, TagRow } from "./games.types";

export type GamesCatalogRow = Database["public"]["Views"]["games_catalog"]["Row"];

function isTagRow(value: Json): value is TagRow {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.slug === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string" &&
    (typeof value.tag_type === "string" || value.tag_type === null || value.tag_type === undefined) &&
    (typeof value.colour === "string" || value.colour === null || value.colour === undefined)
  );
}

export function parseGamesCatalogTags(tags: Json | null): TagRow[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter(isTagRow).map((tag) => ({
    ...tag,
    colour: tag.colour ?? null,
    tag_type: tag.tag_type ?? null,
  }));
}

export function mapGamesCatalogRow(row: GamesCatalogRow) {
  return mapGameRecord({
    ...(row as GameRow),
    tags: parseGamesCatalogTags(row.tags),
  } as GameWithTags);
}

export async function fetchGamesCatalogRows() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("games_catalog").select("*");

  if (error) {
    throw error;
  }

  return (data ?? []) as GamesCatalogRow[];
}

export async function searchGamesCatalogRows(query: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("games_catalog")
    .select("*")
    .eq("hidden", false)
    .ilike("name", `%${query}%`)
    .order("bgg_usersrated", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return (data ?? []) as GamesCatalogRow[];
}
