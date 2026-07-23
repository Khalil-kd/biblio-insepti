import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        insepti: {
          green: "#315F2A",
          "green-light": "#75C044",
          "green-deep": "#315F2A",
          graphite: "#273238",
          slate: "#737D85",
          mist: "#ECEEEE",
          ivory: "#F7F8F6",
        },
        app: {
          copilot: "#7B5CFA",
          word: "#2B579A",
          excel: "#217346",
          powerpoint: "#B7472A",
          teams: "#5B5FC7",
          outlook: "#0072C6",
          onenote: "#7719AA",
          onedrive: "#0364B8",
          sharepoint: "#03787C",
          forms: "#038387",
          planner: "#31752F",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(39, 50, 56, 0.09)",
      },
      transitionDuration: {
        150: "150ms",
        250: "250ms",
      },
    },
  },
  plugins: [],
};

export default config;
