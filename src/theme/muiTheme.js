import { createTheme } from "@mui/material/styles";
import { PALETTE } from "./palette";

const muiTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: PALETTE.p1, dark: PALETTE.p2, light: PALETTE.p4, contrastText: "#fff" },
    secondary: { main: PALETTE.p4, contrastText: PALETTE.bg },
    success: { main: PALETTE.success },
    warning: { main: PALETTE.warning },
    error: { main: PALETTE.danger },
    background: { default: PALETTE.bg, paper: PALETTE.bg2 },
    text: { primary: PALETTE.txt, secondary: PALETTE.txt2, disabled: PALETTE.txt3 },
    divider: PALETTE.line,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      '"Sora", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: "-0.02em", fontWeight: 400 },
    h2: { fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: "-0.02em", fontWeight: 400 },
    h3: { fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: "-0.02em", fontWeight: 400 },
    h4: { fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: "-0.02em", fontWeight: 400 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
    body1: { fontSize: 14, letterSpacing: "-0.005em" },
    body2: { fontSize: 13 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 18, height: 40, boxShadow: "none" },
        contained: { "&:hover": { boxShadow: `0 4px 18px ${PALETTE.glow}` } },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none", backgroundColor: PALETTE.bg2 } } },
    MuiTextField: { defaultProps: { size: "small" } },
  },
});

export default muiTheme;
