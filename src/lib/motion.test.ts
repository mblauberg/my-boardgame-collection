import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getMotionDurationCssVar, motionTokens } from "./motion";

const MOTION_CSS_FILE = join(process.cwd(), "src/styles/index.css");

function extractCssVariableValue(source: string, variableName: string) {
  const match = source.match(new RegExp(`${variableName}:\\s*([^;]+);`));
  return match?.[1]?.trim() ?? null;
}

describe("motion token contract", () => {
  it("keeps Framer motion durations aligned with the CSS custom properties", async () => {
    const cssSource = await readFile(MOTION_CSS_FILE, "utf8");

    expect(extractCssVariableValue(cssSource, "--motion-duration-instant")).toBe("0ms");
    expect(extractCssVariableValue(cssSource, "--motion-duration-fast")).toBe(
      `${Math.round(motionTokens.duration.fast * 1000)}ms`,
    );
    expect(extractCssVariableValue(cssSource, "--motion-duration-base")).toBe(
      `${Math.round(motionTokens.duration.base * 1000)}ms`,
    );
    expect(extractCssVariableValue(cssSource, "--motion-duration-slow")).toBe(
      `${Math.round(motionTokens.duration.slow * 1000)}ms`,
    );
  });

  it("keeps Framer easing curves aligned with the CSS custom properties", async () => {
    const cssSource = await readFile(MOTION_CSS_FILE, "utf8");

    expect(extractCssVariableValue(cssSource, "--motion-ease-standard")).toBe(
      `cubic-bezier(${motionTokens.ease.standard.join(", ")})`,
    );
    expect(extractCssVariableValue(cssSource, "--motion-ease-emphasized")).toBe(
      `cubic-bezier(${motionTokens.ease.emphasized.join(", ")})`,
    );
  });

  it("exposes CSS variable helpers for shared duration names", () => {
    expect(getMotionDurationCssVar("instant")).toBe("var(--motion-duration-instant)");
    expect(getMotionDurationCssVar("base")).toBe("var(--motion-duration-base)");
    expect(getMotionDurationCssVar("slow")).toBe("var(--motion-duration-slow)");
  });

  it("uses a noticeably slower dedicated duration for the theme-toggle coin flip", () => {
    expect(motionTokens.duration.themeToggle).toBe(0.72);
    expect(motionTokens.duration.themeToggle).toBeGreaterThan(motionTokens.duration.slow);
  });
});
