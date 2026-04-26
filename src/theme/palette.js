/**
 * Glory WellNic — design.md tokens.
 * Warm paper background, terracotta accent, ink-on-paper text.
 * oklch values from design.md, converted to sRGB hex for cross-tool compat (MUI/AntD/Recharts).
 */
export const PALETTE = {
  // Surfaces — warm off-whites
  bg: "#F7F5EF",
  bg2: "#F0EDE5",
  bg3: "#E8E5DC",

  // Ink — warm near-black hierarchy
  ink: "#2B2722",
  ink2: "#5C5751",
  ink3: "#8B857D",

  // Hairlines
  line: "#DCD8CF",
  line2: "#CFCABF",

  // Brand accent — terracotta
  accent: "#C46C48",
  accentHover: "#B45D3A",
  accentSoft: "#F5E2D5",

  // Status
  success: "#5BA876",
  successSoft: "#E0F0E2",
  warning: "#D4A640",
  warningSoft: "#F8EBC8",
  danger: "#C24A2E",
  dangerSoft: "#F7DDD3",

  // Utility
  white: "#FFFFFF",
  paper: "#F7F5EF",

  // Legacy aliases (kept so existing pages still render until each is migrated)
  primary: "#C46C48",
  primaryLight: "#F5E2D5",
  primaryDark: "#9E5436",
  primaryHover: "#B45D3A",
  surface: "#F7F5EF",
  muted: "#DCD8CF",
  ink4: "#A8A29A",
  accentLight: "#F5E2D5",
};

/** Recharts / pie slices — warm sequence built from accent + neutrals */
export const CHART_COLORS = [
  PALETTE.accent,
  PALETTE.accentSoft,
  PALETTE.ink2,
  PALETTE.bg3,
  PALETTE.success,
  PALETTE.warning,
];
