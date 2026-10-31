module.exports = {
  content: ["./index.html", "./src/frontend/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090a0d",
        panel: "#111318",
        line: "#25272e",
        accent: "#ed1c24",
      },
      fontFamily: {
        mono: ["'IBM Plex Mono'", "monospace"],
        sans: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
