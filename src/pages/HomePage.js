import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Collapse,
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
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EastIcon from "@mui/icons-material/East";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import toast from "react-hot-toast";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
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

function ModalShell({ children, onClose, titleId, title, subtitle }) {
  return (
    <Paper elevation={0} className="gwl-modal-paper">
      <Box className="gwl-modal-head">
        <Box sx={{ minWidth: 0 }}>
          <Typography id={titleId} component="h2" className="gwl-modal-title">
            {title}
          </Typography>
          {subtitle && (
            <Typography component="p" className="gwl-modal-sub">
              {subtitle}
            </Typography>
          )}
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
      <section className="gwl-hero" aria-labelledby="gwl-hero-title">
        <div className="gwl-container">
          <div className="gwl-hero__grid">
            <div>
              <span className="gwl-kicker">{EDITORIAL_HERO.eyebrow}</span>
              <Typography id="gwl-hero-title" component="h1" className="gwl-h1">
                {EDITORIAL_HERO.titleLine1}{" "}
                <span>{EDITORIAL_HERO.titleLine2Italic}</span>
              </Typography>
              <p className="gwl-lead">{EDITORIAL_HERO.desc}</p>
              <div className="gwl-hero__cta">
                <Button
                  variant="contained"
                  disableElevation
                  onClick={openPartnerModal}
                  className="gwl-btn gwl-btn--primary gwl-btn--lg"
                  endIcon={<EastIcon sx={{ fontSize: 18 }} />}
                >
                  {EDITORIAL_HERO.primaryCta}
                </Button>
                <Button variant="outlined" onClick={openTrackModal} className="gwl-btn gwl-btn--outline gwl-btn--lg">
                  {EDITORIAL_HERO.secondaryCta}
                </Button>
              </div>
              <p className="gwl-hero__note">{EDITORIAL_HERO.footnote}</p>
            </div>
            <div className="gwl-hero__art" aria-hidden>
              <div className="gwl-hero__card">
                <div className="gwl-hero__card-title">Operations snapshot</div>
                <div className="gwl-hero__card-metric">1 live partner</div>
                <div className="gwl-hero__card-sub">Elaria Esthetique — appointments to billing in one stack</div>
                <div className="gwl-hero__dots">
                  <span className="gwl-hero__dot gwl-hero__dot--on" />
                  <span className="gwl-hero__dot" />
                  <span className="gwl-hero__dot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gwl-trust" aria-label="Platform highlights">
        <div className="gwl-trust__track">
          {tickerItems.map((label, i) => (
            <span key={`${label}-${i}`} className="gwl-trust__item">
              {label}
            </span>
          ))}
        </div>
      </section>

      <section id={EDITORIAL_LIVE_PARTNER.sectionId} className="gwl-section gwl-section--white">
        <div className="gwl-container">
          <div className="gwl-spotlight__grid">
            <div>
              <span className="gwl-kicker">{EDITORIAL_LIVE_PARTNER.label}</span>
              <Typography component="h2" className="gwl-h2">
                {EDITORIAL_LIVE_PARTNER.title}
              </Typography>
              <p className="gwl-body" style={{ fontWeight: 500, color: "var(--gw-ink3)" }}>
                {EDITORIAL_LIVE_PARTNER.meta}
              </p>
              <blockquote className="gwl-spotlight__quote">“{EDITORIAL_LIVE_PARTNER.quote}”</blockquote>
            </div>
            <div className="gwl-spotlight__media">
              <img src={EDITORIAL_LIVE_PARTNER.image} alt={EDITORIAL_LIVE_PARTNER.imageAlt} loading="lazy" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>

      <section className="gwl-section gwl-section--surface gwl-section--tight">
        <div className="gwl-container">
          <div className="gwl-stats">
            {EDITORIAL_STATS.map((s) => (
              <div key={s.l}>
                <div className="gwl-stat__n">{s.n}</div>
                <div className="gwl-stat__l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="gwl-section gwl-section--white">
        <div className="gwl-container">
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 5 }}>
              <span className="gwl-kicker">{EDITORIAL_ABOUT.label}</span>
              <Typography component="h2" className="gwl-h2">
                {EDITORIAL_ABOUT.titleBefore} <em>{EDITORIAL_ABOUT.titleEm}</em>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <p className="gwl-body" style={{ marginBottom: "1.25rem" }}>
                {EDITORIAL_ABOUT.p1}
              </p>
              <p className="gwl-body">{EDITORIAL_ABOUT.p2}</p>
            </Grid>
          </Grid>
        </div>
      </section>

      <section id="mission" className="gwl-split">
        <Box className="gwl-split__media">
          <img src={EDITORIAL_MISSION.image} alt={EDITORIAL_MISSION.imageAlt} loading="lazy" referrerPolicy="no-referrer" />
        </Box>
        <div className="gwl-split__body gwl-split__body--surface">
          <span className="gwl-kicker">{EDITORIAL_MISSION.label}</span>
          <Typography component="h2" className="gwl-h2">
            {EDITORIAL_MISSION.titleBefore} <em>{EDITORIAL_MISSION.titleEm}</em>
          </Typography>
          <p className="gwl-body" style={{ marginTop: 12 }}>
            {EDITORIAL_MISSION.p}
          </p>
          <ul className="gwl-checklist">
            {EDITORIAL_MISSION.bullets.map((line) => (
              <li key={line}>
                <span className="gwl-checklist__icon">
                  <CheckRoundedIcon fontSize="small" />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <Button
            variant="contained"
            disableElevation
            onClick={openPartnerModal}
            className="gwl-btn gwl-btn--primary gwl-btn--lg"
            sx={{ alignSelf: "flex-start" }}
          >
            {EDITORIAL_MISSION.cta}
          </Button>
        </div>
      </section>

      <section id="features" className="gwl-section gwl-section--surface">
        <div className="gwl-container">
          <div className="gwl-features__head">
            <div>
              <span className="gwl-kicker">{EDITORIAL_FEATURES.label}</span>
              <Typography component="h2" className="gwl-h2">
                Six pillars of <em>{EDITORIAL_FEATURES.titleEm}</em>
              </Typography>
            </div>
            <p className="gwl-lead" style={{ maxWidth: "none" }}>
              {EDITORIAL_FEATURES.intro}
            </p>
          </div>
          <div className="gwl-feature-grid">
            {EDITORIAL_FEATURES.rows.map((row) => (
              <article key={row.idx} className="gwl-feature-card">
                <div className="gwl-feature-card__idx">{row.idx}</div>
                <span className="gwl-feature-card__tag">{row.tag}</span>
                <Typography component="h3" className="gwl-feature-card__title">
                  {row.title}
                </Typography>
                <p className="gwl-feature-card__body">{row.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="gwl-section gwl-section--white">
        <div className="gwl-container">
          <div className="gwl-steps__intro">
            <span className="gwl-kicker">{EDITORIAL_STEPS.label}</span>
            <Typography component="h2" className="gwl-h2">
              From application to active partner <em>{EDITORIAL_STEPS.titleEm}</em>
            </Typography>
          </div>
          <div className="gwl-steps__grid">
            {EDITORIAL_STEPS.steps.map((st) => (
              <div key={st.n} className="gwl-step-card">
                <div className="gwl-step-card__n">{st.n}</div>
                <Typography component="h3" className="gwl-step-card__title">
                  {st.t}
                </Typography>
                <p className="gwl-step-card__body">{st.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gwl-split gwl-split--flip">
        <Box className="gwl-split__media">
          <img src={EDITORIAL_PARTNER_SPLIT.image} alt={EDITORIAL_PARTNER_SPLIT.imageAlt} loading="lazy" referrerPolicy="no-referrer" />
        </Box>
        <div className="gwl-split__body">
          <span className="gwl-kicker">{EDITORIAL_PARTNER_SPLIT.label}</span>
          <Typography component="h2" className="gwl-h2">
            Your operations. <em>{EDITORIAL_PARTNER_SPLIT.titleEm}</em>
          </Typography>
          <div className="gwl-badge">
            <span className="gwl-badge__n">{EDITORIAL_PARTNER_SPLIT.badgeN}</span>
            <span className="gwl-badge__l">{EDITORIAL_PARTNER_SPLIT.badgeL}</span>
          </div>
          <p className="gwl-body">{EDITORIAL_PARTNER_SPLIT.p}</p>
          <Button
            component={RouterLink}
            to="/login"
            variant="outlined"
            className="gwl-btn gwl-btn--outline gwl-btn--lg"
            startIcon={<LoginOutlinedIcon />}
            sx={{ alignSelf: "flex-start", mt: 2 }}
          >
            {EDITORIAL_PARTNER_SPLIT.cta}
          </Button>
        </div>
      </section>

      <section className="gwl-section gwl-section--surface">
        <div className="gwl-container">
          <span className="gwl-kicker">{EDITORIAL_TESTIMONIALS_HEADER.label}</span>
          <Typography component="h2" className="gwl-h2" sx={{ mb: 4 }}>
            {EDITORIAL_TESTIMONIALS_HEADER.titleBefore}
            <em>{EDITORIAL_TESTIMONIALS_HEADER.titleEm}</em>
          </Typography>
          {EDITORIAL_TESTIMONIALS.map((t) => (
            <div key={t.name} className="gwl-quote-card">
              <p className="gwl-quote-card__text">“{t.quote}”</p>
              <div className="gwl-quote-card__person">
                <div className="gwl-quote-card__avatar">{t.initials}</div>
                <div>
                  <div className="gwl-quote-card__name">{t.name}</div>
                  <div className="gwl-quote-card__role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="gwl-section gwl-section--white">
        <div className="gwl-container">
          <div className="gwl-faq__grid">
            <div>
              <span className="gwl-kicker">{EDITORIAL_FAQ_HEADER.label}</span>
              <Typography component="h2" className="gwl-h2">
                Questions, <em>{EDITORIAL_FAQ_HEADER.titleEm}</em>
              </Typography>
              <p className="gwl-body" style={{ marginTop: 16 }}>
                {EDITORIAL_FAQ_HEADER.subtitle}
              </p>
            </div>
            <div className="gwl-faq__list">
              {EDITORIAL_FAQ.map((item, i) => {
                const open = faqOpen.has(i);
                return (
                  <div key={item.q} className="gwl-faq__item">
                    <button type="button" className="gwl-faq__q" onClick={() => toggleFaq(i)}>
                      {item.q}
                      <span className={cx("gwl-faq__toggle", open && "gwl-faq__toggle--open")}>+</span>
                    </button>
                    <Collapse in={open}>
                      <Typography component="p" className="gwl-faq__a">
                        {item.a}
                      </Typography>
                    </Collapse>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="gwl-cta" aria-labelledby="gwl-cta-title">
        <div className="gwl-container">
          <div className="gwl-cta__inner">
            <p className="gwl-cta__kicker">{EDITORIAL_CTA.label}</p>
            <Typography id="gwl-cta-title" component="h2" className="gwl-cta__title">
              {EDITORIAL_CTA.titleBefore}
              <em style={{ fontStyle: "italic", opacity: 0.95 }}>{EDITORIAL_CTA.titleEm}</em>
            </Typography>
            <p className="gwl-cta__body">{EDITORIAL_CTA.p}</p>
            <div className="gwl-cta__actions">
              <Button
                variant="contained"
                disableElevation
                onClick={openPartnerModal}
                className="gwl-btn gwl-btn--lg gwl-btn--on-dark"
                endIcon={<EastIcon sx={{ fontSize: 18 }} />}
              >
                {EDITORIAL_CTA.primary}
              </Button>
              <Button variant="outlined" onClick={openTrackModal} className="gwl-btn gwl-btn--lg gwl-btn--outline-light">
                {EDITORIAL_CTA.secondary}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Box component="footer" className="gwl-footer">
        <div className="gwl-footer__inner">
          <RouterLink to="/" className="gwl-footer__brand">
            GloryWellnic
          </RouterLink>
          <nav className="gwl-footer__links" aria-label="Footer">
            <RouterLink to="/" className="gwl-footer__link">
              Home
            </RouterLink>
            <Typography component="a" href="#about" className="gwl-footer__link">
              About
            </Typography>
            <Typography component="a" href="#features" className="gwl-footer__link">
              Platform
            </Typography>
            <Typography component="a" href="#faq" className="gwl-footer__link">
              FAQ
            </Typography>
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
          <Box className="gwl-modal-enter" sx={{ width: "100%" }}>
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
                <Typography className="gwl-field-label">Organisation name *</Typography>
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
                    <Typography className={cx("gwl-field-label", "gwl-field-label--spaced")}>Your full name *</Typography>
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
                    <Typography className={cx("gwl-field-label", "gwl-field-label--spaced")}>Short name *</Typography>
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
                    <Typography className={cx("gwl-field-label", "gwl-field-label--spaced")}>Mobile *</Typography>
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
                    <Typography className={cx("gwl-field-label", "gwl-field-label--spaced")}>Email *</Typography>
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
                <Typography className="gwl-field-label">Address *</Typography>
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
          </Box>
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
          <Box className="gwl-modal-enter" sx={{ width: "100%" }}>
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
                <Typography className="gwl-field-label">Mobile number *</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={trackingMobile}
                  onChange={(e) => setTrackingMobile(e.target.value)}
                  className="gwl-field"
                />
                <Typography className="gwl-field-label">Tracking ID *</Typography>
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
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default HomePage;
