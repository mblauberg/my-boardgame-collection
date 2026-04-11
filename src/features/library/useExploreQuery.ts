import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { shouldRetrySupabaseQuery } from "../../lib/supabase/runtimeErrors";
import { mapGameRecord } from "../games/gameMappers";
import type { GameWithTags, GameRow, TagRow } from "../games/games.types";
import { libraryKeys } from "./libraryKeys";
import { scenarioPresets, type Rule } from "../../config/scenarioPresets";

type GameTagJoin = {
  game_id: string;
  tag_id: string;
  tags: TagRow | null;
};

type ExploreShelfData = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  sections: Array<{
    id: string;
    label: string;
    description: string;
    games: ReturnType<typeof mapGameRecord>[];
  }>;
  entries: ReturnType<typeof mapGameRecord>[];
};

type TagSlugsByGameId = Map<string, Set<string>>;

export function resolveExplorePresets(presetIds?: readonly string[]) {
  const visiblePresetIds = presetIds?.length ? new Set(presetIds) : null;

  return scenarioPresets.filter(
    (preset) => preset.id !== "for-you" && (!visiblePresetIds || visiblePresetIds.has(preset.id)),
  );
}

function getRuleTagSlugs(rule: Rule) {
  return [...new Set([...(rule.anyTags ?? []), ...(rule.allTags ?? []), ...(rule.excludeTags ?? [])])];
}

function hasRuleTagFilters(rule: Rule) {
  return getRuleTagSlugs(rule).length > 0;
}

export function resolveMatchingGameIdsForRule(
  rule: Pick<Rule, "anyTags" | "allTags" | "excludeTags">,
  tagSlugsByGameId: TagSlugsByGameId,
) {
  return [...tagSlugsByGameId.entries()]
    .filter(([, tagSet]) => {
      if (rule.anyTags?.length && !rule.anyTags.some((tag) => tagSet.has(tag))) return false;
      if (rule.allTags?.length && !rule.allTags.every((tag) => tagSet.has(tag))) return false;
      if (rule.excludeTags?.length && rule.excludeTags.some((tag) => tagSet.has(tag))) return false;
      return true;
    })
    .map(([gameId]) => gameId);
}

function applyRuleFilters(
  query: ReturnType<ReturnType<typeof getSupabaseBrowserClient>["from"]>,
  rule: Rule,
) {
  let next = query.eq("hidden", false);

  if (rule.minYear != null) next = next.gte("published_year", rule.minYear);
  if (rule.maxYear != null) next = next.lte("published_year", rule.maxYear);
  if (rule.minRatingsCount != null) next = next.gte("bgg_usersrated", rule.minRatingsCount);
  if (rule.minRating != null) next = next.gte("bgg_rating", rule.minRating);
  if (rule.minWeight != null) next = next.gte("bgg_weight", rule.minWeight);
  if (rule.maxWeight != null) next = next.lte("bgg_weight", rule.maxWeight);
  if (rule.minPlayers != null) next = next.gte("players_max", rule.minPlayers);
  if (rule.maxPlayers != null) next = next.lte("players_min", rule.maxPlayers);
  if (rule.minTime != null) next = next.gte("play_time_max", rule.minTime);
  if (rule.maxTime != null) next = next.lte("play_time_min", rule.maxTime);

  return next;
}

function applyRuleSort(
  query: ReturnType<ReturnType<typeof getSupabaseBrowserClient>["from"]>,
  sortBy: Rule["sortBy"],
) {
  switch (sortBy) {
    case "rank_asc":
      return query
        .order("bgg_rank", { ascending: true, nullsFirst: false })
        .order("bgg_usersrated", { ascending: false })
        .order("name", { ascending: true });
    case "ratings_count_desc":
      return query
        .order("bgg_usersrated", { ascending: false })
        .order("bgg_rating", { ascending: false, nullsFirst: false })
        .order("bgg_rank", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true });
    case "year_desc":
      return query
        .order("published_year", { ascending: false, nullsFirst: false })
        .order("bgg_rank", { ascending: true, nullsFirst: false })
        .order("bgg_usersrated", { ascending: false })
        .order("bgg_rating", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true });
    case "weight_asc":
      return query
        .order("bgg_weight", { ascending: true, nullsFirst: false })
        .order("bgg_rating", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true });
    case "weight_desc":
      return query
        .order("bgg_weight", { ascending: false, nullsFirst: false })
        .order("bgg_rating", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true });
    case "time_asc":
      return query
        .order("play_time_min", { ascending: true, nullsFirst: false })
        .order("bgg_rating", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true });
    case "name_asc":
      return query.order("name", { ascending: true });
    case "rating_asc":
      return query
        .order("bgg_rating", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true });
    case "priority_asc":
      return query
        .order("buy_priority", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true });
    case "rating_desc":
    default:
      return query
        .order("bgg_rating", { ascending: false, nullsFirst: false })
        .order("bgg_usersrated", { ascending: false })
        .order("name", { ascending: true });
  }
}

