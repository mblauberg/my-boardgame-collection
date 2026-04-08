import type { LegacyGame } from './legacyTypes.js';
import { slugify } from './slugify.js';

export type NormalizedGame = {
  slug: string;
  name: string;
  status: 'owned' | 'buy' | 'new_rec' | 'cut';
  players_min: number | null;
  players_max: number | null;
  play_time_min: number | null;
  play_time_max: number | null;
  bgg_rating: number | null;
  bgg_weight: number | null;
  category: string | null;
  summary: string | null;
  rationale: string | null;
  verdict: string | null;
  verdict_color: string | null;
};

export function normalizeGames(games: LegacyGame[], defaultStatus?: 'owned' | 'buy' | 'new_rec' | 'cut'): NormalizedGame[] {
  return games.map(game => normalizeGame(game, defaultStatus));
}

function normalizeGame(game: LegacyGame, defaultStatus?: 'owned' | 'buy' | 'new_rec' | 'cut'): NormalizedGame {
  const status = mapStatus(game.s, defaultStatus);
  const [playersMin, playersMax] = parsePlayers(game.p);
  const [timeMin, timeMax] = parseTime(game.t);

  return {
    slug: slugify(game.name),
    name: game.name,
    status,
    players_min: playersMin,
    players_max: playersMax,
    play_time_min: timeMin,
    play_time_max: timeMax,
    bgg_rating: game.bgg ?? null,
    bgg_weight: game.w ?? null,
    category: game.cat ?? null,
    summary: game.sum ?? null,
    rationale: game.why ?? game.reason ?? null,
    verdict: game.verdict ?? null,
    verdict_color: game.col ?? null,
  };
}

function mapStatus(s: string | undefined, defaultStatus?: 'owned' | 'buy' | 'new_rec' | 'cut'): 'owned' | 'buy' | 'new_rec' | 'cut' {
  if (s === 'own') return 'owned';
  if (s === 'buy') return 'buy';
  if (s === 'new') return 'new_rec';
  if (defaultStatus) return defaultStatus;
  return 'owned';
}

function parsePlayers(p: string | undefined): [number | null, number | null] {
  if (!p) return [null, null];
  
  const match = p.match(/^(\d+)(?:-(\d+))?(\+)?$/);
  if (!match) return [null, null];
  
  const min = parseInt(match[1], 10);
  const max = match[2] ? parseInt(match[2], 10) : min;
  
  return [min, match[3] ? null : max];
}

function parseTime(t: string | undefined): [number | null, number | null] {
  if (!t) return [null, null];
  
  const match = t.match(/^(\d+)m$/);
  if (!match) return [null, null];
  
  const time = parseInt(match[1], 10);
  return [time, time];
}
