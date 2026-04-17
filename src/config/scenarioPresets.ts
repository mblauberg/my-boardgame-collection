// scenarioPresets.ts
// Config-driven scenario matching for the board game web app.

import type { GameStatus } from "../types/domain";

export type ScenarioGame = {
  id: string;
  name: string;
  slug: string;
  status: GameStatus;
  hidden?: boolean | null;
  buy_priority?: number | null;
  bgg_rating?: number | null;
  bgg_weight?: number | null;
  bgg_rank?: number | null;
  bgg_num_ratings?: number | null;
  year_published?: number | null;
  players_min?: number | null;
  players_max?: number | null;
  play_time_min?: number | null;
  play_time_max?: number | null;
  category?: string | null;
  tags: string[];
};

export type Rule = {
  statuses?: GameStatus[];
  includeHidden?: boolean;
  allTags?: string[];
  anyTags?: string[];
  excludeTags?: string[];
  minPlayers?: number;
  maxPlayers?: number;
  minTime?: number;
  maxTime?: number;
  minWeight?: number;
  maxWeight?: number;
  minRating?: number;
  minRatingsCount?: number;
  minYear?: number;
  maxYear?: number;
  categoryIncludes?: string[];
  limit?: number;
  sortBy?: 'rating_desc' | 'rating_asc' | 'weight_asc' | 'weight_desc' | 'time_asc' | 'priority_asc' | 'name_asc' | 'rank_asc' | 'year_desc' | 'ratings_count_desc';
};

export type ScenarioSection = {
  id: string;
  label: string;
  description: string;
  rule: Rule;
  displayLimit?: number;
  candidatePoolSize?: number;
  rankingMode?: ShelfRankingMode;
  dedupe?: ShelfDedupeMode;
  useStatusFilter?: boolean;
};

type ShelfRankingMode = 'canonical' | 'discovery';
type ShelfDedupeMode = 'none' | 'avoid-previous';

function normalizeScenarioSection(section: ScenarioSection): ScenarioSection {
  return {
    ...section,
    displayLimit: section.displayLimit ?? section.rule.limit,
    candidatePoolSize: section.candidatePoolSize ?? section.rule.limit,
    rankingMode: section.rankingMode ?? 'discovery',
    dedupe: section.dedupe ?? 'avoid-previous',
    useStatusFilter: section.useStatusFilter ?? false,
  };
}

export type ScenarioPreset = {
  id: string;
  emoji: string;
  label: string;
  description: string;
  sections: ScenarioSection[];
};

const DEFAULT_VISIBLE_STATUSES: GameStatus[] = ['owned', 'buy', 'new_rec'];

function toTagSet(tags: string[]): Set<string> {
  return new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean));
}

function containsAll(tagSet: Set<string>, values?: string[]): boolean {
  if (!values?.length) return true;
  return values.every((value) => tagSet.has(value.toLowerCase()));
}

function containsAny(tagSet: Set<string>, values?: string[]): boolean {
  if (!values?.length) return true;
  return values.some((value) => tagSet.has(value.toLowerCase()));
}

function containsNone(tagSet: Set<string>, values?: string[]): boolean {
  if (!values?.length) return true;
  return values.every((value) => !tagSet.has(value.toLowerCase()));
}

function supportsPlayers(game: ScenarioGame, min?: number, max?: number): boolean {
  const gMin = game.players_min ?? 1;
  const gMax = game.players_max ?? 99;

  if (min != null && gMax < min) return false;
  if (max != null && gMin > max) return false;
  return true;
}

function matchesTime(game: ScenarioGame, min?: number, max?: number): boolean {
  const minTime = game.play_time_min ?? 0;
  const maxTime = game.play_time_max ?? Number.MAX_SAFE_INTEGER;

  if (min != null && maxTime < min) return false;
  if (max != null && minTime > max) return false;
  return true;
}

function matchesWeight(game: ScenarioGame, min?: number, max?: number): boolean {
  const weight = game.bgg_weight ?? 0;
  if (min != null && weight < min) return false;
  if (max != null && weight > max) return false;
  return true;
}

