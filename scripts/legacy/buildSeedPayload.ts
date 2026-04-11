import type { NormalizedGame } from './normalizeGames.js';

export type SeedPayload = {
  games: Array<NormalizedGame & { id: string }>;
  tags: Array<{ id: string; slug: string; label: string }>;
  gameTags: Array<{ game_id: string; tag_id: string }>;
};

export function buildSeedPayload(games: NormalizedGame[]): SeedPayload {
  const tagMap = new Map<string, string>();
  const gameTags: Array<{ game_id: string; tag_id: string }> = [];
  
  const gamesWithIds = games.map((game, i) => ({
    ...game,
    id: `game-${i + 1}`,
  }));

  gamesWithIds.forEach(game => {
    const tags = extractTags(game);
    tags.forEach(tagSlug => {
      if (!tagMap.has(tagSlug)) {
        tagMap.set(tagSlug, toLabel(tagSlug));
      }
      gameTags.push({ game_id: game.id, tag_id: tagSlug });
    });
  });

  const tags = Array.from(tagMap.entries()).map(([slug, label]) => ({
    id: slug,
    slug,
    label,
  }));

  return { games: gamesWithIds, tags, gameTags };
}

function extractTags(game: NormalizedGame): string[] {
  const tags = new Set<string>();

  if (game.players_min === 2 && game.players_max === 2) tags.add('two-player');
  if (game.players_min === 1) tags.add('solo');
  if (game.players_min && game.players_min >= 5) tags.add('party');

  if (game.category) {
    const cat = game.category.toLowerCase();
    if (cat.includes('co-op')) tags.add('co-op');
    if (cat.includes('competitive')) tags.add('competitive');
    if (cat.includes('deduction')) tags.add('deduction');
    if (cat.includes('social')) tags.add('social-deduction');
    if (cat.includes('bluff')) tags.add('bluffing');
    if (cat.includes('draft')) tags.add('drafting');
    if (cat.includes('trick')) tags.add('trick-taking');
    if (cat.includes('engine')) tags.add('engine-building');
    if (cat.includes('deck')) tags.add('deck-building');
    if (cat.includes('bag')) tags.add('bag-building');
    if (cat.includes('racing')) tags.add('racing');
    if (cat.includes('adventure')) tags.add('adventure');
    if (cat.includes('tile')) tags.add('tile-laying');
    if (cat.includes('spatial') || cat.includes('puzzle')) tags.add('spatial');
    if (cat.includes('word')) tags.add('word');
    if (cat.includes('draw')) tags.add('drawing');
    if (cat.includes('push')) tags.add('push-your-luck');
    if (cat.includes('betting')) tags.add('betting');
    if (cat.includes('card')) tags.add('card-game');
    if (cat.includes('set')) tags.add('set-collection');
    if (cat.includes('gateway')) tags.add('gateway');
    if (cat.includes('party')) tags.add('party');
    if (cat.includes('strategy')) tags.add('strategy');
  }

  if (game.play_time_max && game.play_time_max <= 20) tags.add('filler');
  if (game.play_time_max && game.play_time_max <= 25) tags.add('quick');
  if (game.play_time_min && game.play_time_min >= 45 && game.play_time_max && game.play_time_max <= 95) {
    tags.add('main-event');
  }

  if (game.bgg_weight) {
    if (game.bgg_weight <= 1.8) tags.add('light');
    else if (game.bgg_weight <= 2.5) tags.add('medium-weight');
    else tags.add('heavy');
  }

  return Array.from(tags);
}

function toLabel(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
