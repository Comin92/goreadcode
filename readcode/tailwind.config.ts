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
        editor: {
          bg: "#0d1117",
          sidebar: "#161b22",
          panel: "#1c2128",
          border: "#30363d",
          text: "#e6edf3",
          muted: "#7d8590",
          accent: "#388bfd",
          highlight: "#1f2937",
          lineHover: "#21262d",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
