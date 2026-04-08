import { describe, expect, it, vi } from "vitest";
import { createBggSearchHandler } from "./bgg-search";

function makeRequest(query = "Everdell") {
  return new Request(`http://localhost/api/bgg-search?query=${encodeURIComponent(query)}`, {
    method: "GET",
  });
}

describe("createBggSearchHandler", () => {
  it("returns normalized BGG search results for a valid query", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        `<?xml version="1.0" encoding="utf-8"?>
        <items total="2">
          <item type="boardgame" id="199792">
            <name type="primary" value="Everdell" />
            <yearpublished value="2018" />
          </item>
          <item type="boardgame" id="300000">
            <name type="primary" value="Everdell: Spirecrest" />
            <yearpublished value="2020" />
          </item>
        </items>`,
        { status: 200, headers: { "Content-Type": "application/xml" } },
      ),
    );

    const handler = createBggSearchHandler({
      fetchImpl,
      getToken: () => "token-123",
    });
    const response = await handler(makeRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      results: [
        { id: 199792, name: "Everdell", yearPublished: 2018 },
        { id: 300000, name: "Everdell: Spirecrest", yearPublished: 2020 },
      ],
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://boardgamegeek.com/xmlapi2/search?query=Everdell&type=boardgame",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
        }),
      }),
    );
  });

  it("rejects short queries", async () => {
    const fetchImpl = vi.fn();
    const handler = createBggSearchHandler({ fetchImpl });

    const response = await handler(makeRequest("a"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Search query must be at least 2 characters.",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns a configuration error when the BGG token is missing", async () => {
    const fetchImpl = vi.fn();
    const handler = createBggSearchHandler({
      fetchImpl,
      getToken: () => {
        throw new Error("Missing BGG application token.");
      },
    });

    const response = await handler(makeRequest());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Missing BGG application token.",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
