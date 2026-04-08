import type { Game, Tag } from "../../types/domain";
import type { GameWithTags, TagRow } from "./games.types";

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
    status: record.status,
    buyPriority: record.buy_priority,
    bggRating: record.bgg_rating,
    bggWeight: record.bgg_weight,
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
