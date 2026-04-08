import { readFileSync } from 'fs';
import type { LegacyData, LegacyGame } from './legacyTypes.js';

export function extractLegacyData(source: string): LegacyData {
  const ownedMatch = source.match(/const OWNED = (\[[\s\S]*?\n\]);/);
  const plannedMatch = source.match(/const PLANNED = (\[[\s\S]*?\n\]);/);
  const newRecsMatch = source.match(/const NEW_RECS = (\[[\s\S]*?\n\]);/);
  const stillCutMatch = source.match(/const STILL_CUT = (\[[\s\S]*?\n\]);/);

  if (!ownedMatch || !plannedMatch || !newRecsMatch || !stillCutMatch) {
    throw new Error('Failed to extract all legacy arrays');
  }

  return {
    owned: parseArray(ownedMatch[1]),
    planned: parseArray(plannedMatch[1]),
    newRecommendations: parseArray(newRecsMatch[1]),
    stillCut: parseArray(stillCutMatch[1]),
  };
}

function parseArray(arrayStr: string): LegacyGame[] {
  const cleaned = arrayStr
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/\bO\b/g, '"own"')
    .replace(/\bB\b/g, '"buy"')
    .replace(/\bN\b/g, '"new"')
    .replace(/\bname:/g, '"name":')
    .replace(/\bbgg:/g, '"bgg":')
    .replace(/\bw:/g, '"w":')
    .replace(/\bp:/g, '"p":')
    .replace(/\bt:/g, '"t":')
    .replace(/\bcat:/g, '"cat":')
    .replace(/\bsum:/g, '"sum":')
    .replace(/\bs:/g, '"s":')
    .replace(/\bverdict:/g, '"verdict":')
    .replace(/\bcol:/g, '"col":')
    .replace(/\bwhy:/g, '"why":')
    .replace(/\breason:/g, '"reason":');

  return JSON.parse(cleaned);
}

export function loadLegacyFile(path: string): LegacyData {
  const source = readFileSync(path, 'utf-8');
  return extractLegacyData(source);
}
