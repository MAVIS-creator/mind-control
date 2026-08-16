import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f9f9ff",
        panel: "#e7eeff",
        panelAlt: "#dee8ff",
        cyan: "#64a8fe",
        indigo: "#3525cd",
        violet: "#862dd4",
        haze: "#d8e3fb",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 30px rgba(108, 247, 255, 0.18)",
        violet: "0 0 36px rgba(195, 95, 255, 0.22)",
      },
      backgroundImage: {
        "neural-grid":
          "radial-gradient(circle at top, rgba(90,102,255,0.2), transparent 32%), linear-gradient(rgba(108,247,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(108,247,255,0.08) 1px, transparent 1px)",
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
