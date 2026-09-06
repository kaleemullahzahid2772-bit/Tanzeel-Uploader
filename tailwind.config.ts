import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          deep: "#04231B",
          dark: "#083B2E",
          primary: "#0F4C3A",
          medium: "#16624C",
          light: "#1F7E63",
          subtle: "#EBF5F0",
          border: "#1C5B48",
        },
        gold: {
          deep: "#7D6213",
          dark: "#9B7B1B",
          primary: "#C9A227",
          light: "#DFBE58",
          subtle: "#FAF4E1",
          border: "#D8B43E",
        },
        sand: {
          ivory: "#FFFDF7",
          cream: "#F8F4E8",
          muted: "#EFE9DB",
          border: "#E2D9C5",
        },
        charcoal: {
          main: "#18201C",
          muted: "#4F5E57",
          light: "#8B9B93",
          subtle: "#DDE4E0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-amiri)", "Georgia", "serif"],
        arabic: ["var(--font-amiri)", "Traditional Arabic", "serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(8, 59, 46, 0.05), 0 1px 2px rgba(8, 59, 46, 0.03)",
        card: "0 4px 20px -2px rgba(8, 59, 46, 0.06), 0 2px 6px -1px rgba(8, 59, 46, 0.04)",
        elevated: "0 10px 25px -5px rgba(8, 59, 46, 0.1), 0 8px 10px -6px rgba(8, 59, 46, 0.06)",
        gold: "0 0 15px rgba(201, 162, 39, 0.2)",
      },
      backgroundImage: {
        "gradient-emerald": "linear-gradient(135deg, #0F4C3A 0%, #083B2E 100%)",
        "gradient-emerald-dark": "linear-gradient(180deg, #083B2E 0%, #04231B 100%)",
        "gradient-gold": "linear-gradient(135deg, #DFBE58 0%, #C9A227 100%)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        pulseSubtle: "pulseSubtle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
