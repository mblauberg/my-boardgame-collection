import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { z } from "zod";
import type {
  BggMetadataPatch,
  BggSearchResponse,
  BggSearchResult,
  BggThing,
} from "./bgg.types";

const BGG_API_BASE_URL = "https://boardgamegeek.com/xmlapi2/thing";
const BGG_SEARCH_PATH = "/api/bgg-search";
const BGG_REFRESH_PATH = "/api/bgg-refresh";

const bggSearchResponseSchema = z.object({
  results: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
      yearPublished: z.number().int().nullable(),
    }),
  ),
});

const bggRefreshResponseSchema = z.object({
  metadata: z.object({
    bgg_id: z.number().int(),
    bgg_url: z.string(),
    bgg_rating: z.number().nullable(),
    bgg_weight: z.number().nullable(),
    published_year: z.number().int().nullable(),
    image_url: z.string().nullable(),
  }),
});

const offlineGameRowSchema = z.object({
  bgg_id: z.number().int(),
  name: z.string(),
  published_year: z.number().int().nullable(),
  bgg_url: z.string().nullable(),
  image_url: z.string().nullable(),
  players_min: z.number().int().nullable(),
  players_max: z.number().int().nullable(),
  play_time_min: z.number().int().nullable(),
  play_time_max: z.number().int().nullable(),
  bgg_rating: z.number().nullable(),
  bgg_weight: z.number().nullable(),
  summary: z.string().nullable(),
  bgg_rank: z.number().int().nullable(),
  bgg_bayesaverage: z.number().nullable(),
  bgg_usersrated: z.number().int().nullable(),
  is_expansion: z.boolean().nullable(),
  bgg_data_updated_at: z.string().nullable(),
});

function buildBggThingUrl(bggId: number) {
  return `${BGG_API_BASE_URL}?id=${bggId}&stats=1`;
}

function buildBggSearchUrl(query: string) {
  return `${BGG_SEARCH_PATH}?query=${encodeURIComponent(query)}`;
}

function getXmlAttribute(xml: string, tagName: string, attributeName = "value") {
  const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedAttributeName = attributeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(
    new RegExp(
      `<${escapedTagName}\\b[^>]*${escapedAttributeName}="([^"]+)"[^>]*\\/?>`,
      "i",
    ),
  );

  return match?.[1] ?? null;
}

function getXmlNodeContent(xml: string, tagName: string) {
  const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`<${escapedTagName}\\b[^>]*>([\\s\\S]*?)<\\/${escapedTagName}>`, "i"));
  return match?.[1]?.trim() ?? null;
}

function toNullableNumber(value: string | null) {
  if (!value) return null;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNullableInt(value: string | null) {
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildSearchErrorMessage(body: unknown, status: number) {
  if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
    return body.error;
  }

  return `BGG search failed with status ${status}.`;
}

function shouldFallbackToOfflineSearch(status: number, message: string) {
  if (status === 502 || status === 504) return true;
  if (status === 503 && /application token|temporarily unavailable|timeout/i.test(message)) {
    return true;
  }

  return false;
}

function shouldFallbackForFetchError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  return error instanceof TypeError;
}

async function searchOfflineGames(query: string): Promise<BggSearchResponse> {
  const supabase = getSupabaseBrowserClient();
  const formattedQuery = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word}:*`)
    .join(" & ");

  const { data, error } = await supabase
    .from("games")
    .select(
      [
        "bgg_id",
        "name",
        "published_year",
        "bgg_url",
        "image_url",
        "players_min",
        "players_max",
        "play_time_min",
        "play_time_max",
        "bgg_rating",
        "bgg_weight",
        "summary",
        "bgg_rank",
        "bgg_bayesaverage",
        "bgg_usersrated",
        "is_expansion",
        "bgg_data_updated_at",
      ].join(", "),
    )
    .textSearch("search_vector", formattedQuery)
    .order("bgg_rank", { ascending: true, nullsFirst: false })
    .limit(30);

  if (error) {
    throw new Error(error.message);
  }

  const games = z.array(offlineGameRowSchema).parse(data ?? []);
  const updatedAtValues = games
    .map((game) => game.bgg_data_updated_at)
    .filter((value): value is string => Boolean(value))
    .sort();

  return {
    results: games.map((game): BggSearchResult => ({
      id: game.bgg_id,
      name: game.name,
      yearPublished: game.published_year,
      bggUrl: game.bgg_url,
      imageUrl: game.image_url,
      playersMin: game.players_min,
      playersMax: game.players_max,
      playTimeMin: game.play_time_min,
      playTimeMax: game.play_time_max,
      averageRating: game.bgg_rating,
      averageWeight: game.bgg_weight,
      summary: game.summary,
      bggRank: game.bgg_rank,
      bggBayesAverage: game.bgg_bayesaverage,
      bggUsersRated: game.bgg_usersrated,
      isExpansion: game.is_expansion,
    })),
    source: {
      kind: "snapshot",
      label: "Local BGG snapshot",
      updatedAt: updatedAtValues.length > 0 ? updatedAtValues[updatedAtValues.length - 1] : null,
    },
  };
}

export async function fetchBggThing(
  bggId: number,
  fetchImpl: typeof fetch = fetch,
): Promise<BggThing> {
  const response = await fetchImpl(buildBggThingUrl(bggId));

  if (!response.ok) {
    throw new Error(`BGG lookup failed with status ${response.status}.`);
  }

  const xml = await response.text();
  const itemId = toNullableInt(
    xml.match(/<item\b[^>]*id="(\d+)"/i)?.[1] ?? null,
  );

  if (!itemId) {
    throw new Error("BGG response did not include a game item.");
  }

  return {
    id: itemId,
    yearPublished: toNullableInt(getXmlAttribute(xml, "yearpublished")),
    imageUrl: getXmlNodeContent(xml, "image") ?? getXmlNodeContent(xml, "thumbnail") ?? null,
    stats: {
      averageRating: toNullableNumber(getXmlAttribute(xml, "average")),
      averageWeight: toNullableNumber(getXmlAttribute(xml, "averageweight")),
    },
  };
}

export async function searchBggGames(
  query: string,
  fetchImpl: typeof fetch = fetch,
): Promise<BggSearchResponse> {
  let response: Response;

  try {
    response = await fetchImpl(buildBggSearchUrl(query));
  } catch (error) {
    if (shouldFallbackForFetchError(error)) {
      console.warn("BGG API search failed. Falling back to offline catalog.", error);
      return searchOfflineGames(query);
    }

    throw error;
  }

  const body = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const message = buildSearchErrorMessage(body, response.status);

    if (shouldFallbackToOfflineSearch(response.status, message)) {
      return searchOfflineGames(query);
    }

    throw new Error(message);
  }

  const payload = bggSearchResponseSchema.parse(body);
  return {
    results: payload.results,
    source: {
      kind: "api",
      label: "Live BGG",
      updatedAt: null,
    },
  };
}

export async function requestBggRefresh(
  {
    accessToken,
    gameId,
  }: {
    accessToken: string;
    gameId: string;
  },
  fetchImpl: typeof fetch = fetch,
): Promise<{ metadata: BggMetadataPatch }> {
  const response = await fetchImpl(BGG_REFRESH_PATH, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ gameId }),
  });

  const body = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : "Unable to refresh BGG metadata.";
    throw new Error(message);
  }

  return bggRefreshResponseSchema.parse(body);
}
