import { describe, it, expect } from 'vitest';
import { buildSeedPayload } from './buildSeedPayload.js';
import type { NormalizedGame } from './normalizeGames.js';

describe('buildSeedPayload', () => {
  it('creates unique tags and join rows from normalized games', () => {
    const games: NormalizedGame[] = [
      {
        slug: 'heat',
        name: 'Heat',
        status: 'buy',
        players_min: 1,
        players_max: 6,
        play_time_min: 45,
        play_time_max: 45,
        bgg_rating: 8.2,
        bgg_weight: 2.2,
        category: 'Racing',
        summary: null,
        rationale: null,
        verdict: null,
        verdict_color: null,
      },
      {
        slug: 'patchwork',
        name: 'Patchwork',
        status: 'buy',
        players_min: 2,
        players_max: 2,
        play_time_min: 30,
        play_time_max: 30,
        bgg_rating: 7.6,
        bgg_weight: 1.6,
        category: '2P Puzzle',
        summary: null,
        rationale: null,
        verdict: null,
        verdict_color: null,
      },
    ];

    const payload = buildSeedPayload(games);

    expect(payload.tags.length).toBeGreaterThan(0);
    expect(payload.gameTags.length).toBeGreaterThan(0);
    expect(new Set(payload.tags.map(tag => tag.slug)).size).toBe(payload.tags.length);
  });
});
