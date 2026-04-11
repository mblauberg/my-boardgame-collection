import { describe, expect, it } from "vitest";
import {
  semanticBorderRadiusTokens,
  semanticBoxShadowTokens,
  semanticFontSizeTokens,
  semanticSpacingTokens,
} from "./themeTokens";

describe("themeTokens contract", () => {
  it("exports semantic spacing, radius, and shadow token maps backed by CSS variables", () => {
    expect(semanticSpacingTokens).toMatchObject({
      xs: "var(--space-xs)",
      md: "var(--space-md)",
      xl: "var(--space-xl)",
    });
    expect(semanticBorderRadiusTokens).toMatchObject({
      md: "var(--radius-md)",
      xl: "var(--radius-xl)",
      full: "var(--radius-full)",
    });
    expect(semanticBoxShadowTokens).toMatchObject({
      ambient: "var(--shadow-ambient)",
      "ambient-lg": "var(--shadow-ambient-lg)",
    });
  });

  it("links each semantic font size token to typography scale values", () => {
    expect(semanticFontSizeTokens["display-lg"]).toEqual([
      "var(--font-size-display-lg)",
      {
        lineHeight: "var(--line-height-display-lg)",
        letterSpacing: "var(--letter-spacing-display-lg)",
        fontWeight: "var(--font-weight-display)",
      },
    ]);

    expect(semanticFontSizeTokens["body-md"]).toEqual([
      "var(--font-size-body-md)",
      {
        lineHeight: "var(--line-height-body-md)",
        letterSpacing: "var(--letter-spacing-body-md)",
        fontWeight: "var(--font-weight-body)",
      },
    ]);
  });
});
