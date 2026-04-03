/**
 * GloryWellnic brand palette — single source for JS imports.
 * CSS mirrors these as :root variables in src/index.css (--gw-*).
 *
 * Core swatches: surface #EFECE3, primary #8FABD4, primaryDark #4A70A9, ink #000000.
 * Companion tokens are derived for hierarchy, borders, and soft fills.
 */
export const PALETTE = {
  primary: "#8FABD4",
  /** Lighter tint of primary — chips, table highlights, focus rings */
  primaryLight: "#C4D4EF",
  surface: "#EFECE3",
  /** Muted chrome — borders, secondary panels */
  muted: "#DAD6CC",
  primaryDark: "#4A70A9",
  ink: "#000000",
  ink2: "#333333",
  ink3: "#666666",
  ink4: "#999999",
  white: "#ffffff",
  line: "rgba(0, 0, 0, 0.1)",
  accentLight: "rgba(143, 171, 212, 0.28)",
};

/** Recharts / pie slices — cycles brand colors */
export const CHART_COLORS = [
  PALETTE.primary,
  PALETTE.primaryLight,
  PALETTE.muted,
  PALETTE.primaryDark,
];
