#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import type { SeedPayload } from './legacy/buildSeedPayload.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function importLegacyData() {
  const payload: SeedPayload = JSON.parse(
    readFileSync('scripts/output/seed-data.json', 'utf-8')
  );

  console.log('Importing tags...');
  const { error: tagsError } = await supabase.from('tags').insert(payload.tags);
  if (tagsError) throw tagsError;
  console.log(`✓ Imported ${payload.tags.length} tags`);

  console.log('Importing games...');
  const { error: gamesError } = await supabase.from('games').insert(payload.games);
  if (gamesError) throw gamesError;
  console.log(`✓ Imported ${payload.games.length} games`);

  console.log('Importing game-tag relationships...');
  const { error: gameTagsError } = await supabase.from('game_tags').insert(payload.gameTags);
  if (gameTagsError) throw gameTagsError;
  console.log(`✓ Imported ${payload.gameTags.length} game-tag relationships`);

  console.log('✓ Import complete');
}

importLegacyData().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
