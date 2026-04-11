import js from "@eslint/js";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["coverage/**", "dist/**", "node_modules/**", "scripts/output/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/**/*.test.{ts,tsx}",
      "src/**/*.spec.{ts,tsx}",
      "src/test/**",
      "src/components/ui/GameCard.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b|\\b(?:rgb|rgba|hsl|hsla)\\((?!\\s*var\\(--)/]",
          message: "Use theme tokens and CSS variables instead of hardcoded color values in runtime UI code.",
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b|\\b(?:rgb|rgba|hsl|hsla)\\((?!\\s*var\\(--)/]",
          message: "Use theme tokens and CSS variables instead of hardcoded color values in runtime UI code.",
        },
        {
          selector:
            "Literal[value=/\\b(?:bg|text|border|from|to|via|ring|fill|stroke|shadow)-\\[(?:#|var\\(--|(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\\()/]",
          message:
            "Avoid ad-hoc arbitrary color utilities. Prefer token classes (e.g. text-primary, bg-surface).",
        },
        {
          selector:
            "TemplateElement[value.raw=/\\b(?:bg|text|border|from|to|via|ring|fill|stroke|shadow)-\\[(?:#|var\\(--|(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\\()/]",
          message:
            "Avoid ad-hoc arbitrary color utilities. Prefer token classes (e.g. text-primary, bg-surface).",
        },
      ],
    },
  },
  {
    files: ["supabase/functions/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Deno: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
);