function matchesRating(game: ScenarioGame, minRating?: number, minRatingsCount?: number): boolean {
  if (minRating != null && (game.bgg_rating ?? 0) < minRating) return false;
  if (minRatingsCount != null && (game.bgg_num_ratings ?? 0) < minRatingsCount) return false;
  return true;
}

function matchesYear(game: ScenarioGame, minYear?: number, maxYear?: number): boolean {
  const year = game.year_published;
  if (year == null) return false;
  if (minYear != null && year < minYear) return false;
  if (maxYear != null && year > maxYear) return false;
  return true;
}

function matchesCategory(game: ScenarioGame, categoryIncludes?: string[]): boolean {
  if (!categoryIncludes?.length) return true;
  const category = (game.category ?? '').toLowerCase();
  return categoryIncludes.some((value) => category.includes(value.toLowerCase()));
}

function matchesStatus(game: ScenarioGame, statuses?: GameStatus[]): boolean {
  const allowed = statuses ?? DEFAULT_VISIBLE_STATUSES;
  return allowed.includes(game.status);
}

export function matchesRule(game: ScenarioGame, rule: Rule): boolean {
  if (!rule.includeHidden && game.hidden) return false;
  if (!matchesStatus(game, rule.statuses)) return false;
  if (!supportsPlayers(game, rule.minPlayers, rule.maxPlayers)) return false;
  if (!matchesTime(game, rule.minTime, rule.maxTime)) return false;
  if (!matchesWeight(game, rule.minWeight, rule.maxWeight)) return false;
  if (!matchesRating(game, rule.minRating, rule.minRatingsCount)) return false;
  if (rule.minYear != null || rule.maxYear != null) {
    if (!matchesYear(game, rule.minYear, rule.maxYear)) return false;
  }
  if (!matchesCategory(game, rule.categoryIncludes)) return false;

  const tagSet = toTagSet(game.tags);
  if (!containsAll(tagSet, rule.allTags)) return false;
  if (!containsAny(tagSet, rule.anyTags)) return false;
  if (!containsNone(tagSet, rule.excludeTags)) return false;

  return true;
}

export function sortGames(games: ScenarioGame[], sortBy: Rule['sortBy'] = 'rating_desc'): ScenarioGame[] {
  const copy = [...games];

  copy.sort((a, b) => {
    switch (sortBy) {
      case 'rating_asc':
        return (a.bgg_rating ?? 0) - (b.bgg_rating ?? 0);
      case 'weight_asc':
        return (a.bgg_weight ?? 99) - (b.bgg_weight ?? 99);
      case 'weight_desc':
        return (b.bgg_weight ?? 0) - (a.bgg_weight ?? 0);
      case 'time_asc':
        return (a.play_time_min ?? 999) - (b.play_time_min ?? 999);
      case 'priority_asc':
        return (a.buy_priority ?? 9999) - (b.buy_priority ?? 9999);
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'rank_asc':
        return (a.bgg_rank ?? 999999) - (b.bgg_rank ?? 999999);
      case 'year_desc':
        if ((b.year_published ?? 0) !== (a.year_published ?? 0)) {
          return (b.year_published ?? 0) - (a.year_published ?? 0);
        }
        if ((a.bgg_rank ?? 999999) !== (b.bgg_rank ?? 999999)) {
          return (a.bgg_rank ?? 999999) - (b.bgg_rank ?? 999999);
        }
        if ((b.bgg_num_ratings ?? 0) !== (a.bgg_num_ratings ?? 0)) {
          return (b.bgg_num_ratings ?? 0) - (a.bgg_num_ratings ?? 0);
        }
        if ((b.bgg_rating ?? 0) !== (a.bgg_rating ?? 0)) {
          return (b.bgg_rating ?? 0) - (a.bgg_rating ?? 0);
        }
        return a.name.localeCompare(b.name);
      case 'ratings_count_desc':
        return (b.bgg_num_ratings ?? 0) - (a.bgg_num_ratings ?? 0);
      case 'rating_desc':
      default:
        return (b.bgg_rating ?? 0) - (a.bgg_rating ?? 0);
    }
  });

  return copy;
}

