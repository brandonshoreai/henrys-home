import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: "#FF3B30",
          green: "#34C759",
          orange: "#FF9500",
          red: "#FF3B30",
          gray: "#F5F5F7",
          "gray-dark": "#86868B",
          "blue-hover": "#E0312B",
          "gray-border": "rgba(0,0,0,0.06)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        apple: "16px",
      },
      boxShadow: {
        apple: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",
        "apple-hover": "0 2px 8px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.1)",
        "apple-sm": "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
