/**
 * GloryWellnic brand palette — single source for JS imports.
 * CSS mirrors these as :root variables in src/index.css (--gw-*).
 */
export const PALETTE = {
  primary: "#81A6C6",
  primaryLight: "#AACDDC",
  surface: "#F3E3D0",
  muted: "#D2C4B4",
  /** Darker primary for nav, headings, WCAG-friendly pairings with white */
  primaryDark: "#5a788e",
  /** Readable warm neutrals on cream surfaces */
  ink: "#2a2622",
  ink2: "#454039",
  ink3: "#6b6258",
  ink4: "#8a7f72",
  white: "#ffffff",
  line: "rgba(42, 38, 34, 0.12)",
  accentLight: "rgba(170, 205, 220, 0.45)",
};

/** Recharts / pie slices — cycles brand colors */
export const CHART_COLORS = [
  PALETTE.primary,
  PALETTE.primaryLight,
  PALETTE.muted,
  PALETTE.primaryDark,
];
