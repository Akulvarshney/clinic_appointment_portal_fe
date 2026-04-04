import React, { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import "../pages/HomePage.css";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Platform", href: "#features" },
  { label: "Partner story", href: "#live-partner" },
  { label: "How it works", href: "#how" },
  { label: "FAQ", href: "#faq" },
];

const TopBarLoggedOut = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isHome = location.pathname === "/";

  const closeMobileNav = () => setMobileNavOpen(false);

  const openPartnerFlow = () => {
    closeMobileNav();
    navigate("/", { state: { openPartner: true } });
  };

  const navLinkProps = (href) => {
    const hash = href.replace(/^#/, "");
    if (isHome) {
      return { component: "a", href };
    }
    return {
      component: RouterLink,
      to: { pathname: "/", hash },
    };
  };

  return (
    <>
      <Box component="header" className="gwl-nav">
        <Box className="gwl-nav__inner">
          <RouterLink to="/" className="gwl-nav__brand" onClick={closeMobileNav}>
            GloryWellnic
          </RouterLink>

          <Box component="nav" className="gwl-nav__desktop" aria-label="Section links">
            {NAV_LINKS.map((l) => {
              const p = navLinkProps(l.href);
              return p.component === "a" ? (
                <a key={l.href} className="gwl-nav__link" href={p.href}>
                  {l.label}
                </a>
              ) : (
                <RouterLink key={l.href} className="gwl-nav__link" to={p.to}>
                  {l.label}
                </RouterLink>
              );
            })}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" className="gwl-nav__actions">
            <Button component={RouterLink} to="/login" className="gwl-btn gwl-btn--ghost">
              Sign in
            </Button>
            <Button variant="contained" disableElevation onClick={openPartnerFlow} className="gwl-btn gwl-btn--primary">
              Partner with us
            </Button>
          </Stack>

          <IconButton
            className="gwl-nav__menu-btn"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
            edge="end"
            size="medium"
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>

      <Drawer anchor="right" open={mobileNavOpen} onClose={closeMobileNav} PaperProps={{ sx: { width: 280 } }}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="font-bold text-base">Menu</span>
          <IconButton aria-label="Close menu" onClick={closeMobileNav} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <List disablePadding>
          {NAV_LINKS.map((l) => (
            <ListItemButton
              key={l.href}
              {...(isHome
                ? { component: "a", href: l.href }
                : {
                    component: RouterLink,
                    to: { pathname: "/", hash: l.href.replace(/^#/, "") },
                  })}
              onClick={closeMobileNav}
            >
              <ListItemText primary={<span className="font-medium">{l.label}</span>} />
            </ListItemButton>
          ))}
          <ListItemButton component={RouterLink} to="/login" onClick={closeMobileNav}>
            <ListItemText primary="Sign in" />
          </ListItemButton>
          <ListItemButton onClick={openPartnerFlow}>
            <ListItemText
              primary={<span className="font-semibold text-[var(--gw-primary-dark)]">Partner with us</span>}
            />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
};

export default TopBarLoggedOut;
