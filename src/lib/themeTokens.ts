type SemanticTokenMap = Readonly<Record<string, string>>;

type SemanticFontTokenValue = [
  string,
  {
    lineHeight: string;
    letterSpacing: string;
    fontWeight: string | number;
  },
];

type SemanticFontTokenMap = Record<string, SemanticFontTokenValue>;

const cssVar = (tokenName: string) => `var(${tokenName})`;

export const semanticSpacingTokens = {
  "3xs": cssVar("--space-3xs"),
  "2xs": cssVar("--space-2xs"),
  xs: cssVar("--space-xs"),
  sm: cssVar("--space-sm"),
  md: cssVar("--space-md"),
  lg: cssVar("--space-lg"),
  xl: cssVar("--space-xl"),
  "2xl": cssVar("--space-2xl"),
  "3xl": cssVar("--space-3xl"),
} as const satisfies SemanticTokenMap;

export const semanticBorderRadiusTokens = {
  DEFAULT: cssVar("--radius-default"),
  sm: cssVar("--radius-sm"),
  md: cssVar("--radius-md"),
  lg: cssVar("--radius-lg"),
  xl: cssVar("--radius-xl"),
  "2xl": cssVar("--radius-2xl"),
  "3xl": cssVar("--radius-3xl"),
  full: cssVar("--radius-full"),
} as const satisfies SemanticTokenMap;

export const semanticBoxShadowTokens = {
  ambient: cssVar("--shadow-ambient"),
  "ambient-lg": cssVar("--shadow-ambient-lg"),
} as const satisfies SemanticTokenMap;

export const semanticFontSizeTokens: SemanticFontTokenMap = {
  "display-lg": [
    cssVar("--font-size-display-lg"),
    {
      lineHeight: cssVar("--line-height-display-lg"),
      letterSpacing: cssVar("--letter-spacing-display-lg"),
      fontWeight: cssVar("--font-weight-display"),
    },
  ],
  "display-md": [
    cssVar("--font-size-display-md"),
    {
      lineHeight: cssVar("--line-height-display-md"),
      letterSpacing: cssVar("--letter-spacing-display-md"),
      fontWeight: cssVar("--font-weight-display"),
    },
  ],
  "title-lg": [
    cssVar("--font-size-title-lg"),
    {
      lineHeight: cssVar("--line-height-title-lg"),
      letterSpacing: cssVar("--letter-spacing-title-lg"),
      fontWeight: cssVar("--font-weight-title"),
    },
  ],
  "title-md": [
    cssVar("--font-size-title-md"),
    {
      lineHeight: cssVar("--line-height-title-md"),
      letterSpacing: cssVar("--letter-spacing-title-md"),
      fontWeight: cssVar("--font-weight-title"),
    },
  ],
  "body-lg": [
    cssVar("--font-size-body-lg"),
    {
      lineHeight: cssVar("--line-height-body-lg"),
      letterSpacing: cssVar("--letter-spacing-body-lg"),
      fontWeight: cssVar("--font-weight-body"),
    },
  ],
  "body-md": [
    cssVar("--font-size-body-md"),
    {
      lineHeight: cssVar("--line-height-body-md"),
      letterSpacing: cssVar("--letter-spacing-body-md"),
      fontWeight: cssVar("--font-weight-body"),
    },
  ],
  "label-lg": [
    cssVar("--font-size-label-lg"),
    {
      lineHeight: cssVar("--line-height-label-lg"),
      letterSpacing: cssVar("--letter-spacing-label-lg"),
      fontWeight: cssVar("--font-weight-label"),
    },
  ],
  "label-md": [
    cssVar("--font-size-label-md"),
    {
      lineHeight: cssVar("--line-height-label-md"),
      letterSpacing: cssVar("--letter-spacing-label-md"),
      fontWeight: cssVar("--font-weight-label"),
    },
  ],
};
