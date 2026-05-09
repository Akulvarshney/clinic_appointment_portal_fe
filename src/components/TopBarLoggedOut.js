import React, { useState, useEffect } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import "../pages/HomePage.css";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Upcoming", href: "#lead" },
  { label: "Clients", href: "#testi" },
  { label: "Pricing", href: "#pricing" },
];

const TopBarLoggedOut = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openPartnerModal = () => {
    setMobileNavOpen(false);
    navigate("/", { state: { openPartner: true } });
  };

  const handleNavClick = (href) => {
    if (!isHome) {
      navigate("/", { hash: href });
    }
    setMobileNavOpen(false);
  };

  return (
    <>
      {/* DESKTOP NAV */}
      <nav className={`gwl-nav ${navScrolled ? "scrolled" : ""}`}>
        <RouterLink to="/" className="gwl-nav__logo">
          Glory<span>Well</span>Nic
        </RouterLink>

        <div className="gwl-nav__links">
          {NAV_LINKS.map((l) =>
            isHome ? (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ) : (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(l.href);
                }}
              >
                {l.label}
              </a>
            ),
          )}
        </div>

        <div className="gwl-nav__r">
          <RouterLink to="/login" className="btn-ghost btn-sm">
            Sign In
          </RouterLink>

          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={openPartnerModal}
          >
            Book Demo
          </button>

          {/* MOBILE MENU BUTTON */}
          <button
            className="gwl-nav__menu-btn"
            onClick={() => setMobileNavOpen(true)}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER (PURE CSS BASED) */}
      <div className={`gwl-mob ${mobileNavOpen ? "open" : ""}`}>
        <div className="gwl-mob__header">
          <span>Menu</span>
          <button onClick={() => setMobileNavOpen(false)}>✕</button>
        </div>

        <div className="gwl-mob__links">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                if (!isHome) {
                  e.preventDefault();
                  handleNavClick(l.href);
                }
              }}
            >
              {l.label}
            </a>
          ))}

          <RouterLink to="/login" onClick={() => setMobileNavOpen(false)}>
            Sign In
          </RouterLink>

          <button onClick={openPartnerModal}>
            Book Demo
          </button>
        </div>
      </div>

      {/* OVERLAY */}
      {mobileNavOpen && (
        <div
          className="gwl-mob__overlay"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
    </>
  );
};

export default TopBarLoggedOut;
