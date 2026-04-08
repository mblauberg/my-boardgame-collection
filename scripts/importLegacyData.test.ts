import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { mapLegacyGameToLibraryEntry } from './importLegacyData.js';

describe('importLegacyData', () => {
  it('maps owned games into collection library entries', () => {
    expect(
      mapLegacyGameToLibraryEntry(
        {
          id: 'game-1',
          slug: 'heat',
          name: 'Heat',
          status: 'owned',
          players_min: 1,
          players_max: 6,
          play_time_min: 30,
          play_time_max: 60,
          bgg_rating: 8.0,
          bgg_weight: 2.2,
          category: null,
          summary: null,
          rationale: 'great with groups',
          verdict: null,
          verdict_color: null,
        },
        'user-1',
        'db-game-1',
      ),
    ).toEqual(
      expect.objectContaining({
        user_id: 'user-1',
        game_id: 'db-game-1',
        list_type: 'collection',
        notes: 'great with groups',
      }),
    );
  });

  it('does not create library entries for recommendation-only legacy states', () => {
    expect(
      mapLegacyGameToLibraryEntry(
        {
          id: 'game-2',
          slug: 'ark-nova',
          name: 'Ark Nova',
          status: 'new_rec',
          players_min: 1,
          players_max: 4,
          play_time_min: 90,
          play_time_max: 150,
          bgg_rating: 8.6,
          bgg_weight: 3.7,
          category: null,
          summary: null,
          rationale: null,
          verdict: 'Strong fit',
          verdict_color: '#22c55e',
        },
        'user-1',
        'db-game-2',
      ),
    ).toBeNull();
  });

  it('exits with error when required env values are missing', () => {
    expect(() => {
      execSync('tsx scripts/importLegacyData.ts', {
        env: { ...process.env, VITE_SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' },
        stdio: 'pipe',
      });
    }).toThrow();
  });

  it('exits with error when the service role key is missing', () => {
    expect(() => {
      execSync('tsx scripts/importLegacyData.ts', {
        env: {
          ...process.env,
          VITE_SUPABASE_URL: 'https://example.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: '',
        },
        stdio: 'pipe',
      });
    }).toThrow();
  });
});
