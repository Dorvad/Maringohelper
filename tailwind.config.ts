import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Assistant"', '"Heebo"', "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        app: {
          bg: "#B9B8F4",
          bgDeep: "#A8A7EE",
          soft: "#F4F3FF",
          surface: "#FFFFFF",
          muted: "#ECEBFF",
          primary: "#6265D8",
          dark: "#24222A",
          warm: "#E8AE7E",
          warmSoft: "#F3D0AE",
          infoSoft: "#D7EAF7",
          success: "#64B68A",
          warning: "#E6A84F",
          danger: "#D95F5F",
          text: "#20202A",
          secondary: "#5F5F70",
          border: "#E6E4F4",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        card: "0 16px 40px rgba(45, 42, 90, 0.10)",
        floating: "0 20px 50px rgba(45, 42, 90, 0.18)",
        soft: "0 8px 24px rgba(45, 42, 90, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
