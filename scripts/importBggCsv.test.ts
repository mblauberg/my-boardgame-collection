import { describe, expect, it } from "vitest";
import { mapBggCsvRecord } from "./importBggCsv";

describe("mapBggCsvRecord", () => {
  it("normalizes zero ranks to null and stores provenance metadata", () => {
    const importedAt = "2026-04-09T00:00:00.000Z";

    const result = mapBggCsvRecord(
      {
        id: "1455",
        name: "Rocketball",
        yearpublished: "2001",
        rank: "0",
        bayesaverage: "0",
        average: "6.2",
        usersrated: "4",
        is_expansion: "0",
        abstracts_rank: "",
        cgs_rank: "",
        childrensgames_rank: "",
        familygames_rank: "",
        partygames_rank: "",
        strategygames_rank: "",
        thematic_rank: "",
        wargames_rank: "",
      },
      importedAt,
    );

    expect(result).toMatchObject({
      bgg_id: 1455,
      bgg_rank: null,
      bgg_data_source: "bgg_csv",
      bgg_data_updated_at: importedAt,
      bgg_snapshot_payload: expect.objectContaining({
        id: "1455",
        rank: "0",
      }),
    });
  });
});
