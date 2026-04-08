import { describe, it, expect } from 'vitest';
import { matchesRule, sortGames, selectGamesForRule, type ScenarioGame } from './scenarioPresets';

const mockGame = (overrides: Partial<ScenarioGame> = {}): ScenarioGame => ({
  id: '1',
  name: 'Test Game',
  slug: 'test-game',
  status: 'owned',
  tags: [],
  ...overrides,
});

describe('scenarioPresets', () => {
  describe('matchesRule', () => {
    it('filters by status', () => {
      const game = mockGame({ status: 'buy' });
      expect(matchesRule(game, { statuses: ['owned'] })).toBe(false);
      expect(matchesRule(game, { statuses: ['buy'] })).toBe(true);
    });

    it('excludes hidden games by default', () => {
      const game = mockGame({ hidden: true });
      expect(matchesRule(game, {})).toBe(false);
      expect(matchesRule(game, { includeHidden: true })).toBe(true);
    });

    it('matches allTags requirement', () => {
      const game = mockGame({ tags: ['co-op', 'two-player'] });
      expect(matchesRule(game, { allTags: ['co-op', 'two-player'] })).toBe(true);
      expect(matchesRule(game, { allTags: ['co-op', 'party'] })).toBe(false);
    });

    it('matches anyTags requirement', () => {
      const game = mockGame({ tags: ['co-op'] });
      expect(matchesRule(game, { anyTags: ['co-op', 'party'] })).toBe(true);
      expect(matchesRule(game, { anyTags: ['party', 'solo'] })).toBe(false);
    });

    it('excludes games with excludeTags', () => {
      const game = mockGame({ tags: ['co-op', 'party'] });
      expect(matchesRule(game, { excludeTags: ['solo'] })).toBe(true);
      expect(matchesRule(game, { excludeTags: ['party'] })).toBe(false);
    });

    it('matches player count ranges', () => {
      const game = mockGame({ players_min: 2, players_max: 4 });
      expect(matchesRule(game, { minPlayers: 3, maxPlayers: 5 })).toBe(true);
      expect(matchesRule(game, { minPlayers: 5 })).toBe(false);
      expect(matchesRule(game, { maxPlayers: 1 })).toBe(false);
    });

    it('matches time ranges', () => {
      const game = mockGame({ play_time_min: 30, play_time_max: 60 });
      expect(matchesRule(game, { minTime: 20, maxTime: 70 })).toBe(true);
      expect(matchesRule(game, { minTime: 70 })).toBe(false);
      expect(matchesRule(game, { maxTime: 20 })).toBe(false);
    });

    it('matches weight ranges', () => {
      const game = mockGame({ bgg_weight: 2.5 });
      expect(matchesRule(game, { minWeight: 2.0, maxWeight: 3.0 })).toBe(true);
      expect(matchesRule(game, { minWeight: 3.0 })).toBe(false);
      expect(matchesRule(game, { maxWeight: 2.0 })).toBe(false);
    });

    it('matches category includes', () => {
      const game = mockGame({ category: 'Strategy' });
      expect(matchesRule(game, { categoryIncludes: ['strategy'] })).toBe(true);
      expect(matchesRule(game, { categoryIncludes: ['party'] })).toBe(false);
    });
  });

  describe('sortGames', () => {
    it('sorts by rating descending by default', () => {
      const games = [
        mockGame({ name: 'A', bgg_rating: 7.0 }),
        mockGame({ name: 'B', bgg_rating: 8.5 }),
        mockGame({ name: 'C', bgg_rating: 6.0 }),
      ];
      const sorted = sortGames(games);
      expect(sorted.map((g) => g.name)).toEqual(['B', 'A', 'C']);
    });

    it('sorts by weight ascending', () => {
      const games = [
        mockGame({ name: 'A', bgg_weight: 3.0 }),
        mockGame({ name: 'B', bgg_weight: 1.5 }),
        mockGame({ name: 'C', bgg_weight: 2.2 }),
      ];
      const sorted = sortGames(games, 'weight_asc');
      expect(sorted.map((g) => g.name)).toEqual(['B', 'C', 'A']);
    });

    it('sorts by name ascending', () => {
      const games = [
        mockGame({ name: 'Zebra' }),
        mockGame({ name: 'Apple' }),
        mockGame({ name: 'Mango' }),
      ];
      const sorted = sortGames(games, 'name_asc');
      expect(sorted.map((g) => g.name)).toEqual(['Apple', 'Mango', 'Zebra']);
    });
  });

  describe('selectGamesForRule', () => {
    it('filters, sorts, and limits games', () => {
      const games = [
        mockGame({ name: 'A', status: 'owned', bgg_rating: 7.0, tags: ['co-op'] }),
        mockGame({ name: 'B', status: 'owned', bgg_rating: 8.5, tags: ['co-op'] }),
        mockGame({ name: 'C', status: 'buy', bgg_rating: 9.0, tags: ['co-op'] }),
        mockGame({ name: 'D', status: 'owned', bgg_rating: 6.0, tags: ['co-op'] }),
      ];
      const result = selectGamesForRule(games, {
        statuses: ['owned'],
        allTags: ['co-op'],
        sortBy: 'rating_desc',
        limit: 2,
      });
      expect(result.map((g) => g.name)).toEqual(['B', 'A']);
    });
  });
});
