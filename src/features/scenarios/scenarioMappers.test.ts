import { describe, it, expect } from 'vitest';
import { mapGameToScenarioGame, buildScenarioPresetResults } from './scenarioMappers';
import type { Game } from '../../types/domain';

const mockGame = (overrides: Partial<Game> = {}): Game => ({
  id: '1',
  name: 'Test Game',
  slug: 'test-game',
  status: 'owned',
  hidden: false,
  buyPriority: null,
  bggId: null,
  bggUrl: null,
  bggRating: null,
  bggWeight: null,
  publishedYear: null,
  playersMin: null,
  playersMax: null,
  playTimeMin: null,
  playTimeMax: null,
  category: null,
  summary: null,
  notes: null,
  gapReason: null,
  recommendationVerdict: null,
  recommendationColour: null,
  isExpansionIncluded: false,
  imageUrl: null,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('scenarioMappers', () => {
  describe('mapGameToScenarioGame', () => {
    it('maps domain Game to ScenarioGame shape', () => {
      const game = mockGame({
        name: 'Heat',
        slug: 'heat',
        status: 'owned',
        bggRating: 8.2,
        bggWeight: 2.3,
        playersMin: 1,
        playersMax: 6,
        playTimeMin: 30,
        playTimeMax: 60,
        category: 'Racing',
        tags: [
          { id: '1', slug: 'racing', name: 'Racing', tagType: 'mechanic', colour: null },
          { id: '2', slug: 'engine-building', name: 'Engine Building', tagType: 'mechanic', colour: null },
        ],
      });

      const result = mapGameToScenarioGame(game);

      expect(result).toEqual({
        id: '1',
        name: 'Heat',
        slug: 'heat',
        status: 'owned',
        hidden: false,
        buy_priority: null,
        bgg_rating: 8.2,
        bgg_weight: 2.3,
        players_min: 1,
        players_max: 6,
        play_time_min: 30,
        play_time_max: 60,
        category: 'Racing',
        tags: ['racing', 'engine-building'],
      });
    });

    it('handles null values', () => {
      const game = mockGame({ tags: [] });
      const result = mapGameToScenarioGame(game);
      expect(result.tags).toEqual([]);
      expect(result.bgg_rating).toBeNull();
    });
  });

  describe('buildScenarioPresetResults', () => {
    it('builds preset results with matched games', () => {
      const games = [
        mockGame({
          name: 'Hanabi',
          status: 'owned',
          bggRating: 7.2,
          tags: [
            { id: '1', slug: 'co-op', name: 'Co-op', tagType: 'mechanic', colour: null },
            { id: '2', slug: 'two-player', name: 'Two Player', tagType: 'player-count', colour: null },
          ],
        }),
        mockGame({
          name: 'Splendor',
          status: 'owned',
          bggRating: 7.5,
          tags: [{ id: '3', slug: 'engine-building', name: 'Engine Building', tagType: 'mechanic', colour: null }],
        }),
      ];

      const results = buildScenarioPresetResults(games);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('emoji');
      expect(results[0]).toHaveProperty('label');
      expect(results[0]).toHaveProperty('sections');
      expect(results[0].sections[0]).toHaveProperty('games');
    });
  });
});
