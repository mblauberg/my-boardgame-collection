#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import type { SeedPayload } from './legacy/buildSeedPayload.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function importLegacyData() {
  const payload: SeedPayload = JSON.parse(
    readFileSync('scripts/output/seed-data.json', 'utf-8')
  );

  console.log('Importing tags...');
  const tagRows = payload.tags.map((tag) => ({
    name: tag.label,
    slug: tag.slug,
    tag_type: null,
    colour: null,
  }));

  const { error: tagsError } = await supabase
    .from('tags')
    .upsert(tagRows, { onConflict: 'slug' });
  if (tagsError) throw tagsError;
  console.log(`✓ Imported ${payload.tags.length} tags`);

  console.log('Importing games...');
  const gameRows = payload.games.map((game) => ({
    name: game.name,
    slug: game.slug,
    status: game.status,
    players_min: game.players_min,
    players_max: game.players_max,
    play_time_min: game.play_time_min,
    play_time_max: game.play_time_max,
    bgg_rating: game.bgg_rating,
    bgg_weight: game.bgg_weight,
    category: game.category,
    summary: game.summary,
    notes: game.rationale,
    recommendation_verdict: game.verdict,
    recommendation_colour: game.verdict_color,
  }));

  const { error: gamesError } = await supabase
    .from('games')
    .upsert(gameRows, { onConflict: 'slug' });
  if (gamesError) throw gamesError;
  console.log(`✓ Imported ${payload.games.length} games`);

  const [{ data: tags, error: tagLookupError }, { data: games, error: gameLookupError }] =
    await Promise.all([
      supabase.from('tags').select('id, slug'),
      supabase.from('games').select('id, slug'),
    ]);

  if (tagLookupError) throw tagLookupError;
  if (gameLookupError) throw gameLookupError;

  const tagIdBySlug = new Map((tags ?? []).map((tag) => [tag.slug, tag.id]));
  const gameIdBySlug = new Map((games ?? []).map((game) => [game.slug, game.id]));

  console.log('Importing game-tag relationships...');
  const gameTagRows = payload.gameTags.flatMap((gameTag) => {
    const sourceGame = payload.games.find((game) => game.id === gameTag.game_id);
    if (!sourceGame) return [];

    const gameId = gameIdBySlug.get(sourceGame.slug);
    const tagId = tagIdBySlug.get(gameTag.tag_id);

    if (!gameId || !tagId) return [];

    return [{ game_id: gameId, tag_id: tagId }];
  });

  const { error: gameTagsError } = await supabase
    .from('game_tags')
    .upsert(gameTagRows, { onConflict: 'game_id,tag_id' });
  if (gameTagsError) throw gameTagsError;
  console.log(`✓ Imported ${gameTagRows.length} game-tag relationships`);

  console.log('✓ Import complete');
}

importLegacyData().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
