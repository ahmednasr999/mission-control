/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080C16",
        surface: "#0D1220",
        border: "#1E2D45",
        "accent-blue": "#4F8EF7",
        "accent-violet": "#7C3AED",
        "text-primary": "#F0F0F5",
        "text-secondary": "#8888A0",
        "text-muted": "#555570",
        success: "#34D399",
        warning: "#FBBF24",
        danger: "#F87171",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "Syne", "sans-serif"],
        sans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        mono: ["var(--font-dm-mono)", "DM Mono", "monospace"],
      },
      spacing: {
        // 8px base grid
        "grid-1": "8px",
        "grid-2": "16px",
        "grid-3": "24px",
        "grid-4": "32px",
        "grid-5": "40px",
        "grid-6": "48px",
      },
      borderRadius: {
        card: "10px",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #4F8EF7, #7C3AED)",
      },
      width: {
        sidebar: "220px",
      },
    },
  },
  plugins: [],
};
