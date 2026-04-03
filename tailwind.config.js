/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gw: {
          primary: "#8FABD4",
          "primary-light": "#C4D4EF",
          surface: "#EFECE3",
          muted: "#DAD6CC",
          "primary-dark": "#4A70A9",
          ink: "#000000",
          "ink-2": "#333333",
          "ink-3": "#666666",
          "ink-4": "#999999",
        },
      },
    },
  },
  plugins: [],
};
