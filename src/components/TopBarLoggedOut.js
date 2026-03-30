import React, { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";
import { EDITORIAL, EDITORIAL_NAV } from "../assets/editorialLandingContent";

const btnApplySx = {
  fontFamily: EDITORIAL.fontSans,
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  bgcolor: EDITORIAL.ink,
  color: EDITORIAL.white,
  border: `1.5px solid ${EDITORIAL.ink}`,
  borderRadius: "100px",
  px: "2rem",
  py: "0.85rem",
  gap: 0.75,
  "&:hover": { bgcolor: EDITORIAL.accent, borderColor: EDITORIAL.accent },
};

const btnLoginSx = {
  fontFamily: EDITORIAL.fontSans,
  fontSize: "0.75rem",
  fontWeight: 500,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: EDITORIAL.ink,
  border: `1.5px solid ${EDITORIAL.line}`,
  borderRadius: "100px",
  px: "2rem",
  py: "0.85rem",
  gap: 0.75,
  bgcolor: "transparent",
  textDecoration: "none",
  "&:hover": { borderColor: EDITORIAL.ink3, bgcolor: "transparent" },
};

const linkSx = {
  display: { xs: "none", md: "block" },
  fontFamily: EDITORIAL.fontSans,
  fontSize: "0.72rem",
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: EDITORIAL.ink3,
  textDecoration: "none",
  "&:hover": { color: EDITORIAL.ink },
};

const TopBarLoggedOut = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navScrolled, setNavScrolled] = useState(false);
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleApply = () => {
    navigate("/", { state: { openPartner: true } });
  };

  return (
    <Box
      component="nav"
      aria-label="Primary"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        px: { xs: "1.5rem", md: "3.5rem" },
        py: navScrolled ? "1rem" : { xs: "1.5rem", md: "2rem" },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        transition: "padding 0.4s ease, border-color 0.3s",
        bgcolor: EDITORIAL.bg,
        borderBottom: navScrolled ? `1px solid ${EDITORIAL.line}` : "1px solid transparent",
      }}
    >
      <Typography
        component={RouterLink}
        to="/"
        sx={{
          fontFamily: EDITORIAL.fontSerif,
          fontSize: { xs: "1.2rem", md: "1.35rem" },
          fontWeight: 600,
          letterSpacing: "0.01em",
          color: EDITORIAL.ink,
          textDecoration: "none",
        }}
      >
        {EDITORIAL_NAV.logo}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 2.5 }} flexWrap="wrap" justifyContent="flex-end">
        {EDITORIAL_NAV.links.map((l) =>
          isHome ? (
            <Typography key={l.href} component="a" href={l.href} sx={linkSx}>
              {l.label}
            </Typography>
          ) : (
            <Typography
              key={l.href}
              component={RouterLink}
              to={{ pathname: "/", hash: l.href.replace(/^#/, "") }}
              sx={linkSx}
            >
              {l.label}
            </Typography>
          )
        )}
        <Button component={RouterLink} to="/login" sx={btnLoginSx}>
          Login
        </Button>
        <Button onClick={handleApply} sx={btnApplySx}>
          {EDITORIAL_NAV.apply}
        </Button>
      </Stack>
    </Box>
  );
};

export default TopBarLoggedOut;
