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
          50: "#eff1ff",
          100: "#e0e4ff",
          200: "#c7ceff",
          300: "#9da9ff",
          400: "#697aff",
          500: "#3d50f5",
          600: "#1c05b3",
          700: "#140494",
          800: "#0f026b",
          900: "#0b014f",
          950: "#06002e",
        },
        indigo: "#1c05b3",
        blueAlt: "#2406e2",
        haze: "#eff1ff",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 30px rgba(28, 5, 179, 0.22)",
        blue: "0 0 36px rgba(28, 5, 179, 0.25)",
      },
      backgroundImage: {
        "neural-grid":
          "radial-gradient(circle at top, rgba(28,5,179,0.15), transparent 32%), linear-gradient(rgba(28,5,179,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(28,5,179,0.06) 1px, transparent 1px)",
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
