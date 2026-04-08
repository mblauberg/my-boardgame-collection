#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { pathToFileURL } from "url";
import type { SeedPayload } from "./legacy/buildSeedPayload.js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type SeedGame = SeedPayload["games"][number];

export function mapLegacyGameToLibraryEntry(
  game: SeedGame,
  userId: string,
  gameId: string,
) {
  if (game.status === "owned") {
    return {
      user_id: userId,
      game_id: gameId,
      list_type: "collection" as const,
      notes: game.rationale ?? null,
      priority: null,
      sentiment: null,
    };
  }

  if (game.status === "buy") {
    return {
      user_id: userId,
      game_id: gameId,
      list_type: "wishlist" as const,
      notes: game.rationale ?? null,
      priority: null,
      sentiment: null,
    };
  }

  return null;
}

function getSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

async function resolvePrimaryProfileId(supabase: ReturnType<typeof createClient>) {
  const { data: ownerProfiles, error: ownerError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "owner")
    .limit(1);

  if (ownerError) throw ownerError;
  if (ownerProfiles?.[0]?.id) return ownerProfiles[0].id;

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  if (profileError) throw profileError;
  if (!profiles?.[0]?.id) {
    throw new Error("No profiles found. Sign in once before running migrate:import.");
  }

  return profiles[0].id;
}

export async function importLegacyData() {
  const supabase = getSupabaseAdminClient();
  const payload: SeedPayload = JSON.parse(readFileSync("scripts/output/seed-data.json", "utf-8"));

  console.log("Importing tags...");
  const tagRows = payload.tags.map((tag) => ({
    name: tag.label,
    slug: tag.slug,
    tag_type: null,
    colour: null,
  }));

  const { error: tagsError } = await supabase.from("tags").upsert(tagRows, { onConflict: "slug" });
  if (tagsError) throw tagsError;
  console.log(`✓ Imported ${payload.tags.length} tags`);

  console.log("Importing shared catalog games...");
  const gameRows = payload.games.map((game) => ({
    name: game.name,
    slug: game.slug,
    status: "archived",
    players_min: game.players_min,
    players_max: game.players_max,
    play_time_min: game.play_time_min,
    play_time_max: game.play_time_max,
    bgg_rating: game.bgg_rating,
    bgg_weight: game.bgg_weight,
    category: game.category,
    summary: game.summary,
    notes: null,
    recommendation_verdict: null,
    recommendation_colour: null,
    gap_reason: null,
  }));

  const { error: gamesError } = await supabase.from("games").upsert(gameRows, { onConflict: "slug" });
  if (gamesError) throw gamesError;
  console.log(`✓ Imported ${payload.games.length} catalog games`);

  const primaryProfileId = await resolvePrimaryProfileId(supabase);

  const [{ data: tags, error: tagLookupError }, { data: games, error: gameLookupError }] =
    await Promise.all([
      supabase.from("tags").select("id, slug"),
      supabase.from("games").select("id, slug"),
    ]);

  if (tagLookupError) throw tagLookupError;
  if (gameLookupError) throw gameLookupError;

  const tagIdBySlug = new Map((tags ?? []).map((tag) => [tag.slug, tag.id]));
  const gameIdBySlug = new Map((games ?? []).map((game) => [game.slug, game.id]));

  console.log("Importing game-tag relationships...");
  const gameTagRows = payload.gameTags.flatMap((gameTag) => {
    const sourceGame = payload.games.find((game) => game.id === gameTag.game_id);
    if (!sourceGame) return [];

    const gameId = gameIdBySlug.get(sourceGame.slug);
    const tagId = tagIdBySlug.get(gameTag.tag_id);

    if (!gameId || !tagId) return [];

    return [{ game_id: gameId, tag_id: tagId }];
  });

  const { error: gameTagsError } = await supabase
    .from("game_tags")
    .upsert(gameTagRows, { onConflict: "game_id,tag_id" });
  if (gameTagsError) throw gameTagsError;
  console.log(`✓ Imported ${gameTagRows.length} game-tag relationships`);

  console.log("Importing library entries...");
  const libraryEntryRows = payload.games.flatMap((game) => {
    const gameId = gameIdBySlug.get(game.slug);
    if (!gameId) return [];

    const entry = mapLegacyGameToLibraryEntry(game, primaryProfileId, gameId);
    return entry ? [entry] : [];
  });

  const { error: libraryEntriesError } = await supabase
    .from("library_entries")
    .upsert(libraryEntryRows, { onConflict: "user_id,game_id" });
  if (libraryEntriesError) throw libraryEntriesError;
  console.log(`✓ Imported ${libraryEntryRows.length} library entries`);

  console.log("✓ Import complete");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  importLegacyData().catch((error) => {
    console.error(
      "Import failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  });
}
