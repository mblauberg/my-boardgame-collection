import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("theme token selectors", () => {
  it("applies dark tokens when either root or body has the dark class", async () => {
    const css = await readFile(join(process.cwd(), "src/styles/index.css"), "utf8");

    expect(css).toMatch(/:root\.dark\s*,\s*body\.dark\s*\{/);
  });
});
