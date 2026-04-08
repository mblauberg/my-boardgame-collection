import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        parchment: "#f4efe6",
        ember: "#b74f2a",
        pine: "#2d5d4b",
        gold: "#d1a954",
      },
      boxShadow: {
        card: "0 18px 45px -24px rgba(23, 32, 42, 0.45)",
      },
    },
  },
  plugins: [],
} satisfies Config;
