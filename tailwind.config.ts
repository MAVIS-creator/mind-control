import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f8fafc",
        panel: "#f1f5f9",
        panelAlt: "#e2e8f0",
        cyan: "#38bdf8",
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#0f172a",
        },
        indigo: "#2563eb",
        blueAlt: "#0284c7",
        haze: "#e0f2fe",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 30px rgba(56, 189, 248, 0.22)",
        blue: "0 0 36px rgba(37, 99, 235, 0.22)",
      },
      backgroundImage: {
        "neural-grid":
          "radial-gradient(circle at top, rgba(37,99,235,0.15), transparent 32%), linear-gradient(rgba(56,189,248,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "100% 100%, 48px 48px, 48px 48px",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        glitch: "glitch 320ms steps(2, end)",
        pulseGlow: "pulseGlow 2.8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 1px)" },
          "40%": { transform: "translate(2px, -1px)" },
          "60%": { transform: "translate(-1px, 0)" },
          "80%": { transform: "translate(1px, 1px)" },
          "100%": { transform: "translate(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.8", filter: "blur(0px)" },
          "50%": { opacity: "1", filter: "blur(2px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