async function fetchTagSlugsByGameId(rules: Rule[]) {
  const tagSlugs = [...new Set(rules.flatMap(getRuleTagSlugs))];
  if (tagSlugs.length === 0) return null;

  const supabase = getSupabaseBrowserClient();
  const { data: tags, error: tagsError } = await supabase
    .from("tags")
    .select("id, slug")
    .in("slug", tagSlugs);

  if (tagsError) throw tagsError;
  if (!tags || tags.length === 0) return new Map<string, Set<string>>();

  const tagSlugById = new Map(tags.map((tag) => [tag.id, tag.slug]));
  const { data: gameTags, error: gameTagsError } = await supabase
    .from("game_tags")
    .select("game_id, tag_id")
    .in("tag_id", tags.map((tag) => tag.id));

  if (gameTagsError) throw gameTagsError;

  const tagSlugsByGameId: TagSlugsByGameId = new Map();
  for (const join of gameTags ?? []) {
    const tagSlug = tagSlugById.get(join.tag_id);
    if (!tagSlug) continue;
    const current = tagSlugsByGameId.get(join.game_id) ?? new Set<string>();
    current.add(tagSlug);
    tagSlugsByGameId.set(join.game_id, current);
  }

  return tagSlugsByGameId;
}

async function fetchRowsForRule(rule: Rule, tagSlugsByGameId: TagSlugsByGameId | null) {
  const matchingGameIds =
    tagSlugsByGameId && hasRuleTagFilters(rule)
      ? resolveMatchingGameIdsForRule(rule, tagSlugsByGameId)
      : null;
  if (matchingGameIds && matchingGameIds.length === 0) return [];

  const supabase = getSupabaseBrowserClient();
  let query = supabase.from("games").select("*");
  query = applyRuleFilters(query, rule);

  if (matchingGameIds) {
    query = query.in("id", matchingGameIds);
  }

  query = applyRuleSort(query, rule.sortBy);

  if (rule.limit != null) {
    query = query.limit(rule.limit);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as GameRow[];
}

async function fetchTagsByGameId(gameIds: string[]) {
  if (gameIds.length === 0) return new Map<string, TagRow[]>();

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("game_tags")
    .select("game_id, tag_id, tags(*)")
    .in("game_id", gameIds);

  if (error) throw error;

  const tagsByGameId = new Map<string, TagRow[]>();
  for (const join of (data ?? []) as GameTagJoin[]) {
    if (!join.tags) continue;
    const current = tagsByGameId.get(join.game_id) ?? [];
    current.push(join.tags);
    tagsByGameId.set(join.game_id, current);
  }

  return tagsByGameId;
}

export async function fetchExploreData(presetIds?: readonly string[]) {
  const presets = resolveExplorePresets(presetIds);
  const tagSlugsByGameId = await fetchTagSlugsByGameId(
    presets.flatMap((preset) => preset.sections.map((section) => section.rule)),
  );
  const shelfRows = await Promise.all(
    presets.map(async (preset) => ({
      preset,
      sections: await Promise.all(
        preset.sections.map(async (section) => ({
          section,
          rows: await fetchRowsForRule(section.rule, tagSlugsByGameId),
        })),
      ),
    })),
  );

  const uniqueRows = new Map<string, GameRow>();
  for (const shelf of shelfRows) {
    for (const section of shelf.sections) {
      for (const row of section.rows) {
        uniqueRows.set(row.id, row);
      }
    }
  }

  const tagsByGameId = await fetchTagsByGameId([...uniqueRows.keys()]);
  const gameById = new Map(
    [...uniqueRows.values()].map((row) => {
      const game = mapGameRecord({
        ...(row as GameWithTags),
        tags: tagsByGameId.get(row.id) ?? [],
      });
      return [game.id, game] as const;
    }),
  );

  const shelves: ExploreShelfData[] = shelfRows.map(({ preset, sections }) => ({
    id: preset.id,
    emoji: preset.emoji,
    title: preset.label,
    description: preset.description,
    sections: sections.map(({ section, rows }) => ({
      id: section.id,
      label: section.label,
      description: section.description,
      games: rows
        .map((row) => gameById.get(row.id))
        .filter((game): game is ReturnType<typeof mapGameRecord> => Boolean(game)),
    })),
    entries:
      sections.length === 1
        ? sections[0].rows
            .map((row) => gameById.get(row.id))
            .filter((game): game is ReturnType<typeof mapGameRecord> => Boolean(game))
        : [],
  }));

  return { shelves };
}

export function useExploreQuery(presetIds?: readonly string[]) {
  return useQuery({
    queryKey: libraryKeys.explore(presetIds),
    retry: shouldRetrySupabaseQuery,
    queryFn: () => fetchExploreData(presetIds),
  });
}
