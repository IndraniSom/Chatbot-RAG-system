import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Tight"', "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        zilla: ['"Zilla Slab"', "Georgia", "serif"],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        // Indigo accent used across the light installation studio.
        iris: {
          50: "#EEF0FF",
          100: "#E0E3FF",
          200: "#C7CCFE",
          300: "#A5AAFC",
          400: "#8B8FF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          950: "#1E1B4B",
        },
        ink: {
          50: "#F7F7F8",
          100: "#EDEDEF",
          200: "#D9D9DD",
          300: "#B8B8BE",
          400: "#8C8C95",
          500: "#6A6A72",
          600: "#4A4A52",
          700: "#2E2E34",
          800: "#1B1B1F",
          900: "#0A0A0B",
        },
        accent: {
          50: "#EEF0FF",
          100: "#DDE1FF",
          200: "#B9C0FF",
          300: "#8C95FF",
          400: "#6071FF",
          500: "#3D5AFE",
          600: "#2E40E0",
          700: "#2734B5",
          800: "#20298A",
          900: "#1A2070",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10,10,11,0.04), 0 2px 6px rgba(10,10,11,0.04)",
        elevated:
          "0 1px 2px rgba(10,10,11,0.04), 0 8px 24px rgba(10,10,11,0.06), 0 24px 48px -12px rgba(10,10,11,0.10)",
        glow: "0 0 0 1px rgba(99,102,241,0.25), 0 20px 60px -20px rgba(99,102,241,0.55)",
        "card-dark":
          "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
      },
      keyframes: {
        "blob-drift": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.08)" },
          "66%": { transform: "translate(-24px, 24px) scale(0.94)" },
        },
        "caret-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "grid-pan": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "40px 40px" },
        },
      },
      animation: {
        "blob-drift": "blob-drift 18s ease-in-out infinite",
        "caret-blink": "caret-blink 1.1s step-end infinite",
        "grid-pan": "grid-pan 20s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
