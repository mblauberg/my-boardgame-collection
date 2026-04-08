import { z } from "zod";
import type { BggMetadataPatch, BggSearchResult, BggThing } from "./bgg.types";

const BGG_API_BASE_URL = "https://boardgamegeek.com/xmlapi2/thing";
const BGG_API_SEARCH_URL = "https://boardgamegeek.com/xmlapi2/search";
const BGG_REFRESH_PATH = "/api/bgg-refresh";

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

function buildBggThingUrl(bggId: number) {
  return `${BGG_API_BASE_URL}?id=${bggId}&stats=1`;
}

function buildBggSearchUrl(query: string) {
  return `${BGG_API_SEARCH_URL}?query=${encodeURIComponent(query)}&type=boardgame`;
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
): Promise<BggSearchResult[]> {
  const response = await fetchImpl(buildBggSearchUrl(query));

  if (!response.ok) {
    throw new Error(`BGG search failed with status ${response.status}.`);
  }

  const xml = await response.text();
  const items = [...xml.matchAll(/<item\b[^>]*id="(\d+)"[\s\S]*?<name\b[^>]*value="([^"]+)"[\s\S]*?(?:<yearpublished\b[^>]*value="(\d+)")?/gi)];

  return items.map((match) => ({
    id: Number.parseInt(match[1], 10),
    name: match[2],
    yearPublished: match[3] ? Number.parseInt(match[3], 10) : null,
  }));
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
