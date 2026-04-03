/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gw: {
          primary: "#81A6C6",
          "primary-light": "#AACDDC",
          surface: "#F3E3D0",
          muted: "#D2C4B4",
          "primary-dark": "#5a788e",
          ink: "#2a2622",
          "ink-2": "#454039",
          "ink-3": "#6b6258",
          "ink-4": "#8a7f72",
        },
      },
    },
  },
  plugins: [],
};
