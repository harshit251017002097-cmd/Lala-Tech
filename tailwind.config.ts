import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        hub: {
          950: "#080C14",
          900: "#0F172A",
          850: "#141E33",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
          50: "#F8FAFC",
        },
        status: {
          new: "#818CF8", // Indigo
          clarification: "#F59E0B", // Amber
          ready: "#06B6D4", // Cyan
          progress: "#3B82F6", // Blue
          waiting: "#C084FC", // Purple
          done: "#10B981", // Emerald
        },
        queue: {
          us: "#3B82F6",
          client: "#C084FC",
          unassigned: "#F59E0B",
          overdue: "#EF4444",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(59, 130, 246, 0.15)',
        'glow-md': '0 0 25px -5px rgba(59, 130, 246, 0.25)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.3)',
      }
    },
  },
  plugins: [],
};

export default config;
