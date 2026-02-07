import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1020",
        panel: "rgba(255,255,255,0.06)",
        panel2: "rgba(255,255,255,0.08)",
        stroke: "rgba(255,255,255,0.10)",
        neon: "#5EEBFF",
        neon2: "#2C7BFF"
      },
      boxShadow: {
        soft: "0 10px 35px rgba(0,0,0,0.35)",
        neon: "0 0 24px rgba(94,235,255,0.22)"
      }
    }
  },
  plugins: []
} satisfies Config;
