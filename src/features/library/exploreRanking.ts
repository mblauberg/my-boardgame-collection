import {
  matchesRule,
  sortGames,
  type Rule,
  type ScenarioGame,
  type ScenarioPreset,
  type ScenarioSection,
} from "../../config/scenarioPresets";

type SectionSelectionConfig = Required<
  Pick<
    ScenarioSection,
    "displayLimit" | "candidatePoolSize" | "rankingMode" | "dedupe" | "useStatusFilter"
  >
>;

type SelectShelfGamesArgs = {
  games: ScenarioGame[];
  section: ScenarioSection;
  selectedIds: Set<string>;
  daySeed: string;
};

export type ExploreShelf = Omit<ScenarioPreset, "sections"> & {
  sections: Array<ScenarioSection & { games: ScenarioGame[] }>;
  entries: ScenarioGame[];
};

type DiscoveryCandidateScore = {
  ruleFit: number;
  quality: number;
  confidence: number;
  freshness: number;
  missingPenalty: number;
  composite: number;
};

const DEFAULT_EXPLORE_STATUSES = ["owned", "buy", "new_rec", "cut", "archived"] as const;

function toTagSet(tags: string[]): Set<string> {
  return new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean));
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
  const gameMin = game.players_min ?? 1;
  const gameMax = game.players_max ?? 99;

  if (min != null && gameMax < min) return false;
  if (max != null && gameMin > max) return false;
  return true;
}

function matchesTime(game: ScenarioGame, min?: number, max?: number): boolean {
  const minTime = game.play_time_min ?? 0;
  const maxTime = game.play_time_max ?? Number.MAX_SAFE_INTEGER;

  if (min != null && maxTime < min) return false;
  if (max != null && minTime > max) return false;
  return true;
}

function matchesCategoryWhenPresent(game: ScenarioGame, categoryIncludes?: string[]): boolean {
  if (!categoryIncludes?.length) return true;
  if (!game.category) return true;

  const normalizedCategory = game.category.toLowerCase();
  return categoryIncludes.some((value) => normalizedCategory.includes(value.toLowerCase()));
}

