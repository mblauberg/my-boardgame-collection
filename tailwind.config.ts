import type { Config } from "tailwindcss";
import {
  semanticBorderRadiusTokens,
  semanticBoxShadowTokens,
  semanticFontSizeTokens,
  semanticSpacingTokens,
} from "./src/lib/themeTokens";

function withOpacity(varName: string) {
  return `rgb(var(${varName}) / <alpha-value>)`;
}

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // All dynamic colors use RGB channel CSS vars — opacity modifiers (/20, /70 etc) work correctly
        "surface":                    withOpacity("--surface"),
        "surface-container-low":      withOpacity("--surface-container-low"),
        "surface-container-lowest":   withOpacity("--surface-container-lowest"),
        "surface-container-high":     withOpacity("--surface-container-high"),
        "surface-container-highest":  withOpacity("--surface-container-highest"),
        "surface-bright":             withOpacity("--surface-bright"),
        "surface-dim":                withOpacity("--surface-dim"),
        "surface-variant":            withOpacity("--surface-variant"),
        "on-surface":                 withOpacity("--on-surface"),
        "on-surface-variant":         withOpacity("--on-surface-variant"),

        // Primary — amber/orange
        "primary":               withOpacity("--primary"),
        "primary-container":     withOpacity("--primary-container"),
        "on-primary":            withOpacity("--on-primary"),
        "on-primary-fixed":      withOpacity("--on-primary-fixed"),
        "on-primary-container":  withOpacity("--on-primary-container"),
        "primary-fixed":         withOpacity("--primary-fixed"),
        "primary-fixed-dim":     withOpacity("--primary-fixed-dim"),
        "primary-dim":           withOpacity("--primary-dim"),
        "surface-tint":          withOpacity("--surface-tint"),
        "inverse-primary":       withOpacity("--inverse-primary"),

        // Secondary — teal (theme-aware)
        "secondary":                  withOpacity("--secondary"),
        "secondary-container":        withOpacity("--secondary-container"),
        "on-secondary":               withOpacity("--on-secondary"),
        "on-secondary-container":     withOpacity("--on-secondary-container"),
        "secondary-fixed":            withOpacity("--secondary-fixed"),
        "secondary-fixed-dim":        withOpacity("--secondary-fixed-dim"),
        "secondary-dim":              withOpacity("--secondary-dim"),
        "on-secondary-fixed":         withOpacity("--on-secondary-fixed"),
        "on-secondary-fixed-variant": withOpacity("--on-secondary-fixed-variant"),

        // Tertiary — yellow (theme-aware)
        "tertiary":                   withOpacity("--tertiary"),
        "tertiary-container":         withOpacity("--tertiary-container"),
        "on-tertiary":                withOpacity("--on-tertiary"),
        "on-tertiary-container":      withOpacity("--on-tertiary-container"),
        "tertiary-fixed":             withOpacity("--tertiary-fixed"),
        "tertiary-fixed-dim":         withOpacity("--tertiary-fixed-dim"),
        "tertiary-dim":               withOpacity("--tertiary-dim"),
        "on-tertiary-fixed":          withOpacity("--on-tertiary-fixed"),
        "on-tertiary-fixed-variant":  withOpacity("--on-tertiary-fixed-variant"),

        // Error (theme-aware — dark mode uses lighter accessible error)
        "error":              withOpacity("--error"),
        "error-container":    withOpacity("--error-container"),
        "on-error":           withOpacity("--on-error"),
        "on-error-container": withOpacity("--on-error-container"),
        "error-dim":          withOpacity("--error-dim"),

        // Outline (theme-aware)
        "outline":         withOpacity("--outline"),
        "outline-variant": withOpacity("--outline-variant"),

        // Misc surface (theme-aware)
        "background":          withOpacity("--background"),
        "on-background":       withOpacity("--on-background"),
        "inverse-surface":     withOpacity("--inverse-surface"),
        "inverse-on-surface":  withOpacity("--inverse-on-surface"),

        // Legacy aliases that must stay for backwards compat
        "on-primary-fixed-variant": withOpacity("--primary-dim"),
      },
      fontSize: semanticFontSizeTokens,
      spacing: semanticSpacingTokens,
      borderRadius: semanticBorderRadiusTokens,
      boxShadow: semanticBoxShadowTokens,
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
        "label": ["Manrope", "sans-serif"]
      }
    },
  },
  plugins: [],
} satisfies Config;
