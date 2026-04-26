import { createTheme } from "@mui/material/styles";
import { PALETTE } from "./palette";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: PALETTE.accent, dark: PALETTE.accentHover, contrastText: "#fff" },
    secondary: { main: PALETTE.ink, contrastText: PALETTE.bg },
    success: { main: PALETTE.success },
    warning: { main: PALETTE.warning },
    error: { main: PALETTE.danger },
    background: { default: PALETTE.bg, paper: PALETTE.white },
    text: { primary: PALETTE.ink, secondary: PALETTE.ink2, disabled: PALETTE.ink3 },
    divider: PALETTE.line,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontFamily: '"Instrument Serif", Georgia, serif', letterSpacing: "-0.02em", fontWeight: 400 },
    h2: { fontFamily: '"Instrument Serif", Georgia, serif', letterSpacing: "-0.02em", fontWeight: 400 },
    h3: { fontFamily: '"Instrument Serif", Georgia, serif', letterSpacing: "-0.02em", fontWeight: 400 },
    h4: { fontFamily: '"Instrument Serif", Georgia, serif', letterSpacing: "-0.02em", fontWeight: 400 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
    body1: { fontSize: 14, letterSpacing: "-0.005em" },
    body2: { fontSize: 13 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 18, height: 40, boxShadow: "none" },
        contained: { "&:hover": { boxShadow: "0 4px 16px rgba(43,39,34,0.06)" } },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiTextField: { defaultProps: { size: "small" } },
  },
});

export default muiTheme;
