import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import stylePolicyPatterns from "../policy/stylePolicyPatterns.json";

const SRC_DIR = join(process.cwd(), "src");
const RUNTIME_EXTENSIONS = new Set([".ts", ".tsx"]);
const TEST_FILE_PATTERN = /(?:\.test|\.spec)\.[jt]sx?$/;
const HARD_CODED_COLOR_PATTERN = new RegExp(
  stylePolicyPatterns.hardcodedColorPatternSource,
  stylePolicyPatterns.hardcodedColorPatternFlags,
);
const ARBITRARY_UTILITY_PATTERN = new RegExp(
  stylePolicyPatterns.arbitraryUtilityPatternSource,
  stylePolicyPatterns.arbitraryUtilityPatternFlags,
);
const ALLOWED_HARDCODED_COLORS_BY_FILE: Record<string, Set<string>> = {
  "src/components/ui/GameCard.tsx": new Set([
    "#f3e7d5",
    "#b75d2b",
    "#2f3e46",
    "#e4efe7",
    "#4f7f52",
    "#23312a",
    "#efe4d6",
    "#915f39",
    "#392a1f",
    "#e5edf5",
    "#476f9b",
    "#22354c",
    "#ffffff",
  ]),
};
const ALLOWED_ARBITRARY_UTILITIES = new Set([
  "aspect-[3/2]",
  "aspect-[4/5]",
  "blur-[80px]",
  "ease-[cubic-bezier(0.34,1.56,0.64,1)]",
  "font-['Manrope']",
  "grid-cols-[1.4fr_0.8fr]",
  "grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]",
  "grid-rows-[0fr]",
  "grid-rows-[1fr]",
  "leading-[1.1]",
  "max-h-[100dvh]",
  "max-h-[calc(100dvh-10rem)]",
  "max-h-[min(46rem,90vh)]",
  "max-h-[min(48rem,calc(100dvh-3rem))]",
  "max-h-[min(52rem,calc(100dvh-3rem))]",
  "max-h-[min(90vh,calc(100vh-2rem))]",
  "max-w-[34rem]",
  "max-w-[44rem]",
  "min-h-[16rem]",
  "min-h-[36px]",
  "min-h-[38rem]",
  "min-h-[44px]",
  "min-w-[240px]",
  "min-w-[5.5rem]",
  "pt-[calc(0.75rem+env(safe-area-inset-top,0px))]",
  "pt-[calc(7rem+env(safe-area-inset-top,0px))]",
  "rounded-[1.5rem]",
  "rounded-[1.75rem]",
  "rounded-[2rem]",
  "scale-[0.99]",
  "scale-[1.01]",
  "scale-[1.02]",
  "scale-[1.03]",
  "scale-[1.04]",
  "text-[0.625rem]",
  "text-[0.65rem]",
  "text-[0.68rem]",
  "text-[0.95rem]",
  "text-[1.05rem]",
  "text-[1.15rem]",
  "text-[10px]",
  "text-[11px]",
  "text-[18px]",
  "text-[20px]",
  "text-[22px]",
  "text-[9px]",
  "tracking-[0.12em]",
  "tracking-[0.16em]",
  "tracking-[0.18em]",
  "tracking-[0.22em]",
  "tracking-[0.25em]",
  "tracking-[0.2em]",
  "tracking-[0.3em]",
  "transition-[color,transform]",
  "transition-[grid-template-rows,opacity,transform]",
  "z-[70]",
  "z-[80]",
  "z-[90]",
]);

async function listRuntimeSourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "test") {
          return [];
        }
        return listRuntimeSourceFiles(entryPath);
      }

      if (!entry.isFile()) {
        return [];
      }

      if (!RUNTIME_EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf(".")))) {
        return [];
      }

      if (TEST_FILE_PATTERN.test(entry.name)) {
        return [];
      }

      return [entryPath];
    }),
  );

  return files.flat();
}

function relativePath(fromRoot: string): string {
  return relative(process.cwd(), fromRoot).split("\\").join("/");
}

describe("theme style consistency policy", () => {
  it("detects hardcoded colors across modern CSS color functions case-insensitively", () => {
    const source = "oklch(62% 0.2 20) OKLAB(0.62 0.1 0.03) Lab(50 10 20) LCH(52 40 260)";
    const matches = source.match(HARD_CODED_COLOR_PATTERN);

    expect(matches).toEqual([
      "oklch(62% 0.2 20)",
      "OKLAB(0.62 0.1 0.03)",
      "Lab(50 10 20)",
      "LCH(52 40 260)",
    ]);
  });

  it("blocks hardcoded colors and arbitrary-value utility drift in runtime code", async () => {
    const runtimeFiles = await listRuntimeSourceFiles(SRC_DIR);
    const violations: string[] = [];

    for (const filePath of runtimeFiles) {
      const source = await readFile(filePath, "utf8");
      const rel = relativePath(filePath);

      const allowedHardcodedColors = ALLOWED_HARDCODED_COLORS_BY_FILE[rel] ?? new Set<string>();
      const hardcodedColorMatches = source.match(HARD_CODED_COLOR_PATTERN) ?? [];
      for (const match of hardcodedColorMatches) {
        if (!allowedHardcodedColors.has(match)) {
          violations.push(rel + ': hardcoded color token "' + match + '"');
        }
      }

      const arbitraryUtilityMatches = source.match(ARBITRARY_UTILITY_PATTERN) ?? [];
      for (const match of arbitraryUtilityMatches) {
        if (!ALLOWED_ARBITRARY_UTILITIES.has(match)) {
          violations.push(rel + ': arbitrary utility "' + match + '"');
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
