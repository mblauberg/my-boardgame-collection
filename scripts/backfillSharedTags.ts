#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { pathToFileURL } from "url";
import { fetchAllRows } from "../src/lib/supabase/fetchAllRows";
import type { SeedPayload } from "./legacy/buildSeedPayload.js";
import { LEGACY_SEED_PATH } from "./legacy/legacyPipeline.js";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

type SharedTagSourceRow = {
  id: string;
  slug?: string | null;
  name?: string | null;
  bgg_id?: number | null;
  category?: string | null;
  players_min?: number | null;
  players_max?: number | null;
  play_time_min?: number | null;
  play_time_max?: number | null;
  bgg_weight?: number | null;
  summary?: string | null;
};

type SharedTagBackfill = {
  tags: Array<{ slug: string; name: string }>;
  gameTags: Array<{ game_id: string; tag_slug: string }>;
};

function toLabel(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function stripNumericSuffixes(slug: string) {
  return slug.replace(/(?:-\d+)+$/, "");
}

function deriveSharedTagSlugs(game: SharedTagSourceRow) {
  const tags = new Set<string>();

  if (game.players_min === 2 && game.players_max === 2) tags.add("two-player");
  if (game.players_min === 1) tags.add("solo");
  if (game.players_min != null && game.players_min >= 5) tags.add("party");

  if (game.category) {
    const category = game.category.toLowerCase();
    if (category.includes("co-op")) tags.add("co-op");
    if (category.includes("competitive")) tags.add("competitive");
    if (category.includes("deduction")) tags.add("deduction");
    if (category.includes("social")) tags.add("social-deduction");
    if (category.includes("bluff")) tags.add("bluffing");
    if (category.includes("draft")) tags.add("drafting");
    if (category.includes("trick")) tags.add("trick-taking");
    if (category.includes("engine")) tags.add("engine-building");
    if (category.includes("deck")) tags.add("deck-building");
    if (category.includes("bag")) tags.add("bag-building");
    if (category.includes("racing")) tags.add("racing");
    if (category.includes("adventure")) tags.add("adventure");
    if (category.includes("tile")) tags.add("tile-laying");
    if (category.includes("spatial") || category.includes("puzzle")) tags.add("spatial");
    if (category.includes("word")) tags.add("word");
    if (category.includes("draw")) tags.add("drawing");
    if (category.includes("push")) tags.add("push-your-luck");
    if (category.includes("betting")) tags.add("betting");
    if (category.includes("card")) tags.add("card-game");
    if (category.includes("set")) tags.add("set-collection");
    if (category.includes("gateway")) tags.add("gateway");
    if (category.includes("party")) tags.add("party");
    if (category.includes("strategy")) tags.add("strategy");
  }

  if (game.play_time_max != null && game.play_time_max <= 20) tags.add("filler");
  if (game.play_time_max != null && game.play_time_max <= 25) tags.add("quick");
  if (
    game.play_time_min != null &&
    game.play_time_min >= 45 &&
    game.play_time_max != null &&
    game.play_time_max <= 95
  ) {
    tags.add("main-event");
  }

  if (game.bgg_weight != null) {
    if (game.bgg_weight <= 1.8) tags.add("light");
    else if (game.bgg_weight <= 2.5) tags.add("medium-weight");
    else tags.add("heavy");
  }

  return [...tags];
}

export function buildSharedTagBackfill(games: SharedTagSourceRow[]): SharedTagBackfill {
  const tagNames = new Map<string, string>();
  const gameTags: SharedTagBackfill["gameTags"] = [];

  for (const game of games) {
    const slugs = deriveSharedTagSlugs(game);
    for (const slug of slugs) {
      tagNames.set(slug, toLabel(slug));
      gameTags.push({ game_id: game.id, tag_slug: slug });
    }
  }

  return {
    tags: [...tagNames.entries()].map(([slug, name]) => ({ slug, name })),
    gameTags,
  };
}

function getSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

async function fetchSharedCatalogRows() {
  const supabase = getSupabaseAdminClient();

  return fetchAllRows<Required<Pick<SharedTagSourceRow, "id">> & SharedTagSourceRow>(async (from, to) => {
    const { data, error } = await supabase
      .from("games")
      .select("id, slug, name, bgg_id, category, players_min, players_max, play_time_min, play_time_max, bgg_weight, summary")
      .order("slug")
      .range(from, to);

    return { data, error };
  });
}

export async function backfillSharedTags() {
  const supabase = getSupabaseAdminClient();
  const payload: SeedPayload = JSON.parse(readFileSync(LEGACY_SEED_PATH, "utf-8"));
  const catalogRows = await fetchSharedCatalogRows();
  const rowsBySlug = new Map(
    catalogRows
      .filter((game): game is SharedTagSourceRow & { slug: string } => Boolean(game.slug))
      .map((game) => [game.slug, game]),
  );
  const rowsByBaseSlug = new Map<string, SharedTagSourceRow>();
  const rowsByName = new Map<string, SharedTagSourceRow>();

  for (const game of catalogRows) {
    if (game.slug && game.bgg_id != null) {
      rowsByBaseSlug.set(stripNumericSuffixes(game.slug), game);
    }
    if (game.name) {
      rowsByName.set(game.name.trim().toLowerCase(), game);
    }
  }

  const resolvedTargets = payload.games.map((payloadGame) => {
    const exactMatch = rowsBySlug.get(payloadGame.slug);
    const baseSlugMatch = rowsByBaseSlug.get(payloadGame.slug);
    const nameMatch = rowsByName.get(payloadGame.name.trim().toLowerCase());
    const target = baseSlugMatch ?? exactMatch ?? nameMatch ?? null;

    return { payloadGame, target };
  });

  const metadataRows = resolvedTargets.map(({ payloadGame, target }) => ({
    name: payloadGame.name,
    slug: target?.bgg_id != null
      ? target.slug ? stripNumericSuffixes(target.slug) : payloadGame.slug
      : target?.slug ?? payloadGame.slug,
    bgg_id: target?.bgg_id ?? null,
    status: "archived" as const,
    category: payloadGame.category ?? null,
    players_min: payloadGame.players_min ?? null,
    players_max: payloadGame.players_max ?? null,
    play_time_min: payloadGame.play_time_min ?? null,
    play_time_max: payloadGame.play_time_max ?? null,
    bgg_weight: payloadGame.bgg_weight ?? null,
    summary: payloadGame.summary ?? null,
  }));

  const { error: metadataError } = await supabase.from("games").upsert(metadataRows, { onConflict: "slug" });
  if (metadataError) throw metadataError;

  const refreshedCatalogRows = await fetchSharedCatalogRows();
  const refreshedBySlug = new Map(
    refreshedCatalogRows
      .filter((game): game is SharedTagSourceRow & { slug: string } => Boolean(game.slug))
      .map((game) => [game.slug, game]),
  );
  const refreshedByBaseSlug = new Map<string, SharedTagSourceRow>();
  const refreshedByName = new Map<string, SharedTagSourceRow>();

  for (const game of refreshedCatalogRows) {
    if (game.slug && game.bgg_id != null) {
      refreshedByBaseSlug.set(stripNumericSuffixes(game.slug), game);
    }
    if (game.name) {
      refreshedByName.set(game.name.trim().toLowerCase(), game);
    }
  }

  const resolvedGameIdByPayloadGameId = new Map(
    payload.games.flatMap((payloadGame) => {
      const exactMatch = refreshedBySlug.get(payloadGame.slug);
      const baseSlugMatch = refreshedByBaseSlug.get(payloadGame.slug);
      const nameMatch = refreshedByName.get(payloadGame.name.trim().toLowerCase());
      const resolvedGame = baseSlugMatch ?? exactMatch ?? nameMatch ?? null;
      if (!resolvedGame) return [];
      return [[payloadGame.id, resolvedGame.id] as const];
    }),
  );

  const { error: tagsError } = await supabase
    .from("tags")
    .upsert(
      payload.tags.map((tag) => ({ slug: tag.slug, name: tag.label, tag_type: null, colour: null })),
      { onConflict: "slug" },
    );
  if (tagsError) throw tagsError;

  const dbTags = await fetchAllRows<{ id: string; slug: string }>(async (from, to) => {
    const { data, error } = await supabase
      .from("tags")
      .select("id, slug")
      .in("slug", payload.tags.map((tag) => tag.slug))
      .order("slug")
      .range(from, to);

    return { data, error };
  });

  const tagIdBySlug = new Map(dbTags.map((tag) => [tag.slug, tag.id]));
  const joinRows = payload.gameTags.flatMap((gameTag) => {
    const gameId = resolvedGameIdByPayloadGameId.get(gameTag.game_id);
    const tagId = tagIdBySlug.get(gameTag.tag_id);
    if (!gameId || !tagId) return [];
    return [{ game_id: gameId, tag_id: tagId }];
  });

  if (joinRows.length > 0) {
    const { error: gameTagsError } = await supabase
      .from("game_tags")
      .upsert(joinRows, { onConflict: "game_id,tag_id" });
    if (gameTagsError) throw gameTagsError;
  }

  const cleanupSlugs = resolvedTargets
    .filter(({ payloadGame, target }) => target?.slug && target.slug !== payloadGame.slug)
    .map(({ payloadGame }) => payloadGame.slug);

  if (cleanupSlugs.length > 0) {
    const { error: cleanupError } = await supabase
      .from("games")
      .delete()
      .in("slug", [...new Set(cleanupSlugs)])
      .is("bgg_id", null);
    if (cleanupError) throw cleanupError;
  }

  return {
    tagsInserted: payload.tags.length,
    gameTagsInserted: joinRows.length,
    gamesUpdated: metadataRows.length,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  backfillSharedTags()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
