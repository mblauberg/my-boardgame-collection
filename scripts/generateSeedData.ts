#!/usr/bin/env node
import { loadLegacyFile } from './legacy/extractLegacyData.js';
import { normalizeGames } from './legacy/normalizeGames.js';
import { buildSeedPayload } from './legacy/buildSeedPayload.js';
import { writeSeedArtifacts } from './legacy/writeSeedArtifacts.js';
import {
  assertLegacyPipelineOptIn,
  LEGACY_SEED_PATH,
  LEGACY_SOURCE_PATH,
} from './legacy/legacyPipeline.js';

assertLegacyPipelineOptIn('legacy:migrate:generate');

const legacyData = loadLegacyFile(LEGACY_SOURCE_PATH);

const owned = normalizeGames(legacyData.owned, 'owned');
const planned = normalizeGames(legacyData.planned, 'buy');
const newRecs = normalizeGames(legacyData.newRecommendations, 'new_rec');
const cut = normalizeGames(legacyData.stillCut, 'cut');

const allGames = [...owned, ...planned, ...newRecs, ...cut];
const payload = buildSeedPayload(allGames);

writeSeedArtifacts(payload, LEGACY_SEED_PATH);

console.log('✓ Generated seed-data.json');
console.log(`  ${payload.games.length} games`);
console.log(`  ${payload.tags.length} tags`);
console.log(`  ${payload.gameTags.length} game-tag relationships`);
