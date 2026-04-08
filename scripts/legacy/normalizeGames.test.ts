import { describe, it, expect } from 'vitest';
import { normalizeGames } from './normalizeGames.js';

describe('normalizeGames', () => {
  it('maps raw legacy records into normalized game records', () => {
    const [game] = normalizeGames([
      { name: 'Heat', p: '1-6', t: '45m', cat: 'Racing', s: 'buy' },
    ]);

    expect(game.slug).toBe('heat');
    expect(game.players_min).toBe(1);
    expect(game.players_max).toBe(6);
    expect(game.play_time_min).toBe(45);
    expect(game.status).toBe('buy');
  });

  it('handles 2-player games', () => {
    const [game] = normalizeGames([
      { name: 'Patchwork', p: '2', t: '30m' },
    ]);

    expect(game.players_min).toBe(2);
    expect(game.players_max).toBe(2);
  });

  it('handles open-ended player counts', () => {
    const [game] = normalizeGames([
      { name: 'Codenames', p: '4-8+', t: '15m' },
    ]);

    expect(game.players_min).toBe(4);
    expect(game.players_max).toBe(null);
  });
});
