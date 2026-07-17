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
      },
      colors: {
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
      },
    },
  },
  plugins: [],
};

export default config;
