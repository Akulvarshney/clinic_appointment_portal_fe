import React, { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import "../pages/HomePage.css";

const NAV_LINKS = [
  { label: "Features", href: "#gw-features" },
  { label: "Upcoming", href: "#gw-lead" },
  { label: "Clients", href: "#gw-testi" },
  { label: "Pricing", href: "#gw-pricing" },
];

const TopBarLoggedOut = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navScrolled, setNavScrolled] = useState(false);
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openPartnerModal = () => {
    navigate("/", { state: { openPartner: true } });
  };

  const navLinkProps = (href) => {
    if (isHome) {
      return { component: "a", href };
    }
    return {
      component: RouterLink,
      to: { pathname: "/", hash: href },
    };
  };

  return (
    <nav
      className={`gw-nav${navScrolled ? " scrolled" : ""}`}
      aria-label="Main navigation"
    >
      <RouterLink to="/" className="gw-nav-logo">
        Glory<span>Well</span>Nic
      </RouterLink>
      <div className="gw-nav-links">
        {NAV_LINKS.map((l) => {
          const p = navLinkProps(l.href);
          return p.component === "a" ? (
            <a key={l.href} href={p.href}>
              {l.label}
            </a>
          ) : (
            <RouterLink key={l.href} to={p.to}>
              {l.label}
            </RouterLink>
          );
        })}
      </div>
      <div className="gw-nav-r">
        <RouterLink to="/login" className="gw-btn gw-btn-ghost">
          Sign In
        </RouterLink>
        <button
          type="button"
          className="gw-btn gw-btn-prim"
          onClick={openPartnerModal}
        >
          Book Demo
        </button>
      </div>
    </nav>
  );
};

export default TopBarLoggedOut;
