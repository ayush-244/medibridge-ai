import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0EA5E9",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
        },
        danger: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        background: "#FAFAFA",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        border: "#E2E8F0",
        "text-primary": "#0F172A",
        "text-secondary": "#64748B",
        sidebar: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
          border: "#E2E8F0",
          accent: "#F0F9FF",
          "accent-foreground": "#0EA5E9",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        navbar: "0 1px 0 0 #E2E8F0",
      },
      spacing: {
        sidebar: "260px",
        "sidebar-collapsed": "64px",
        navbar: "64px",
      },
    },
  },
  plugins: [],
};

export default config;
