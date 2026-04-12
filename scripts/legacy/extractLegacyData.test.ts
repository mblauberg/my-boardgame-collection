import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { extractLegacyData } from './extractLegacyData.js';

describe('extractLegacyData', () => {
  it('extracts owned, planned, recommendation, and cut arrays from the legacy JSX file', () => {
    const source = readFileSync('scripts/legacy/assets/board-game-collection.jsx', 'utf-8');
    const result = extractLegacyData(source);

    expect(result.owned.length).toBeGreaterThan(0);
    expect(result.planned.length).toBeGreaterThan(0);
    expect(result.newRecommendations.length).toBeGreaterThan(0);
    expect(result.stillCut.length).toBeGreaterThan(0);
  });
});
