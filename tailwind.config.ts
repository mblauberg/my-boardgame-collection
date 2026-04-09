import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Using CSS variables for automatic dark mode
        "surface": "var(--surface)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        "surface-bright": "var(--surface-bright)",
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        "primary": "var(--primary)",
        "primary-container": "var(--primary-container)",
        "on-primary-fixed": "var(--on-primary-fixed)",
        "outline-variant": "var(--outline-variant)",
        "surface-tint": "var(--surface-tint)",
        
        // Static colors (same in light/dark)
        "outline": "#767775",
        "error-container": "#f95630",
        "error": "#b02500",
        "on-background": "#2e2f2d",
        "primary-fixed": "#fd9000",
        "on-error-container": "#520c00",
        "secondary-fixed": "#8df5e4",
        "on-secondary-container": "#005c53",
        "on-primary-fixed-variant": "#532b00",
        "secondary-fixed-dim": "#7fe6d5",
        "tertiary-dim": "#5f4e00",
        "tertiary": "#6d5a00",
        "secondary": "#00675c",
        "on-tertiary-fixed-variant": "#675500",
        "tertiary-fixed": "#fdd73e",
        "primary-dim": "#794200",
        "inverse-primary": "#fd9000",
        "inverse-surface": "#0d0f0d",
        "on-tertiary-container": "#5c4b00",
        "on-primary-container": "#462400",
        "secondary-dim": "#005a50",
        "on-secondary-fixed-variant": "#00675c",
        "error-dim": "#b92902",
        "secondary-container": "#8df5e4",
        "on-tertiary": "#fff2cf",
        "surface-dim": "#d4d5d1",
        "tertiary-fixed-dim": "#eec930",
        "on-secondary-fixed": "#004840",
        "primary-fixed-dim": "#ea8400",
        "on-primary": "#fff0e6",
        "background": "#f7f6f3",
        "tertiary-container": "#fdd73e",
        "inverse-on-surface": "#9d9d9b",
        "surface-variant": "#ddddda",
        "on-error": "#ffefec",
        "on-tertiary-fixed": "#463900",
        "on-secondary": "#c0fff3",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
        "label": ["Manrope", "sans-serif"]
      }
    },
  },
  plugins: [],
} satisfies Config;
