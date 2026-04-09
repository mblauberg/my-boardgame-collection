import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { buildGameTagRows, mapLegacyGameToLibraryEntry } from './importLegacyData.js';

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
        is_saved: false,
        is_loved: false,
        is_in_collection: true,
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

  it('maps buy games into saved library entries', () => {
    expect(
      mapLegacyGameToLibraryEntry(
        {
          id: 'game-3',
          slug: 'arcs',
          name: 'Arcs',
          status: 'buy',
          players_min: 2,
          players_max: 4,
          play_time_min: 60,
          play_time_max: 120,
          bgg_rating: 8.3,
          bgg_weight: 3.2,
          category: null,
          summary: null,
          rationale: 'buy soon',
          verdict: null,
          verdict_color: null,
        },
        'user-1',
        'db-game-3',
      ),
    ).toEqual(
      expect.objectContaining({
        user_id: 'user-1',
        game_id: 'db-game-3',
        is_saved: true,
        is_loved: false,
        is_in_collection: false,
        notes: 'buy soon',
      }),
    );
  });

  it("maps payload tag ids onto database tag ids when building game-tag joins", () => {
    const rows = buildGameTagRows(
      {
        games: [
          {
            id: "game-1",
            slug: "heat",
            name: "Heat",
            status: "buy",
            players_min: 1,
            players_max: 6,
            play_time_min: 45,
            play_time_max: 45,
            bgg_rating: 8.2,
            bgg_weight: 2.2,
            category: "Racing",
            summary: null,
            rationale: null,
            verdict: null,
            verdict_color: null,
          },
        ],
        tags: [{ id: "two-player", slug: "two-player", label: "Two Player" }],
        gameTags: [{ game_id: "game-1", tag_id: "two-player" }],
      },
      new Map([["heat", "db-game-1"]]),
      new Map([["two-player", "db-tag-1"]]),
    );

    expect(rows).toEqual([{ game_id: "db-game-1", tag_id: "db-tag-1" }]);
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
