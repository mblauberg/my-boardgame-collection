import type { Game, Tag } from "../../types/domain";
import type { GameWithTags, TagRow } from "./games.types";

const GAME_STATUSES: readonly Game["status"][] = ["owned", "buy", "new_rec", "cut", "archived"];

function mapStatus(status: string): Game["status"] {
  if ((GAME_STATUSES as readonly string[]).includes(status)) {
    return status as Game["status"];
  }
  return "archived";
}

export function mapTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagType: row.tag_type,
    colour: row.colour,
  };
}

export function mapGameRecord(record: GameWithTags): Game {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    bggId: record.bgg_id,
    bggUrl: record.bgg_url,
    status: mapStatus(record.status),
    buyPriority: record.buy_priority,
    bggRating: record.bgg_rating,
    bggWeight: record.bgg_weight,
    bggRank: record.bgg_rank ?? null,
    bggBayesAverage: record.bgg_bayesaverage ?? null,
    bggUsersRated: record.bgg_usersrated ?? null,
    isExpansion: record.is_expansion ?? null,
    abstractsRank: record.abstracts_rank ?? null,
    cgsRank: record.cgs_rank ?? null,
    childrensGamesRank: record.childrensgames_rank ?? null,
    familyGamesRank: record.familygames_rank ?? null,
    partyGamesRank: record.partygames_rank ?? null,
    strategyGamesRank: record.strategygames_rank ?? null,
    thematicRank: record.thematic_rank ?? null,
    wargamesRank: record.wargames_rank ?? null,
    bggDataSource: record.bgg_data_source ?? null,
    bggDataUpdatedAt: record.bgg_data_updated_at ?? null,
    bggSnapshotPayload:
      record.bgg_snapshot_payload && typeof record.bgg_snapshot_payload === "object"
        ? (record.bgg_snapshot_payload as Record<string, unknown>)
        : null,
    playersMin: record.players_min,
    playersMax: record.players_max,
    playTimeMin: record.play_time_min,
    playTimeMax: record.play_time_max,
    category: record.category,
    summary: record.summary,
    notes: record.notes,
    recommendationVerdict: record.recommendation_verdict,
    recommendationColour: record.recommendation_colour,
    gapReason: record.gap_reason,
    isExpansionIncluded: record.is_expansion_included,
    imageUrl: record.image_url,
    publishedYear: record.published_year,
    hidden: record.hidden,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    tags: record.tags.map(mapTag),
  };
}
