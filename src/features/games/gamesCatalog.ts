import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { fetchAllRows } from "../../lib/supabase/fetchAllRows";
import type { Json, Database } from "../../types/database";
import { mapGameRecord } from "./gameMappers";
import type { GameRow, GameWithTags, TagRow } from "./games.types";
import type { ScenarioSection, Rule } from "../../config/scenarioPresets";

export type GamesCatalogRow = Database["public"]["Views"]["games_catalog"]["Row"];
export type GamesCatalogExploreRow = Pick<
  GamesCatalogRow,
  | "id"
  | "name"
  | "slug"
  | "status"
  | "hidden"
  | "buy_priority"
  | "bgg_rating"
  | "bgg_weight"
  | "bgg_rank"
  | "bgg_usersrated"
  | "players_min"
  | "players_max"
  | "play_time_min"
  | "play_time_max"
  | "category"
  | "published_year"
  | "tag_slugs"
>;

const EXPLORE_CATALOG_COLUMNS = [
  "id",
  "name",
  "slug",
  "status",
  "hidden",
  "buy_priority",
  "bgg_rating",
  "bgg_weight",
  "bgg_rank",
  "bgg_usersrated",
  "players_min",
  "players_max",
  "play_time_min",
  "play_time_max",
  "category",
  "published_year",
  "tag_slugs",
].join(", ");

const EXPLORE_CANDIDATE_LIMIT_MULTIPLIER = 8;
const EXPLORE_CANDIDATE_MIN_LIMIT = 120;
const EXPLORE_CANDIDATE_MAX_LIMIT = 400;

function getExploreCandidateLimit(section: ScenarioSection) {
  const baseLimit = section.candidatePoolSize ?? section.displayLimit ?? section.rule.limit ?? 24;
  return Math.min(
    Math.max(baseLimit * EXPLORE_CANDIDATE_LIMIT_MULTIPLIER, EXPLORE_CANDIDATE_MIN_LIMIT),
    EXPLORE_CANDIDATE_MAX_LIMIT,
  );
}

function applyExploreCandidateSort(query: any, rule: Rule) {
  switch (rule.sortBy) {
    case "rating_asc":
      return query.order("bgg_rating", { ascending: true }).order("bgg_usersrated", { ascending: false });
    case "weight_asc":
      return query.order("bgg_weight", { ascending: true }).order("bgg_usersrated", { ascending: false });
    case "weight_desc":
      return query.order("bgg_weight", { ascending: false }).order("bgg_usersrated", { ascending: false });
    case "time_asc":
      return query.order("play_time_max", { ascending: true }).order("bgg_usersrated", { ascending: false });
    case "priority_asc":
      return query.order("buy_priority", { ascending: true }).order("bgg_usersrated", { ascending: false });
    case "name_asc":
      return query.order("name", { ascending: true });
    case "rank_asc":
      return query.order("bgg_rank", { ascending: true }).order("bgg_usersrated", { ascending: false });
    case "year_desc":
      return query.order("published_year", { ascending: false }).order("bgg_usersrated", { ascending: false });
    case "ratings_count_desc":
      return query.order("bgg_usersrated", { ascending: false }).order("bgg_rating", { ascending: false });
    case "rating_desc":
    default:
      return query.order("bgg_rating", { ascending: false }).order("bgg_usersrated", { ascending: false });
  }
}

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

export async function fetchGamesCatalogRows(options?: { pageSize?: number }) {
  const supabase = getSupabaseBrowserClient();

  const rows = await fetchAllRows<GamesCatalogRow>(
    async (from, to) =>
      await supabase.from("games_catalog").select("*").order("id").range(from, to),
    options,
  );

  return rows as GamesCatalogRow[];
}

export async function fetchGamesCatalogExploreRows(options?: { pageSize?: number }) {
  const supabase = getSupabaseBrowserClient();

  const rows = await fetchAllRows<GamesCatalogExploreRow>(
    async (from, to) => {
      const { data, error } = await supabase
        .from("games_catalog")
        .select(EXPLORE_CATALOG_COLUMNS)
        .order("id")
        .range(from, to);

      return {
        data: (data ?? null) as GamesCatalogExploreRow[] | null,
        error,
      };
    },
    options,
  );

  return rows as GamesCatalogExploreRow[];
}

export async function fetchGamesCatalogRowsByIds(ids: readonly string[]) {
  if (ids.length === 0) {
    return [] as GamesCatalogRow[];
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("games_catalog").select("*").in("id", [...ids]).order("id");

  if (error) {
    throw error;
  }

  return (data ?? []) as GamesCatalogRow[];
}

export async function fetchGamesCatalogExploreCandidateRows(section: ScenarioSection) {
  const supabase = getSupabaseBrowserClient();
  const { rule } = section;

  let query = supabase
    .from("games_catalog")
    .select(EXPLORE_CATALOG_COLUMNS)
    .eq("hidden", false);

  if (section.useStatusFilter && rule.statuses?.length) {
    query = query.in("status", rule.statuses);
  }

  if (rule.minPlayers != null) {
    query = query.gte("players_max", rule.minPlayers);
  }

  if (rule.maxPlayers != null) {
    query = query.lte("players_min", rule.maxPlayers);
  }

  if (rule.minTime != null) {
    query = query.gte("play_time_max", rule.minTime);
  }

  if (rule.maxTime != null) {
    query = query.lte("play_time_min", rule.maxTime);
  }

  if (rule.minWeight != null) {
    query = query.gte("bgg_weight", rule.minWeight);
  }

  if (rule.maxWeight != null) {
    query = query.lte("bgg_weight", rule.maxWeight);
  }

  if (rule.minRating != null) {
    query = query.gte("bgg_rating", rule.minRating);
  }

  if (rule.minRatingsCount != null) {
    query = query.gte("bgg_usersrated", rule.minRatingsCount);
  }

  if (rule.minYear != null) {
    query = query.gte("published_year", rule.minYear);
  }

  if (rule.maxYear != null) {
    query = query.lte("published_year", rule.maxYear);
  }

  if (rule.allTags?.length) {
    query = query.contains("tag_slugs", rule.allTags);
  }

  if (rule.anyTags?.length) {
    query = query.overlaps("tag_slugs", rule.anyTags);
  }

  if (rule.categoryIncludes?.length) {
    query = query.or(
      rule.categoryIncludes.map((value) => `category.ilike.%${value}%`).join(","),
    );
  }

  const { data, error } = await applyExploreCandidateSort(query, rule).limit(
    getExploreCandidateLimit(section),
  );

  if (error) {
    throw error;
  }

  return (data ?? []) as GamesCatalogExploreRow[];
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
