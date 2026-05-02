/**
 * Glory WellNic — CLAUDE.md dark purple landing tokens, exposed under existing
 * key names so all 17 consumers across the app re-skin to dark mode without
 * import changes.
 */

// CLAUDE.md raw tokens
const BG = "#06040D";
const BG2 = "#0D0820";
const BG3 = "#15102C";

const P1 = "#7B3FF2"; // deep purple
const P2 = "#5B2BE0"; // darker purple
const P3 = "#9B6BFF"; // mid purple — borders, accents, cursor
const P4 = "#C4A8FF"; // light lavender — highlight text, italic headings
const ACC = "#A855F7"; // accent purple

const TXT = "#F0EAFF";
const TXT2 = "rgba(240,234,255,0.55)";
const TXT3 = "rgba(240,234,255,0.30)";
const TXT4 = "rgba(240,234,255,0.18)";

const LINE = "rgba(155,107,255,0.18)";
const LINE2 = "rgba(155,107,255,0.30)";

const CARD_BG = "rgba(255,255,255,0.04)";

export const PALETTE = {
  // Surfaces
  bg: BG,
  bg2: BG2,
  bg3: BG3,

  // Text hierarchy
  ink: TXT,
  ink2: TXT2,
  ink3: TXT3,

  // Hairlines
  line: LINE,
  line2: LINE2,

  // Brand accent — purple
  accent: P1,
  accentHover: P2,
  accentSoft: "rgba(123,63,242,0.18)",

  // Status (kept distinct so dashboards stay legible on dark)
  success: "#5BE08A",
  successSoft: "rgba(91,224,138,0.15)",
  warning: "#F2C94C",
  warningSoft: "rgba(242,201,76,0.15)",
  danger: "#FF5C73",
  dangerSoft: "rgba(255,92,115,0.15)",

  // Utility
  white: TXT,
  paper: CARD_BG,

  // Legacy aliases (existing consumers)
  primary: P1,
  primaryLight: "rgba(123,63,242,0.18)",
  primaryDark: P3,
  primaryHover: P2,
  surface: BG,
  muted: LINE,
  ink4: TXT4,
  accentLight: "rgba(155,107,255,0.18)",

  // CLAUDE.md-specific tokens used by HomePage
  p1: P1,
  p2: P2,
  p3: P3,
  p4: P4,
  acc: ACC,
  txt: TXT,
  txt2: TXT2,
  txt3: TXT3,
  glow: "rgba(123,63,242,0.4)",
  cardBg: CARD_BG,
  cardBorder: "rgba(255,255,255,0.08)",
};

/** Recharts / pie slices — purple sequence on dark */
export const CHART_COLORS = [
  PALETTE.p1,
  PALETTE.p4,
  PALETTE.p3,
  PALETTE.acc,
  PALETTE.success,
  PALETTE.warning,
];
