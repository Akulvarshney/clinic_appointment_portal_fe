/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          "Instrument Serif",
          "Iowan Old Style",
          "Apple Garamond",
          "Georgia",
          "serif",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SF Mono",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        gw: {
          // surfaces
          bg: "#F7F5EF",
          "bg-2": "#F0EDE5",
          "bg-3": "#E8E5DC",
          // ink
          ink: "#2B2722",
          "ink-2": "#5C5751",
          "ink-3": "#8B857D",
          "ink-4": "#A8A29A",
          // lines
          line: "#DCD8CF",
          "line-2": "#CFCABF",
          // accent
          accent: "#C46C48",
          "accent-hover": "#B45D3A",
          "accent-soft": "#F5E2D5",
          // status
          success: "#5BA876",
          "success-soft": "#E0F0E2",
          warning: "#D4A640",
          "warning-soft": "#F8EBC8",
          danger: "#C24A2E",
          "danger-soft": "#F7DDD3",
          // legacy aliases
          primary: "#C46C48",
          "primary-light": "#F5E2D5",
          "primary-dark": "#9E5436",
          surface: "#F7F5EF",
          muted: "#DCD8CF",
        },
      },
      borderRadius: {
        "gw-1": "6px",
        "gw-2": "10px",
        "gw-3": "14px",
        "gw-4": "20px",
      },
      boxShadow: {
        "gw-1": "0 1px 2px rgba(43,39,34,0.04)",
        "gw-2": "0 4px 16px rgba(43,39,34,0.06)",
        "gw-3": "0 12px 36px rgba(43,39,34,0.08)",
      },
      letterSpacing: {
        eyebrow: "0.08em",
        display: "-0.02em",
      },
      keyframes: {
        "gw-rise": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "gw-fade": { from: { opacity: "0" }, to: { opacity: "1" } },
        "gw-float": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "gw-pulse": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "gw-rise": "gw-rise 700ms cubic-bezier(0.2,0.7,0.3,1) both",
        "gw-fade": "gw-fade 400ms ease-out both",
        "gw-float": "gw-float 5.5s ease-in-out infinite",
        "gw-pulse": "gw-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
