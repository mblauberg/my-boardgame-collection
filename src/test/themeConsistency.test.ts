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
  // These rgba values are meta[theme-color] values for iOS browser chrome — not CSS styling.
  "src/lib/theme.tsx": new Set(["rgba(19,19,19,0.8)", "rgba(247,246,243,0.72)"]),
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
const ALLOWED_ARBITRARY_UTILITIES_BY_FILE: Record<string, Set<string>> = {
  "src/components/auth/SignInOverlayFrame.tsx": new Set([
    "max-h-[100dvh]",
    "max-h-[min(52rem,calc(100dvh-3rem))]",
    "max-w-[34rem]",
    "scale-[1.02]",
    "text-[0.68rem]",
    "text-[0.95rem]",
    "text-[22px]",
    "tracking-[0.22em]",
    "z-[80]",
  ]),
  "src/components/games/GameDetailOverlay.tsx": new Set([
    "max-h-[min(90vh,calc(100vh-2rem))]",
    "rounded-[1.75rem]",
    "scale-[1.03]",
    "transition-[color,transform]",
  ]),
  "src/components/layout/AppShell.tsx": new Set(["pt-[calc(7rem+env(safe-area-inset-top,0px))]"]),
  "src/components/layout/BottomTabBar.tsx": new Set(["min-w-[5.5rem]", "text-[0.625rem]"]),
  "src/components/layout/PageHeader.tsx": new Set([
    "blur-[80px]",
    "leading-[1.1]",
    "text-[18px]",
    "tracking-[0.25em]",
    "tracking-[0.2em]",
  ]),
  "src/components/layout/TopNavBar.tsx": new Set(["font-['Manrope']", "h-[2px]", "pt-[calc(0.75rem+env(safe-area-inset-top,0px))]"]),
  "src/components/library/AddGameSearchStep.tsx": new Set([
    "min-h-[16rem]",
    "text-[11px]",
    "tracking-[0.12em]",
    "tracking-[0.16em]",
  ]),
  "src/components/library/AddGameWizardOverlay.tsx": new Set([
    "max-h-[min(46rem,90vh)]",
    "min-h-[38rem]",
    "text-[11px]",
    "tracking-[0.18em]",
    "z-[70]",
  ]),
  "src/components/library/AdvancedFilters.tsx": new Set(["min-h-[44px]"]),
  "src/components/library/FilterBar.tsx": new Set([
    "ease-[cubic-bezier(0.34,1.56,0.64,1)]",
    "grid-rows-[0fr]",
    "grid-rows-[1fr]",
    "min-w-[240px]",
    "text-[10px]",
    "transition-[grid-template-rows,opacity,transform]",
  ]),
  "src/components/library/LibraryList.tsx": new Set(["rounded-[1.5rem]"]),
  "src/components/library/LibraryStateIconButton.tsx": new Set(["text-[1.05rem]", "text-[1.15rem]"]),
  "src/components/settings/SignInMethodsSheet.tsx": new Set([
    "max-h-[calc(100dvh-10rem)]",
    "max-h-[min(48rem,calc(100dvh-3rem))]",
    "max-w-[44rem]",
    "text-[10px]",
    "text-[18px]",
    "text-[20px]",
    "text-[22px]",
    "text-[9px]",
    "tracking-[0.18em]",
    "tracking-[0.2em]",
    "z-[90]",
  ]),
  "src/components/settings/SignInMethodsSummaryCard.tsx": new Set([
    "text-[11px]",
    "text-[18px]",
    "text-[9px]",
    "tracking-[0.2em]",
  ]),
  "src/components/ui/GameCard.tsx": new Set(["aspect-[4/5]", "scale-[1.04]", "text-[10px]"]),
  "src/components/ui/GameCardSkeleton.tsx": new Set(["aspect-[3/2]"]),
  "src/components/ui/PillSelector.tsx": new Set(["ease-[cubic-bezier(0.34,1.56,0.64,1)]", "min-h-[36px]", "min-h-[44px]"]),
  "src/components/ui/StateMessagePanel.tsx": new Set(["rounded-[1.5rem]", "rounded-[2rem]"]),
  "src/components/ui/StatusBadge.tsx": new Set(["text-[10px]"]),
  "src/features/auth/PasskeyRegistrationPrompt.tsx": new Set([
    "rounded-[1.5rem]",
    "text-[0.65rem]",
    "tracking-[0.18em]",
  ]),
  "src/features/auth/SignInForm.tsx": new Set(["scale-[0.99]", "scale-[1.01]", "text-[10px]", "tracking-[0.2em]"]),
  "src/pages/AccountSettingsPage.tsx": new Set([
    "grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]",
    "text-[18px]",
    "text-[20px]",
    "tracking-[0.18em]",
    "tracking-[0.2em]",
  ]),
  "src/pages/NotFoundPage.tsx": new Set(["tracking-[0.3em]"]),
  "src/pages/PublicProfilePage.tsx": new Set(["grid-cols-[1.4fr_0.8fr]", "tracking-[0.3em]"]),
  "src/pages/SignInMethodsPage.tsx": new Set(["rounded-[1.5rem]", "rounded-[2rem]"]),
};

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
    const source =
      "oklch(62% 0.2 20) OKLAB(0.62 0.1 0.03) Lab(50 10 20) LCH(52 40 260) " +
      "hwb(220 20% 10%) COLOR(display-p3 0.4 0.2 0.7) color-mix(in srgb, red 40%, blue)";
    const matches = source.match(HARD_CODED_COLOR_PATTERN);

    expect(matches).toEqual([
      "oklch(62% 0.2 20)",
      "OKLAB(0.62 0.1 0.03)",
      "Lab(50 10 20)",
      "LCH(52 40 260)",
      "hwb(220 20% 10%)",
      "COLOR(display-p3 0.4 0.2 0.7)",
      "color-mix(in srgb, red 40%, blue)",
    ]);
  });

  it("blocks hardcoded colors and arbitrary-value utility drift in runtime code", async () => {
    const runtimeFiles = await listRuntimeSourceFiles(SRC_DIR);
    const violations: string[] = [];
    const usedAllowedArbitraryUtilitiesByFile = new Map<string, Set<string>>();

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
      const allowedArbitraryUtilities = ALLOWED_ARBITRARY_UTILITIES_BY_FILE[rel] ?? new Set<string>();
      for (const match of arbitraryUtilityMatches) {
        if (!allowedArbitraryUtilities.has(match)) {
          violations.push(rel + ': arbitrary utility "' + match + '"');
          continue;
        }
        const usedAllowedArbitraryUtilities = usedAllowedArbitraryUtilitiesByFile.get(rel) ?? new Set<string>();
        usedAllowedArbitraryUtilities.add(match);
        usedAllowedArbitraryUtilitiesByFile.set(rel, usedAllowedArbitraryUtilities);
      }
    }

    for (const [filePath, allowedUtilities] of Object.entries(ALLOWED_ARBITRARY_UTILITIES_BY_FILE)) {
      const usedAllowedUtilities = usedAllowedArbitraryUtilitiesByFile.get(filePath) ?? new Set<string>();
      for (const allowedUtility of allowedUtilities) {
        if (!usedAllowedUtilities.has(allowedUtility)) {
          violations.push(filePath + ': stale arbitrary utility allowlist entry "' + allowedUtility + '"');
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