export function selectGamesForRule(games: ScenarioGame[], rule: Rule): ScenarioGame[] {
  const matched = games.filter((game) => matchesRule(game, rule));
  const sorted = sortGames(matched, rule.sortBy);
  return rule.limit ? sorted.slice(0, rule.limit) : sorted;
}

export function buildScenarioResults(games: ScenarioGame[], presets: ScenarioPreset[] = scenarioPresets) {
  return presets.map((preset) => ({
    ...preset,
    sections: preset.sections.map((section) => ({
      ...section,
      games: selectGamesForRule(games, section.rule),
    })),
  }));
}

// Tag vocabulary guidance for migration / admin use:
// two-player, solo, party, gateway, gamers, couples, non-gamers,
// co-op, competitive, deduction, social-deduction, bluffing, drafting,
// trick-taking, engine-building, deck-building, bag-building, betting,
// racing, adventure, tile-laying, spatial, word, drawing, push-your-luck,
// filler, opener, closer, main-event, relaxed, tense, chaotic, cosy, thinky,
// quick, medium, long, light, medium-weight, heavy

const rawScenarioPresets: ScenarioPreset[] = [
  {
    id: 'for-you',
    emoji: '✨',
    label: 'For You',
    description: 'Personalized recommendations based on your collection.',
    sections: [
      {
        id: 'for-you-all',
        label: 'Recommended',
        description: 'Games we think you\'ll love based on your library.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          sortBy: 'rating_desc',
          limit: 16,
        },
      },
    ],
  },
  {
    id: 'trending',
    emoji: '🔥',
    label: 'Trending',
    description: 'The most popular games in the community right now.',
    sections: [
      {
        id: 'trending-all',
        label: 'Trending Now',
        description: 'High engagement games with strong community backing.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          minRatingsCount: 10000,
          minRating: 6.5,
          sortBy: 'ratings_count_desc',
          limit: 16,
        },
      },
    ],
  },
  {
    id: 'new-releases',
    emoji: '🎁',
    label: 'New Releases',
    description: 'Recently published games making waves.',
    sections: [
      {
        id: 'new-releases-all',
        label: 'Fresh Off the Press',
        description: 'Games published in the last 2 years with strong ratings.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          minYear: new Date().getFullYear() - 2,
          minRatingsCount: 1000,
          minRating: 6.5,
          sortBy: 'year_desc',
          limit: 16,
        },
      },
    ],
  },
  {
    id: 'top-rated',
    emoji: '🏆',
    label: 'Top Rated All-Time',
    description: 'The classics and modern masterpieces everyone should know.',
    sections: [
      {
        id: 'top-rated-all',
        label: 'Hall of Fame',
        description: 'The highest-rated games of all time.',
        rankingMode: 'canonical',
        dedupe: 'none',
        useStatusFilter: false,
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          minRatingsCount: 5000,
          sortBy: 'rank_asc',
          limit: 20,
        },
      },
    ],
  },
  {
    id: 'quick-wins',
    emoji: '⚡',
    label: 'Quick Wins',
    description: 'High-quality games you can finish in 30 minutes or less.',
    sections: [
      {
        id: 'quick-wins-all',
        label: 'Fast & Fantastic',
        description: 'Short games that pack a punch.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          maxTime: 30,
          minRatingsCount: 2000,
          minRating: 6.5,
          sortBy: 'rating_desc',
          limit: 16,
        },
      },
    ],
  },
  {
    id: 'hidden-gems',
    emoji: '💎',
    label: 'Hidden Gems',
    description: 'Underrated games with exceptional quality.',
    sections: [
      {
        id: 'hidden-gems-all',
        label: 'Overlooked Excellence',
        description: 'High-rated games that deserve more attention.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          minRating: 7.5,
          minRatingsCount: 500,
          sortBy: 'rating_desc',
          limit: 16,
        },
      },
    ],
  },
  {
    id: 'gateway-to-strategy',
    emoji: '🎓',
    label: 'Gateway to Strategy',
    description: 'Perfect bridge games for players ready to level up.',
    sections: [
      {
        id: 'gateway-strategy-all',
        label: 'Level Up',
        description: 'Medium-weight games that introduce strategic depth.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          minWeight: 2.0,
          maxWeight: 2.5,
          minRatingsCount: 2000,
          minRating: 7.0,
          sortBy: 'rating_desc',
          limit: 16,
        },
      },
    ],
  },
  {
    id: 'by-player-count',
    emoji: '👥',
    label: 'By Player Count',
    description: 'Find the perfect game for your group size.',
    sections: [
      {
        id: 'best-at-2',
        label: 'Best at 2 Players',
        description: 'Games that shine with exactly two players.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          minPlayers: 2,
          maxPlayers: 2,
          minRatingsCount: 2000,
          minRating: 7.0,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
      {
        id: 'best-at-3-4',
        label: 'Best at 3-4 Players',
        description: 'Perfect for small game nights.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          minPlayers: 3,
          maxPlayers: 4,
          minRatingsCount: 2000,
          minRating: 7.0,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
      {
        id: 'best-at-5-plus',
        label: 'Best at 5+ Players',
        description: 'Games that scale well for larger groups.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          minPlayers: 5,
          minRatingsCount: 2000,
          minRating: 7.0,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
    ],
  },
  {
    id: 'by-mechanic',
    emoji: '⚙️',
    label: 'Discover by Mechanic',
    description: 'Explore games by their core gameplay systems.',
    sections: [
      {
        id: 'engine-building',
        label: 'Engine Building',
        description: 'Build efficient systems that compound over time.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          anyTags: ['engine-building'],
          minRatingsCount: 1000,
          minRating: 6.5,
          sortBy: 'rating_desc',
          limit: 8,
        },
      },
      {
        id: 'deck-building',
        label: 'Deck Building',
        description: 'Craft your perfect deck as you play.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          anyTags: ['deck-building'],
          minRatingsCount: 1000,
          minRating: 6.5,
          sortBy: 'rating_desc',
          limit: 8,
        },
      },
      {
        id: 'drafting',
        label: 'Drafting',
        description: 'Pick and pass to build your strategy.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          anyTags: ['drafting'],
          minRatingsCount: 1000,
          minRating: 6.5,
          sortBy: 'rating_desc',
          limit: 8,
        },
      },
      {
        id: 'worker-placement',
        label: 'Worker Placement',
        description: 'Strategic action selection with limited spots.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          anyTags: ['worker-placement'],
          minRatingsCount: 1000,
          minRating: 6.5,
          sortBy: 'rating_desc',
          limit: 8,
        },
      },
      {
        id: 'area-control',
        label: 'Area Control',
        description: 'Dominate the board through territorial control.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          anyTags: ['area-control'],
          minRatingsCount: 1000,
          minRating: 6.5,
          sortBy: 'rating_desc',
          limit: 8,
        },
      },
      {
        id: 'tile-laying',
        label: 'Tile Laying',
        description: 'Build the board as you play.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          anyTags: ['tile-laying'],
          minRatingsCount: 1000,
          minRating: 6.5,
          sortBy: 'rating_desc',
          limit: 8,
        },
      },
      {
        id: 'trick-taking',
        label: 'Trick Taking',
        description: 'Classic card play with modern twists.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          anyTags: ['trick-taking'],
          minRatingsCount: 1000,
          minRating: 6.5,
          sortBy: 'rating_desc',
          limit: 8,
        },
      },
      {
        id: 'push-your-luck',
        label: 'Push Your Luck',
        description: 'Risk management and calculated gambles.',
        rule: {
          statuses: ['owned', 'buy', 'new_rec'],
          anyTags: ['push-your-luck'],
          minRatingsCount: 1000,
          minRating: 6.5,
          sortBy: 'rating_desc',
          limit: 8,
        },
      },
    ],
  },
  {
    id: 'two-player-night',
    emoji: '💑',
    label: 'Two-Player Night',
    description: 'You and your partner or a close friend — pick by mood.',
    sections: [
      {
        id: 'two-player-tense-coop',
        label: '🔥 Tense Co-op',
        description: 'Tight teamwork, constrained communication, high tension.',
        rule: {
          allTags: ['two-player', 'co-op'],
          anyTags: ['tense', 'deduction', 'trick-taking'],
          maxPlayers: 2,
          sortBy: 'rating_desc',
          limit: 8,
        },
      },
      {
        id: 'two-player-competitive',
        label: '⚔️ Competitive Head-to-Head',
        description: 'Direct but focused two-player games with clear decisions.',
        rule: {
          allTags: ['two-player', 'competitive'],
          excludeTags: ['party'],
          maxPlayers: 2,
          sortBy: 'rating_desc',
          limit: 10,
        },
      },
      {
        id: 'two-player-relaxed',
        label: '🧘 Relaxed / Parallel',
        description: 'Lower-conflict games with a calmer table feel.',
        rule: {
          allTags: ['two-player'],
          anyTags: ['relaxed', 'cosy', 'engine-building', 'tile-laying', 'spatial'],
          maxPlayers: 2,
          sortBy: 'weight_asc',
          limit: 10,
        },
      },
    ],
  },
  {
    id: 'party-night',
    emoji: '🎉',
    label: 'Party Night (5+ Players)',
    description: 'Big group energy — social, loud, and easy to table.',
    sections: [
      {
        id: 'party-team-games',
        label: '🎯 Team Games',
        description: 'Team-based games with broad appeal and easy explanation.',
        rule: {
          allTags: ['party'],
          anyTags: ['team', 'word'],
          minPlayers: 5,
          maxWeight: 2.2,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
      {
        id: 'party-social-deduction',
        label: '🕵️ Social Deduction',
        description: 'Read the room, lie well, and accuse confidently.',
        rule: {
          allTags: ['party'],
          anyTags: ['social-deduction', 'deduction', 'bluffing'],
          minPlayers: 5,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
      {
        id: 'party-fillers',
        label: '⚡ Party Fillers',
        description: 'Short, flexible games to warm up or reset the room.',
        rule: {
          allTags: ['party'],
          anyTags: ['filler', 'drawing', 'bluffing', 'push-your-luck'],
          minPlayers: 5,
          maxTime: 30,
          sortBy: 'time_asc',
          limit: 12,
        },
      },
    ],
  },
  {
    id: 'game-night',
    emoji: '🎲',
    label: 'Game Night (3–5 Players)',
    description: 'A regular hobby night with room for an opener, main event, and closer.',
    sections: [
      {
        id: 'game-night-openers',
        label: '🚀 Openers (15–25 min)',
        description: 'Fast, engaging starters to get everyone warmed up.',
        rule: {
          anyTags: ['opener', 'filler'],
          minPlayers: 3,
          maxPlayers: 5,
          maxTime: 25,
          sortBy: 'rating_desc',
          limit: 10,
        },
      },
      {
        id: 'game-night-main-events',
        label: '🏰 Main Events (45–90 min)',
        description: 'The centrepiece games for a full session.',
        rule: {
          anyTags: ['main-event', 'strategy', 'engine-building', 'racing', 'adventure', 'bag-building', 'betting'],
          minPlayers: 3,
          maxPlayers: 5,
          minTime: 45,
          maxTime: 95,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
      {
        id: 'game-night-closers',
        label: '🌙 Closers (15–20 min)',
        description: 'Lighter games to finish the night cleanly.',
        rule: {
          anyTags: ['closer', 'filler', 'bluffing'],
          minPlayers: 3,
          maxPlayers: 6,
          maxTime: 20,
          sortBy: 'time_asc',
          limit: 10,
        },
      },
    ],
  },
  {
    id: 'converting-non-gamers',
    emoji: '🚪',
    label: 'Converting Non-Gamers',
    description: 'For friends who think board games begin and end with Monopoly.',
    sections: [
      {
        id: 'convert-start-here',
        label: '🟢 Start Here',
        description: 'Low-friction intros with broad appeal.',
        rule: {
          allTags: ['gateway'],
          anyTags: ['non-gamers', 'party', 'quick', 'word'],
          maxWeight: 1.8,
          sortBy: 'weight_asc',
          limit: 12,
        },
      },
      {
        id: 'convert-hooked',
        label: '🟡 Once They’re Hooked',
        description: 'A small step up in depth once they trust modern games.',
        rule: {
          allTags: ['gateway'],
          anyTags: ['push-your-luck', 'tile-laying', 'co-op', 'racing'],
          minWeight: 1.6,
          maxWeight: 2.3,
          sortBy: 'rating_desc',
          limit: 10,
        },
      },
      {
        id: 'convert-ready-for-more',
        label: '🔴 Ready for More',
        description: 'A comfortable bridge into medium strategy games.',
        rule: {
          anyTags: ['strategy', 'engine-building', 'adventure', 'co-op'],
          minWeight: 2.2,
          maxWeight: 2.9,
          sortBy: 'rating_desc',
          limit: 10,
        },
      },
    ],
  },
  {
    id: 'coop-night',
    emoji: '🤝',
    label: 'Co-op Night',
    description: 'Games where the table works together rather than against each other.',
    sections: [
      {
        id: 'coop-light',
        label: '🪶 Light (wt ≤ 2.0)',
        description: 'Accessible co-op picks that stay breezy.',
        rule: {
          allTags: ['co-op'],
          maxWeight: 2.0,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
      {
        id: 'coop-medium',
        label: '⚖️ Medium (wt 2.1–2.8)',
        description: 'More involved cooperation with stronger planning demands.',
        rule: {
          allTags: ['co-op'],
          minWeight: 2.1,
          maxWeight: 2.8,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
    ],
  },
  {
    id: 'quick-games',
    emoji: '⚡',
    label: 'Quick Games (<25 min)',
    description: 'Pub picks, warmups, and between-meal games.',
    sections: [
      {
        id: 'quick-card-play',
        label: '🃏 Card Play',
        description: 'Lean card games and clever tactical fillers.',
        rule: {
          anyTags: ['card-game', 'drafting', 'trick-taking', 'set-collection', 'filler'],
          maxTime: 25,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
      {
        id: 'quick-bluffing',
        label: '🎭 Bluffing',
        description: 'Read people, bluff hard, move fast.',
        rule: {
          anyTags: ['bluffing', 'social-deduction'],
          maxTime: 25,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
      {
        id: 'quick-word-party',
        label: '🗣️ Word & Party',
        description: 'Fast party and word games that are easy to insert anywhere.',
        rule: {
          anyTags: ['word', 'party', 'drawing'],
          maxTime: 25,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
    ],
  },
  {
    id: 'strategy-session',
    emoji: '🧠',
    label: 'Strategy Session (45+ min)',
    description: 'For nights where the table wants more depth and commitment.',
    sections: [
      {
        id: 'strategy-competitive',
        label: '⚔️ Competitive',
        description: 'Thinkier competitive games for engaged players.',
        rule: {
          anyTags: ['strategy', 'engine-building', 'racing', 'adventure', 'deck-building', 'bag-building', 'betting'],
          minTime: 45,
          excludeTags: ['co-op'],
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
      {
        id: 'strategy-coop',
        label: '🤝 Co-op Strategy',
        description: 'More deliberate cooperative sessions.',
        rule: {
          allTags: ['co-op'],
          minTime: 30,
          minWeight: 1.9,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
      {
        id: 'strategy-heavy',
        label: '🏋️ Heavy Phase 2 (≥ 3.0)',
        description: 'The hobby-heavy stuff for when the group is ready.',
        rule: {
          minWeight: 3.0,
          minTime: 60,
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
    ],
  },
  {
    id: 'solo-gaming',
    emoji: '🧘',
    label: 'Solo Gaming',
    description: 'For quiet nights and personal play sessions.',
    sections: [
      {
        id: 'solo-available-now',
        label: '✦ Available Now',
        description: 'Owned solo-capable games you can play immediately.',
        rule: {
          statuses: ['owned'],
          allTags: ['solo'],
          sortBy: 'rating_desc',
          limit: 12,
        },
      },
      {
        id: 'solo-to-buy',
        label: '🛒 To Buy',
        description: 'Solo-capable wishlist and recommendation targets.',
        rule: {
          statuses: ['buy', 'new_rec'],
          allTags: ['solo'],
          sortBy: 'priority_asc',
          limit: 12,
        },
      },
    ],
  },
];

export const scenarioPresets: ScenarioPreset[] = rawScenarioPresets.map((preset) => ({
  ...preset,
  sections: preset.sections.map((section) => normalizeScenarioSection(section)),
}));
