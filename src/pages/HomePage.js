import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EastIcon from "@mui/icons-material/East";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import toast from "react-hot-toast";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BACKEND_URL, states } from "../assets/constants";
import "./HomePage.css";
import {
  EDITORIAL_ABOUT,
  EDITORIAL_CTA,
  EDITORIAL_FAQ,
  EDITORIAL_FAQ_HEADER,
  EDITORIAL_FEATURES,
  EDITORIAL_HERO,
  EDITORIAL_LIVE_PARTNER,
  EDITORIAL_MISSION,
  EDITORIAL_MODAL_PARTNER,
  EDITORIAL_MODAL_TRACK,
  EDITORIAL_PARTNER_SPLIT,
  EDITORIAL_STATS,
  EDITORIAL_STEPS,
  EDITORIAL_TESTIMONIALS,
  EDITORIAL_TESTIMONIALS_HEADER,
  EDITORIAL_TICKER,
} from "../assets/editorialLandingContent";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const easeOut = [0.22, 1, 0.36, 1];

function TapScale({ reduceMotion, className, style, children }) {
  return (
    <motion.div
      className={className}
      style={{ display: "inline-flex", maxWidth: "100%", ...style }}
      whileHover={reduceMotion ? undefined : { scale: 1.05, y: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 440, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}

function useLandingMotion(reduceMotion) {
  return useMemo(() => {
    const rm = !!reduceMotion;
    const instant = { duration: 0 };
    const spring = (stiffness, damping, mass = 0.82) =>
      rm ? instant : { type: "spring", stiffness, damping, mass };

    return {
      /** prefers-reduced-motion */
      rm,
      viewport: rm ? undefined : { once: true, margin: "-72px" },
      viewportLoose: rm ? undefined : { once: true, margin: "-48px" },
      viewportHero: rm ? undefined : { once: true, margin: "-100px" },
      spring,
      modalSpring: rm ? { duration: 0.22, ease: easeOut } : { type: "spring", stiffness: 340, damping: 30 },
      heroStagger: {
        hidden: {},
        visible: { transition: rm ? {} : { staggerChildren: 0.12, delayChildren: 0.04 } },
      },
      heroColumn: {
        hidden: {},
        visible: { transition: rm ? {} : { staggerChildren: 0.068, delayChildren: 0.04 } },
      },
      heroLine: {
        hidden: { opacity: rm ? 1 : 0, y: rm ? 0 : 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: rm ? instant : { type: "spring", stiffness: 88, damping: 19, mass: 0.75 },
        },
      },
      reveal: {
        hidden: { opacity: rm ? 1 : 0, y: rm ? 0 : 36 },
        visible: {
          opacity: 1,
          y: 0,
          transition: rm ? instant : spring(96, 26),
        },
      },
      revealSoft: {
        hidden: { opacity: rm ? 1 : 0, y: rm ? 0 : 24, scale: rm ? 1 : 0.96 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: rm ? instant : spring(110, 25),
        },
      },
      listStagger: {
        hidden: {},
        visible: { transition: rm ? {} : { staggerChildren: 0.09, delayChildren: 0.06 } },
      },
      listItem: {
        hidden: { opacity: rm ? 1 : 0, x: rm ? 0 : -14 },
        visible: { opacity: 1, x: 0, transition: rm ? instant : spring(115, 22) },
      },
    };
  }, [reduceMotion]);
}

function ModalShell({ children, onClose, titleId, title, subtitle }) {
  return (
    <Paper elevation={0} className="gwl-modal-paper">
      <Box className="gwl-modal-head">
        <Box sx={{ minWidth: 0 }}>
          <h2 id={titleId} className="gwl-modal-title">
            {title}
          </h2>
          {subtitle && <p className="gwl-modal-sub">{subtitle}</p>}
        </Box>
        <IconButton onClick={onClose} aria-label="Close dialog" size="small" className="gwl-modal-close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box className="gwl-modal-body">{children}</Box>
    </Paper>
  );
}

const initialApplicationForm = () => ({
  orgName: "",
  fullName: "",
  orgShortName: "",
  phone: "",
  email: "",
  address: "",
  state: "",
});

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const m = useLandingMotion(reduceMotion);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroArtParallax = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 68]);

  const [faqOpen, setFaqOpen] = useState(() => new Set());

  const [openNewForm, setOpenNewForm] = useState(false);
  const [openTrackForm, setOpenTrackForm] = useState(false);
  const [applicationForm, setApplicationForm] = useState(initialApplicationForm);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [errorMsgNewApplication, setErrorMsgNewApplication] = useState("");
  const [successMsgNewApplication, setSuccessMsgNewApplication] = useState("");
  const [trackingMobile, setTrackingMobile] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [errorTrackApplication, setErrorTrackApplication] = useState("");
  const [successTrackApplication, setSuccessTrackApplication] = useState("");

  useEffect(() => {
    if (!location.state?.openPartner) return;
    setOpenNewForm(true);
    setErrorMsgNewApplication("");
    setSuccessMsgNewApplication("");
    navigate(".", { replace: true, state: {} });
  }, [location.state?.openPartner, navigate]);

  const resetNewApplicationModal = useCallback(() => {
    setApplicationForm(initialApplicationForm());
    setErrorMsgNewApplication("");
    setSuccessMsgNewApplication("");
  }, []);

  const openPartnerModal = () => {
    setOpenNewForm(true);
    setErrorMsgNewApplication("");
    setSuccessMsgNewApplication("");
  };

  const openTrackModal = () => {
    setOpenTrackForm(true);
    setErrorTrackApplication("");
    setSuccessTrackApplication("");
  };

  const toggleFaq = (i) => {
    setFaqOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const submitNewApplicationRequest = async () => {
    setErrorMsgNewApplication("");
    setSuccessMsgNewApplication("");
    const { orgName, fullName, orgShortName, phone, email, address, state } = applicationForm;
    if (
      !orgName?.trim() ||
      !fullName?.trim() ||
      !orgShortName?.trim() ||
      !phone?.trim() ||
      !email?.trim() ||
      !address?.trim() ||
      !state
    ) {
      setErrorMsgNewApplication("Please fill all fields, including state.");
      return;
    }
    setSubmittingApplication(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/noAuth/newApplication/submitApplication`, {
        org_name: orgName.trim(),
        phone: phone.trim(),
        org_short_name: orgShortName.trim(),
        client_name: fullName.trim(),
        email: email.trim(),
        state,
        address: address.trim(),
      });
      if (!response.data.success) {
        const msg = response.data.message || "Failed to submit application.";
        toast.error(msg);
        setErrorMsgNewApplication(msg);
        return;
      }
      const tid = response.data.trackingId;
      setSuccessMsgNewApplication(`Application submitted successfully. Tracking ID: ${tid}`);
      toast.success("Application submitted");
      setTimeout(() => {
        setOpenNewForm(false);
        resetNewApplicationModal();
      }, 6000);
    } catch (error) {
      const msg = error.response?.data?.message || "Unexpected error";
      toast.error(msg);
      setErrorMsgNewApplication("Unexpected error occurred. Please try again.");
    } finally {
      setSubmittingApplication(false);
    }
  };

  const trackApplicationStatus = async () => {
    setErrorTrackApplication("");
    setSuccessTrackApplication("");
    if (!trackingId?.trim() || !trackingMobile?.trim()) {
      setErrorTrackApplication("Enter mobile number and tracking ID.");
      return;
    }
    setTrackingLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/noAuth/newApplication/trackApplication`, {
        params: { mobileNumber: trackingMobile.trim(), trackingId: trackingId.trim() },
      });
      setSuccessTrackApplication(response.data.message || "Status retrieved.");
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorTrackApplication(error.response.data?.message || "Unable to verify tracking details.");
      } else {
        setErrorTrackApplication("Something went wrong. Try again.");
      }
    } finally {
      setTrackingLoading(false);
    }
  };

  const tickerItems = [...EDITORIAL_TICKER, ...EDITORIAL_TICKER];

  return (
    <Box className="gwl" id="homepage">
      <section ref={heroRef} className="gwl-hero" aria-labelledby="gwl-hero-title">
        <div className="gwl-container">
          <motion.div
            className="gwl-hero__grid"
            initial="hidden"
            animate="visible"
            variants={m.heroStagger}
          >
            <motion.div variants={m.heroColumn}>
              <motion.span className="gwl-kicker" variants={m.heroLine}>
                {EDITORIAL_HERO.eyebrow}
              </motion.span>
              <motion.div variants={m.heroLine}>
                <h1 id="gwl-hero-title" className="gwl-h1">
                  {EDITORIAL_HERO.titleLine1}{" "}
                  <span>{EDITORIAL_HERO.titleLine2Italic}</span>
                </h1>
              </motion.div>
              <motion.p className="gwl-lead" variants={m.heroLine}>
                {EDITORIAL_HERO.desc}
              </motion.p>
              <motion.div className="gwl-hero__cta" variants={m.heroLine}>
                <TapScale reduceMotion={m.rm} style={{ flex: "1 1 160px", minWidth: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disableElevation
                    onClick={openPartnerModal}
                    className="gwl-btn gwl-btn--primary gwl-btn--lg"
                    endIcon={<EastIcon sx={{ fontSize: 18 }} />}
                  >
                    {EDITORIAL_HERO.primaryCta}
                  </Button>
                </TapScale>
                <TapScale reduceMotion={m.rm} style={{ flex: "1 1 160px", minWidth: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={openTrackModal}
                    className="gwl-btn gwl-btn--outline gwl-btn--lg"
                  >
                    {EDITORIAL_HERO.secondaryCta}
                  </Button>
                </TapScale>
              </motion.div>
              <motion.p className="gwl-hero__note" variants={m.heroLine}>
                {EDITORIAL_HERO.footnote}
              </motion.p>
            </motion.div>
            <motion.div className="gwl-hero__art" aria-hidden variants={m.heroLine} style={{ y: heroArtParallax }}>
              {!m.rm && (
                <>
                  <motion.div
                    aria-hidden
                    style={{
                      position: "absolute",
                      width: 200,
                      height: 200,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(74,112,169,0.28) 0%, transparent 72%)",
                      top: "6%",
                      right: "8%",
                      pointerEvents: "none",
                    }}
                    animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.72, 0.45] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    aria-hidden
                    style={{
                      position: "absolute",
                      width: 140,
                      height: 140,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(143,171,212,0.35) 0%, transparent 70%)",
                      bottom: "12%",
                      left: "6%",
                      pointerEvents: "none",
                    }}
                    animate={{ scale: [1, 1.12, 1], x: [0, 10, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  />
                </>
              )}
              <motion.div
                className="gwl-hero__card"
                animate={m.rm ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                whileHover={
                  m.rm
                    ? undefined
                    : {
                        scale: 1.04,
                        boxShadow: "0 20px 48px rgba(74, 112, 169, 0.18)",
                        transition: m.spring(320, 24),
                      }
                }
              >
                <div className="gwl-hero__card-title">Operations snapshot</div>
                <div className="gwl-hero__card-metric">1 live partner</div>
                <div className="gwl-hero__card-sub">Elaria Esthetique — appointments to billing in one stack</div>
                <div className="gwl-hero__dots">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className={cx("gwl-hero__dot", dot === 0 && "gwl-hero__dot--on")}
                      animate={m.rm ? undefined : { scale: [1, dot === 0 ? 1.25 : 1.08, 1] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: dot * 0.35,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="gwl-trust" aria-label="Platform highlights">
        <div className="gwl-trust__track">
          {tickerItems.map((label, i) => (
            <motion.span
              key={`${label}-${i}`}
              className="gwl-trust__item"
              whileHover={m.rm ? undefined : { scale: 1.06, color: "var(--gw-primary-dark)" }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              {label}
            </motion.span>
          ))}
        </div>
      </section>

      <section id={EDITORIAL_LIVE_PARTNER.sectionId} className="gwl-section gwl-section--white">
        <div className="gwl-container">
          <motion.div
            className="gwl-spotlight__grid"
            initial="hidden"
            whileInView="visible"
            viewport={m.viewport}
            variants={m.reveal}
          >
            <div>
              <span className="gwl-kicker">{EDITORIAL_LIVE_PARTNER.label}</span>
              <h2 className="gwl-h2">{EDITORIAL_LIVE_PARTNER.title}</h2>
              <p className="gwl-body" style={{ fontWeight: 500, color: "var(--gw-ink3)" }}>
                {EDITORIAL_LIVE_PARTNER.meta}
              </p>
              <blockquote className="gwl-spotlight__quote">“{EDITORIAL_LIVE_PARTNER.quote}”</blockquote>
            </div>
            <motion.div
              className="gwl-spotlight__media"
              initial="hidden"
              whileInView="visible"
              viewport={m.viewportLoose}
              variants={m.revealSoft}
              whileHover={m.rm ? undefined : { boxShadow: "0 16px 48px rgba(74, 112, 169, 0.14)" }}
            >
              <motion.img
                src={EDITORIAL_LIVE_PARTNER.image}
                alt={EDITORIAL_LIVE_PARTNER.imageAlt}
                loading="lazy"
                referrerPolicy="no-referrer"
                whileHover={m.rm ? undefined : { scale: 1.06 }}
                transition={m.spring(200, 22)}
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="gwl-section gwl-section--surface gwl-section--tight">
        <div className="gwl-container">
          <div className="gwl-stats">
            {EDITORIAL_STATS.map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 20, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={m.viewportLoose}
                transition={{ ...m.spring(90, 20), delay: m.rm ? 0 : i * 0.07 }}
                whileHover={m.rm ? undefined : { y: -4, scale: 1.03 }}
              >
                <motion.div
                  className="gwl-stat__n"
                  whileHover={m.rm ? undefined : { color: "var(--gw-primary-dark)" }}
                >
                  {s.n}
                </motion.div>
                <div className="gwl-stat__l">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="gwl-section gwl-section--white">
        <motion.div
          className="gwl-container"
          initial="hidden"
          whileInView="visible"
          viewport={m.viewport}
          variants={m.reveal}
        >
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 5 }}>
              <span className="gwl-kicker">{EDITORIAL_ABOUT.label}</span>
              <h2 className="gwl-h2">
                {EDITORIAL_ABOUT.titleBefore} <em>{EDITORIAL_ABOUT.titleEm}</em>
              </h2>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <p className="gwl-body" style={{ marginBottom: "1.25rem" }}>
                {EDITORIAL_ABOUT.p1}
              </p>
              <p className="gwl-body">{EDITORIAL_ABOUT.p2}</p>
            </Grid>
          </Grid>
        </motion.div>
      </section>

      <section id="mission" className="gwl-split">
        <motion.div
          className="gwl-split__media"
          initial={{ opacity: 0, x: -36, rotate: -1 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={m.viewportLoose}
          transition={m.spring(85, 22)}
          whileHover={m.rm ? undefined : { scale: 1.02 }}
        >
          <img src={EDITORIAL_MISSION.image} alt={EDITORIAL_MISSION.imageAlt} loading="lazy" referrerPolicy="no-referrer" />
        </motion.div>
        <motion.div
          className="gwl-split__body gwl-split__body--surface"
          initial="hidden"
          whileInView="visible"
          viewport={m.viewportLoose}
          variants={m.reveal}
        >
          <span className="gwl-kicker">{EDITORIAL_MISSION.label}</span>
          <h2 className="gwl-h2">
            {EDITORIAL_MISSION.titleBefore} <em>{EDITORIAL_MISSION.titleEm}</em>
          </h2>
          <p className="gwl-body" style={{ marginTop: 12 }}>
            {EDITORIAL_MISSION.p}
          </p>
          <motion.ul
            className="gwl-checklist"
            initial="hidden"
            whileInView="visible"
            viewport={m.viewportLoose}
            variants={m.listStagger}
          >
            {EDITORIAL_MISSION.bullets.map((line) => (
              <motion.li key={line} variants={m.listItem}>
                <span className="gwl-checklist__icon">
                  <CheckRoundedIcon fontSize="small" />
                </span>
                <span>{line}</span>
              </motion.li>
            ))}
          </motion.ul>
          <TapScale reduceMotion={m.rm} style={{ alignSelf: "flex-start", marginTop: 4 }}>
            <Button
              variant="contained"
              disableElevation
              onClick={openPartnerModal}
              className="gwl-btn gwl-btn--primary gwl-btn--lg"
            >
              {EDITORIAL_MISSION.cta}
            </Button>
          </TapScale>
        </motion.div>
      </section>

      <section id="features" className="gwl-section gwl-section--surface">
        <div className="gwl-container">
          <motion.div
            className="gwl-features__head"
            initial="hidden"
            whileInView="visible"
            viewport={m.viewport}
            variants={m.reveal}
          >
            <div>
              <span className="gwl-kicker">{EDITORIAL_FEATURES.label}</span>
              <h2 className="gwl-h2">
                Six pillars of <em>{EDITORIAL_FEATURES.titleEm}</em>
              </h2>
            </div>
            <p className="gwl-lead" style={{ maxWidth: "none" }}>
              {EDITORIAL_FEATURES.intro}
            </p>
          </motion.div>
          <div className="gwl-feature-grid">
            {EDITORIAL_FEATURES.rows.map((row, idx) => (
              <motion.article
                key={row.idx}
                className="gwl-feature-card"
                initial={{ opacity: 0, y: 32, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={m.viewportLoose}
                transition={{ ...m.spring(95, 25), delay: m.rm ? 0 : (idx % 6) * 0.06 }}
                style={{ transformOrigin: "50% 50%" }}
                whileHover={
                  m.rm
                    ? undefined
                    : {
                        y: -10,
                        rotateX: 2,
                        rotateY: idx % 2 === 0 ? -6 : 6,
                        boxShadow: "0 22px 56px rgba(74, 112, 169, 0.14)",
                        borderColor: "rgba(143, 171, 212, 0.55)",
                        transition: m.spring(260, 22),
                      }
                }
              >
                <div className="gwl-feature-card__idx">{row.idx}</div>
                <span className="gwl-feature-card__tag">{row.tag}</span>
                <h3 className="gwl-feature-card__title">{row.title}</h3>
                <p className="gwl-feature-card__body">{row.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="gwl-section gwl-section--white">
        <div className="gwl-container">
          <motion.div
            className="gwl-steps__intro"
            initial="hidden"
            whileInView="visible"
            viewport={m.viewport}
            variants={m.reveal}
          >
            <span className="gwl-kicker">{EDITORIAL_STEPS.label}</span>
            <h2 className="gwl-h2">
              From application to active partner <em>{EDITORIAL_STEPS.titleEm}</em>
            </h2>
          </motion.div>
          <div className="gwl-steps__grid">
            {EDITORIAL_STEPS.steps.map((st, i) => (
              <motion.div
                key={st.n}
                className="gwl-step-card"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={m.viewportLoose}
                transition={{ ...m.spring(100, 23), delay: m.rm ? 0 : i * 0.08 }}
                whileHover={
                  m.rm
                    ? undefined
                    : {
                        y: -6,
                        borderColor: "var(--gw-primary)",
                        boxShadow: "0 12px 36px rgba(74, 112, 169, 0.1)",
                        transition: m.spring(320, 24),
                      }
                }
              >
                <div className="gwl-step-card__n">{st.n}</div>
                <h3 className="gwl-step-card__title">{st.t}</h3>
                <p className="gwl-step-card__body">{st.b}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="gwl-split gwl-split--flip">
        <motion.div
          className="gwl-split__media"
          initial={{ opacity: 0, x: 36, rotate: 1 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={m.viewportLoose}
          transition={m.spring(85, 22)}
          whileHover={m.rm ? undefined : { scale: 1.02 }}
        >
          <img src={EDITORIAL_PARTNER_SPLIT.image} alt={EDITORIAL_PARTNER_SPLIT.imageAlt} loading="lazy" referrerPolicy="no-referrer" />
        </motion.div>
        <motion.div
          className="gwl-split__body"
          initial="hidden"
          whileInView="visible"
          viewport={m.viewportLoose}
          variants={m.reveal}
        >
          <span className="gwl-kicker">{EDITORIAL_PARTNER_SPLIT.label}</span>
          <h2 className="gwl-h2">
            Your operations. <em>{EDITORIAL_PARTNER_SPLIT.titleEm}</em>
          </h2>
          <div className="gwl-badge">
            <span className="gwl-badge__n">{EDITORIAL_PARTNER_SPLIT.badgeN}</span>
            <span className="gwl-badge__l">{EDITORIAL_PARTNER_SPLIT.badgeL}</span>
          </div>
          <p className="gwl-body">{EDITORIAL_PARTNER_SPLIT.p}</p>
          <TapScale reduceMotion={m.rm} style={{ alignSelf: "flex-start", marginTop: 16 }}>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              className="gwl-btn gwl-btn--outline gwl-btn--lg"
              startIcon={<LoginOutlinedIcon />}
            >
              {EDITORIAL_PARTNER_SPLIT.cta}
            </Button>
          </TapScale>
        </motion.div>
      </section>

      <section className="gwl-section gwl-section--surface">
        <div className="gwl-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={m.viewport}
            variants={m.reveal}
          >
            <span className="gwl-kicker">{EDITORIAL_TESTIMONIALS_HEADER.label}</span>
            <h2 className="gwl-h2" style={{ marginBottom: 32 }}>
              {EDITORIAL_TESTIMONIALS_HEADER.titleBefore}
              <em>{EDITORIAL_TESTIMONIALS_HEADER.titleEm}</em>
            </h2>
          </motion.div>
          {EDITORIAL_TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              className="gwl-quote-card"
              initial={{ opacity: 0, y: 28, x: i % 2 === 0 ? -12 : 12 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={m.viewportLoose}
              transition={{ ...m.spring(88, 24), delay: m.rm ? 0 : i * 0.07 }}
              whileHover={
                m.rm
                  ? undefined
                  : {
                      y: -5,
                      scale: 1.015,
                      boxShadow: "0 16px 40px rgba(74, 112, 169, 0.1)",
                      transition: m.spring(300, 26),
                    }
              }
            >
              <p className="gwl-quote-card__text">“{t.quote}”</p>
              <div className="gwl-quote-card__person">
                <div className="gwl-quote-card__avatar">{t.initials}</div>
                <div>
                  <div className="gwl-quote-card__name">{t.name}</div>
                  <div className="gwl-quote-card__role">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="faq" className="gwl-section gwl-section--white">
        <div className="gwl-container">
          <div className="gwl-faq__grid">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={m.viewport}
              variants={m.reveal}
            >
              <span className="gwl-kicker">{EDITORIAL_FAQ_HEADER.label}</span>
              <h2 className="gwl-h2">
                Questions, <em>{EDITORIAL_FAQ_HEADER.titleEm}</em>
              </h2>
              <p className="gwl-body" style={{ marginTop: 16 }}>
                {EDITORIAL_FAQ_HEADER.subtitle}
              </p>
            </motion.div>
            <div className="gwl-faq__list">
              {EDITORIAL_FAQ.map((item, i) => {
                const open = faqOpen.has(i);
                return (
                  <motion.div key={item.q} className="gwl-faq__item">
                    <motion.button
                      type="button"
                      className="gwl-faq__q"
                      onClick={() => toggleFaq(i)}
                      whileTap={m.rm ? undefined : { scale: 0.992 }}
                      transition={m.spring(420, 35)}
                    >
                      {item.q}
                      <motion.span
                        className={cx("gwl-faq__toggle", open && "gwl-faq__toggle--open")}
                        animate={{ rotate: open ? 45 : 0 }}
                        transition={m.spring(280, 24)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        +
                      </motion.span>
                    </motion.button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: m.rm ? 0 : 0.38, ease: easeOut }}
                          style={{ overflow: "hidden" }}
                        >
                          <p className="gwl-faq__a">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="gwl-cta" aria-labelledby="gwl-cta-title">
        <div className="gwl-container">
          <motion.div
            className="gwl-cta__inner"
            initial="hidden"
            whileInView="visible"
            viewport={m.viewportHero}
            variants={m.reveal}
          >
            <p className="gwl-cta__kicker">{EDITORIAL_CTA.label}</p>
            <h2 id="gwl-cta-title" className="gwl-cta__title">
              {EDITORIAL_CTA.titleBefore}
              <em style={{ fontStyle: "italic", opacity: 0.95 }}>{EDITORIAL_CTA.titleEm}</em>
            </h2>
            <p className="gwl-cta__body">{EDITORIAL_CTA.p}</p>
            <div className="gwl-cta__actions">
              <TapScale reduceMotion={m.rm}>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={openPartnerModal}
                  className="gwl-btn gwl-btn--lg gwl-btn--on-dark"
                  endIcon={<EastIcon sx={{ fontSize: 18 }} />}
                >
                  {EDITORIAL_CTA.primary}
                </Button>
              </TapScale>
              <TapScale reduceMotion={m.rm}>
                <Button variant="outlined" onClick={openTrackModal} className="gwl-btn gwl-btn--lg gwl-btn--outline-light">
                  {EDITORIAL_CTA.secondary}
                </Button>
              </TapScale>
            </div>
          </motion.div>
        </div>
      </section>

      <Box component="footer" className="gwl-footer">
        <div className="gwl-footer__inner">
          <motion.span
            style={{ display: "inline-block" }}
            whileHover={m.rm ? undefined : { y: -2, scale: 1.04 }}
            transition={m.spring(350, 22)}
          >
            <RouterLink to="/" className="gwl-footer__brand">
              GloryWellnic
            </RouterLink>
          </motion.span>
          <nav className="gwl-footer__links" aria-label="Footer">
            <RouterLink to="/" className="gwl-footer__link">
              Home
            </RouterLink>
            <a href="#about" className="gwl-footer__link">
              About
            </a>
            <a href="#features" className="gwl-footer__link">
              Platform
            </a>
            <a href="#faq" className="gwl-footer__link">
              FAQ
            </a>
            <RouterLink to="/login" className="gwl-footer__link">
              Sign in
            </RouterLink>
            <button type="button" className="gwl-footer__link gwl-footer__link--btn" onClick={openPartnerModal}>
              Apply
            </button>
          </nav>
          <p className="gwl-footer__copy">© {new Date().getFullYear()} GloryWellnic</p>
        </div>
      </Box>

      <Modal
        open={openNewForm}
        onClose={() => {
          setOpenNewForm(false);
          resetNewApplicationModal();
        }}
        aria-labelledby="modal-new-application-title"
        slotProps={{
          backdrop: { className: "gwl-modal-backdrop" },
        }}
      >
        <Box className={cx("gwl-modal-wrap", "gwl-modal-wrap--tall")}>
          <motion.div
            className="gwl-modal-enter"
            style={{ width: "100%" }}
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={m.modalSpring}
          >
            <ModalShell
              titleId="modal-new-application-title"
              title={EDITORIAL_MODAL_PARTNER.title}
              subtitle={EDITORIAL_MODAL_PARTNER.subtitle}
              onClose={() => {
                setOpenNewForm(false);
                resetNewApplicationModal();
              }}
            >
              <Stack spacing={2}>
                <span className="gwl-field-label">Organisation name *</span>
                <TextField
                  fullWidth
                  required
                  size="small"
                  placeholder="e.g. City Wellness Hospital"
                  value={applicationForm.orgName}
                  onChange={(e) => setApplicationForm((f) => ({ ...f, orgName: e.target.value }))}
                  className="gwl-field"
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <span className={cx("gwl-field-label", "gwl-field-label--spaced")}>Your full name *</span>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      placeholder="Dr. / Mr. / Ms."
                      value={applicationForm.fullName}
                      onChange={(e) => setApplicationForm((f) => ({ ...f, fullName: e.target.value }))}
                      className="gwl-field"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <span className={cx("gwl-field-label", "gwl-field-label--spaced")}>Short name *</span>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      placeholder="CWH"
                      value={applicationForm.orgShortName}
                      onChange={(e) => setApplicationForm((f) => ({ ...f, orgShortName: e.target.value }))}
                      className="gwl-field"
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <span className={cx("gwl-field-label", "gwl-field-label--spaced")}>Mobile *</span>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      placeholder="+91 …"
                      value={applicationForm.phone}
                      onChange={(e) => setApplicationForm((f) => ({ ...f, phone: e.target.value }))}
                      className="gwl-field"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <span className={cx("gwl-field-label", "gwl-field-label--spaced")}>Email *</span>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      type="email"
                      placeholder="admin@org.in"
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm((f) => ({ ...f, email: e.target.value }))}
                      className="gwl-field"
                    />
                  </Grid>
                </Grid>
                <span className="gwl-field-label">Address *</span>
                <TextField
                  fullWidth
                  required
                  multiline
                  minRows={3}
                  size="small"
                  placeholder="Full registered address…"
                  value={applicationForm.address}
                  onChange={(e) => setApplicationForm((f) => ({ ...f, address: e.target.value }))}
                  className="gwl-field"
                />
                <FormControl fullWidth required size="small" className="gwl-field">
                  <InputLabel id="gwl-state-label">State *</InputLabel>
                  <Select
                    labelId="gwl-state-label"
                    label="State *"
                    value={applicationForm.state}
                    onChange={(e) => setApplicationForm((f) => ({ ...f, state: e.target.value }))}
                  >
                    {states.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errorMsgNewApplication && (
                  <Alert severity="error" variant="outlined" className="gwl-modal-alert">
                    {errorMsgNewApplication}
                  </Alert>
                )}
                {successMsgNewApplication && (
                  <Alert severity="success" variant="outlined" className="gwl-modal-alert">
                    {successMsgNewApplication}
                  </Alert>
                )}
                <Button
                  variant="contained"
                  onClick={submitNewApplicationRequest}
                  disabled={submittingApplication}
                  fullWidth
                  disableElevation
                  className="gwl-btn gwl-modal-submit"
                >
                  {submittingApplication ? "Submitting…" : "Submit application"}
                </Button>
              </Stack>
            </ModalShell>
          </motion.div>
        </Box>
      </Modal>

      <Modal
        open={openTrackForm}
        onClose={() => {
          setOpenTrackForm(false);
          setTrackingMobile("");
          setTrackingId("");
          setErrorTrackApplication("");
          setSuccessTrackApplication("");
        }}
        aria-labelledby="modal-track-title"
        slotProps={{
          backdrop: { className: "gwl-modal-backdrop" },
        }}
      >
        <Box className="gwl-modal-wrap">
          <motion.div
            className="gwl-modal-enter"
            style={{ width: "100%" }}
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={m.modalSpring}
          >
            <ModalShell
              titleId="modal-track-title"
              title={EDITORIAL_MODAL_TRACK.title}
              subtitle={EDITORIAL_MODAL_TRACK.subtitle}
              onClose={() => {
                setOpenTrackForm(false);
                setTrackingMobile("");
                setTrackingId("");
                setErrorTrackApplication("");
                setSuccessTrackApplication("");
              }}
            >
              <Stack spacing={2}>
                <span className="gwl-field-label">Mobile number *</span>
                <TextField
                  fullWidth
                  size="small"
                  value={trackingMobile}
                  onChange={(e) => setTrackingMobile(e.target.value)}
                  className="gwl-field"
                />
                <span className="gwl-field-label">Tracking ID *</span>
                <TextField
                  fullWidth
                  size="small"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="gwl-field"
                />
                {errorTrackApplication && (
                  <Alert severity="error" variant="outlined" className="gwl-modal-alert">
                    {errorTrackApplication}
                  </Alert>
                )}
                {successTrackApplication && (
                  <Alert severity="success" variant="outlined" className="gwl-modal-alert">
                    {successTrackApplication}
                  </Alert>
                )}
                <Button
                  variant="contained"
                  onClick={trackApplicationStatus}
                  disabled={trackingLoading}
                  fullWidth
                  disableElevation
                  className="gwl-btn gwl-modal-submit gwl-modal-submit--alt"
                >
                  {trackingLoading ? "Checking…" : "Check status"}
                </Button>
              </Stack>
            </ModalShell>
          </motion.div>
        </Box>
      </Modal>
    </Box>
  );
};

export default HomePage;