function passesOptionalRange(value: number | null | undefined, min?: number, max?: number): boolean {
  if (value == null) return true;
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

function buildCanonicalRule(rule: Rule, useStatusFilter: boolean): Rule {
  if (useStatusFilter) {
    return rule;
  }

  return {
    ...rule,
    statuses: [...DEFAULT_EXPLORE_STATUSES],
  };
}

function buildDiscoveryRule(rule: Rule, useStatusFilter: boolean): Rule {
  if (useStatusFilter) {
    return rule;
  }

  return {
    ...rule,
    statuses: [...DEFAULT_EXPLORE_STATUSES],
  };
}

function getSeededValue(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function scoreNormalized(value: number, min: number, max: number): number {
  const bounded = Math.min(Math.max(value, min), max);
  if (max === min) return 1;
  return (bounded - min) / (max - min);
}

function scoreInverseNormalized(value: number, min: number, max: number): number {
  return 1 - scoreNormalized(value, min, max);
}

function scorePlayerFit(game: ScenarioGame, rule: Rule): number {
  const targetMin = rule.minPlayers;
  const targetMax = rule.maxPlayers;

  if (targetMin == null && targetMax == null) return 0.5;

  const gameMin = game.players_min ?? targetMin ?? 1;
  const gameMax = game.players_max ?? targetMax ?? 99;

  if (targetMin != null && targetMax != null && gameMin <= targetMin && gameMax >= targetMax) {
    return 1;
  }

  const distanceFromMin = targetMin == null ? 0 : Math.max(0, targetMin - gameMax);
  const distanceFromMax = targetMax == null ? 0 : Math.max(0, gameMin - targetMax);
  return Math.max(0, 1 - (distanceFromMin + distanceFromMax) / 4);
}

function scoreTimeFit(game: ScenarioGame, rule: Rule): number {
  const targetMin = rule.minTime;
  const targetMax = rule.maxTime;

  if (targetMin == null && targetMax == null) return 0.5;

  const gameMin = game.play_time_min ?? targetMin ?? 0;
  const gameMax = game.play_time_max ?? targetMax ?? 180;

  if (targetMin != null && targetMax != null && gameMin <= targetMax && gameMax >= targetMin) {
    return 1;
  }

  const distanceFromMin = targetMin == null ? 0 : Math.max(0, targetMin - gameMax);
  const distanceFromMax = targetMax == null ? 0 : Math.max(0, gameMin - targetMax);
  return Math.max(0, 1 - (distanceFromMin + distanceFromMax) / 120);
}

function scoreWeightFit(game: ScenarioGame, rule: Rule): number {
  if (game.bgg_weight == null) return 0.5;
  if (rule.minWeight != null && game.bgg_weight < rule.minWeight) return 0;
  if (rule.maxWeight != null && game.bgg_weight > rule.maxWeight) return 0;

  if (rule.minWeight != null && rule.maxWeight != null) {
    const midpoint = (rule.minWeight + rule.maxWeight) / 2;
    return Math.max(0, 1 - Math.abs(game.bgg_weight - midpoint) / 3);
  }

  if (rule.maxWeight != null) {
    return scoreInverseNormalized(game.bgg_weight, 0, Math.max(rule.maxWeight, 5));
  }

  return scoreNormalized(game.bgg_weight, rule.minWeight ?? 0, 5);
}

function getDiscoveryCandidateScore(
  game: ScenarioGame,
  section: ScenarioSection,
): DiscoveryCandidateScore {
  const rule = section.rule;

  const tagSet = toTagSet(game.tags);
  const allTagsFit = rule.allTags?.length
    ? rule.allTags.filter((tag) => tagSet.has(tag.toLowerCase())).length / rule.allTags.length
    : 1;
  const anyTagsFit = rule.anyTags?.length ? (containsAny(tagSet, rule.anyTags) ? 1 : 0) : 1;
  const categoryFit = rule.categoryIncludes?.length
    ? game.category && matchesCategoryWhenPresent(game, rule.categoryIncludes)
      ? 1
      : 0
    : 1;

  const ruleFit = allTagsFit * 0.5 + anyTagsFit * 0.3 + categoryFit * 0.2;
  const quality =
    scoreNormalized(game.bgg_rating ?? 6.5, 5, 10) * 0.6 +
    scoreInverseNormalized(game.bgg_rank ?? 25_000, 1, 25_000) * 0.4;
  const confidence = scoreNormalized(game.bgg_num_ratings ?? 0, 0, 20_000);
  const freshness =
    scoreNormalized(game.year_published ?? 2000, 1950, 2030) * 0.4 +
    scorePlayerFit(game, rule) * 0.2 +
    scoreTimeFit(game, rule) * 0.2 +
    scoreWeightFit(game, rule) * 0.2;
  const missingPenalty =
    (game.bgg_rating == null ? 0.3 : 0) +
    (game.bgg_rank == null ? 0.2 : 0) +
    (game.bgg_num_ratings == null ? 0.25 : 0) +
    (game.year_published == null ? 0.15 : 0) +
    (game.bgg_weight == null ? 0.1 : 0);

  return {
    ruleFit,
    quality,
    confidence,
    freshness,
    missingPenalty,
    composite:
      ruleFit * 10 +
      quality * 6 +
      confidence * 3 +
      freshness * 2 -
      missingPenalty,
  };
}

function toScoreBand(value: number): number {
  return Math.round(value * 20);
}

export function buildExploreDaySeed(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getSectionSelectionConfig(section: ScenarioSection): SectionSelectionConfig {
  const limit = section.rule.limit ?? 0;

  return {
    displayLimit: section.displayLimit ?? limit,
    candidatePoolSize: section.candidatePoolSize ?? limit,
    rankingMode: section.rankingMode ?? "discovery",
    dedupe: section.dedupe ?? "avoid-previous",
    useStatusFilter: section.useStatusFilter ?? false,
  };
}

export function matchesExploreRule(game: ScenarioGame, section: ScenarioSection): boolean {
  const config = getSectionSelectionConfig(section);
  const rule = buildDiscoveryRule(section.rule, config.useStatusFilter);

  if (!rule.includeHidden && game.hidden) return false;
  if (rule.statuses && !rule.statuses.includes(game.status)) return false;
  if (!supportsPlayers(game, rule.minPlayers, rule.maxPlayers)) return false;
  if (!matchesTime(game, rule.minTime, rule.maxTime)) return false;
  if (!matchesCategoryWhenPresent(game, rule.categoryIncludes)) return false;
  if (!passesOptionalRange(game.bgg_weight, rule.minWeight, rule.maxWeight)) return false;
  if (!passesOptionalRange(game.bgg_rating, rule.minRating, undefined)) return false;
  if (!passesOptionalRange(game.bgg_num_ratings, rule.minRatingsCount, undefined)) return false;
  if (!passesOptionalRange(game.year_published, rule.minYear, rule.maxYear)) return false;

  const tagSet = toTagSet(game.tags);
  if (!containsAll(tagSet, rule.allTags)) return false;
  if (!containsAny(tagSet, rule.anyTags)) return false;
  if (!containsNone(tagSet, rule.excludeTags)) return false;

  return true;
}

export function scoreDiscoveryCandidate(game: ScenarioGame, section: ScenarioSection): number {
  return getDiscoveryCandidateScore(game, section).composite;
}

export function rankCanonicalCandidates(
  games: ScenarioGame[],
  section: ScenarioSection,
): ScenarioGame[] {
  const config = getSectionSelectionConfig(section);
  const canonicalRule = buildCanonicalRule(section.rule, config.useStatusFilter);
  const matched = games.filter((game) => matchesRule(game, canonicalRule));

  return sortGames(matched, canonicalRule.sortBy);
}

export function rankDiscoveryCandidates(
  games: ScenarioGame[],
  section: ScenarioSection,
  daySeed: string,
): ScenarioGame[] {
  const scored = games
    .filter((game) => matchesExploreRule(game, section))
    .map((game) => {
      const score = getDiscoveryCandidateScore(game, section);

      return {
        game,
        score,
        compositeBand: toScoreBand(score.composite),
        seededValue: getSeededValue(`${daySeed}:${game.id}`),
      };
    });

  scored.sort((left, right) => {
    if (right.score.ruleFit !== left.score.ruleFit) {
      return right.score.ruleFit - left.score.ruleFit;
    }

    if (right.score.quality !== left.score.quality) {
      return right.score.quality - left.score.quality;
    }

    if (right.score.confidence !== left.score.confidence) {
      return right.score.confidence - left.score.confidence;
    }

    if (right.score.freshness !== left.score.freshness) {
      return right.score.freshness - left.score.freshness;
    }

    if (left.score.missingPenalty !== right.score.missingPenalty) {
      return left.score.missingPenalty - right.score.missingPenalty;
    }

    if (right.compositeBand !== left.compositeBand) {
      return right.compositeBand - left.compositeBand;
    }

    if (left.seededValue !== right.seededValue) {
      return left.seededValue - right.seededValue;
    }

    return left.game.id.localeCompare(right.game.id);
  });

  return scored.map((entry) => entry.game);
}

export function selectShelfGames({
  games,
  section,
  selectedIds,
  daySeed,
}: SelectShelfGamesArgs): ScenarioGame[] {
  const config = getSectionSelectionConfig(section);
  const ranked =
    config.rankingMode === "canonical"
      ? rankCanonicalCandidates(games, section)
      : rankDiscoveryCandidates(games, section, daySeed);
  const displayLimit = config.displayLimit > 0 ? config.displayLimit : ranked.length;
  const candidatePool =
    config.candidatePoolSize > 0 ? ranked.slice(0, config.candidatePoolSize) : ranked;

  if (config.rankingMode === "canonical") {
    return ranked.slice(0, displayLimit);
  }

  if (config.dedupe === "none") {
    return candidatePool.slice(0, displayLimit);
  }

  const uniqueSelection = candidatePool
    .filter((game) => !selectedIds.has(game.id))
    .slice(0, displayLimit);

  if (uniqueSelection.length >= displayLimit) {
    return uniqueSelection;
  }

  const selectedIdSet = new Set(uniqueSelection.map((game) => game.id));
  const extendedUniqueSelection = ranked
    .filter((game) => !selectedIds.has(game.id) && !selectedIdSet.has(game.id))
    .slice(0, displayLimit - uniqueSelection.length);
  const dedupeSafeSelection = [...uniqueSelection, ...extendedUniqueSelection];

  if (dedupeSafeSelection.length >= displayLimit) {
    return dedupeSafeSelection;
  }

  const dedupeSafeIdSet = new Set(dedupeSafeSelection.map((game) => game.id));
  const backfill = ranked
    .filter((game) => !dedupeSafeIdSet.has(game.id))
    .slice(0, displayLimit - dedupeSafeSelection.length);

  return [...dedupeSafeSelection, ...backfill];
}

export function buildExploreShelves({
  games,
  presets,
  daySeed,
}: {
  games: ScenarioGame[];
  presets: ScenarioPreset[];
  daySeed: string;
}): ExploreShelf[] {
  const selectedIds = new Set<string>();

  return presets.map((preset) => {
    const sections = preset.sections.map((section) => {
      const selectedGames = selectShelfGames({
        games,
        section,
        selectedIds,
        daySeed,
      });

      for (const game of selectedGames) {
        selectedIds.add(game.id);
      }

      return {
        ...section,
        games: selectedGames,
      };
    });

    return {
      ...preset,
      sections,
      entries: sections.length === 1 ? sections[0]?.games ?? [] : [],
    };
  });
}
