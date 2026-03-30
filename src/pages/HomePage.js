import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Collapse,
  Container,
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
import EastIcon from "@mui/icons-material/East";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
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

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function EditorialProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max <= 0 ? 0 : scrollTop / max);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={'scrollProgress'}
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}

function SectionLabel({ children, compact }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.875}
      className={cn('sectionLabelRow', compact && 'sectionLabelRowCompact')}
    >
      <Box className={'sectionLabelRule'} />
      <Typography className={'sectionLabelText'} component="span">
        {children}
      </Typography>
    </Stack>
  );
}

function SerifHeading({ children, className, ...rest }) {
  return (
    <Typography component="h2" className={cn('serifHeading', className)} {...rest}>
      {children}
    </Typography>
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

function EditorialModalShell({ children, onClose, titleId, title, subtitle }) {
  return (
    <Paper elevation={0} className={'lp-modal-paper'}>
      <Box className={'lp-modal-header'}>
        <Box className={'lp-modal-header-text'}>
          <Typography id={titleId} className={'lp-modal-title'}>
            {title}
          </Typography>
          {subtitle && <Typography className={'lp-modal-subtitle'}>{subtitle}</Typography>}
        </Box>
        <IconButton onClick={onClose} aria-label="Close dialog" className={'lp-modal-close'}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box className={'lp-modal-body'}>{children}</Box>
    </Paper>
  );
}

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [heroReady, setHeroReady] = useState(false);
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

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 80);
    return () => clearTimeout(t);
  }, []);

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
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
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
    <Box id="homepage">
      <EditorialProgress />

      {/* Hero — typography-led; partner story in #live-partner */}
      <Box component="section" className={'hero'}>
        <Box className={'heroAccentBar'} aria-hidden />
        <Box className={'heroDecoCircle'} aria-hidden />
        <Box className={'heroDecoSquare'} aria-hidden />
        <Box className={'heroInner'}>
          <Stack direction="row" alignItems="center" spacing={1.5} className={'heroEyebrowRow'}>
            <Box className={'heroEyebrowRule'} aria-hidden />
            <Typography className={'heroEyebrow'}>{EDITORIAL_HERO.eyebrow}</Typography>
          </Stack>

          <Typography component="h1" className={'heroTitle'}>
            <Box className={'heroTitleLine'}>
              <span
                className={cn(
                  'heroTitleRevealLine',
                  heroReady && 'heroTitleRevealLine1Ready',
                )}
              >
                {EDITORIAL_HERO.titleLine1}
              </span>
            </Box>
            <Box className={'heroTitleAccent'}>
              <span
                className={cn(
                  'heroTitleAccentInner',
                  'heroTitleRevealLine',
                  heroReady && 'heroTitleRevealLine2Ready',
                )}
              >
                {EDITORIAL_HERO.titleLine2Italic}
              </span>
            </Box>
          </Typography>

          <Grid container spacing={{ xs: 3, md: 5 }} alignItems={{ xs: "flex-start", md: "flex-end" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography className={'heroDesc'}>{EDITORIAL_HERO.desc}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box className={'heroCtaStack'}>
                <Button variant="text" className={'btnDark'} onClick={openPartnerModal} startIcon={<EastIcon />}>
                  {EDITORIAL_HERO.primaryCta}
                </Button>
                <Button variant="text" className={'btnLight'} onClick={openTrackModal}>
                  {EDITORIAL_HERO.secondaryCta}
                </Button>
              </Box>
              <Typography className={'heroFootnote'}>{EDITORIAL_HERO.footnote}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Ticker */}
      <Box className={'tickerWrap'}>
        <Box className={'tickerTrack'}>
          {tickerItems.map((label, i) => (
            <Stack key={`${label}-${i}`} direction="row" alignItems="center" spacing={1.25} className={'tickerItem'}>
              <Typography className={'tickerText'}>{label}</Typography>
              <Typography component="span" className={'tickerDot'}>
                ·
              </Typography>
            </Stack>
          ))}
        </Box>
      </Box>

      {/* Live partner studio — dedicated band */}
      <Box component="section" id={EDITORIAL_LIVE_PARTNER.sectionId} className={'livePartner'}>
        <Box className={'livePartnerInner'}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="stretch">
            <Grid size={{ xs: 12, md: 6 }} className={'livePartnerCopy'}>
              <Typography className={'livePartnerLabel'}>{EDITORIAL_LIVE_PARTNER.label}</Typography>
              <Typography className={'livePartnerTitle'}>{EDITORIAL_LIVE_PARTNER.title}</Typography>
              <Typography className={'livePartnerMeta'}>{EDITORIAL_LIVE_PARTNER.meta}</Typography>
              <Box className={'livePartnerQuoteWrap'}>
                <Typography component="p" className={'livePartnerQuote'}>
                  “{EDITORIAL_LIVE_PARTNER.quote}”
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} className={'livePartnerMediaCol'}>
              <Box className={'livePartnerMedia'}>
                <Box component="img" src={EDITORIAL_LIVE_PARTNER.image} alt={EDITORIAL_LIVE_PARTNER.imageAlt} loading="lazy" referrerPolicy="no-referrer" className={'livePartnerImg'} />
                <Box className={'livePartnerImgOverlay'} aria-hidden />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Stats */}
      <Box component="section" className={'statsSection'}>
        <Grid container className={'statsGrid'}>
          {EDITORIAL_STATS.map((s) => (
            <Grid key={s.l} size={{ xs: 6, sm: 6, md: 6 }} className={'statCell'}>
              <Box className={'statCellPad'}>
                <Typography className={'statNum'}>{s.n}</Typography>
                <Typography className={'statLabel'}>{s.l}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* About */}
      <Box component="section" id="about" className={'about'}>
        <Container maxWidth={false} disableGutters className={'containerNarrow'}>
          <SectionLabel>{EDITORIAL_ABOUT.label}</SectionLabel>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-end">
            <Grid size={{ xs: 12, md: 6 }}>
              <SerifHeading>
                {EDITORIAL_ABOUT.titleBefore}{" "}
                <Box component="em" className={'emItalic'}>
                  {EDITORIAL_ABOUT.titleEm}
                </Box>
              </SerifHeading>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} className={'aboutCol'}>
              <Typography className={cn('aboutBody', 'aboutBodyFirst')}>{EDITORIAL_ABOUT.p1}</Typography>
              <Typography className={'aboutBody'}>{EDITORIAL_ABOUT.p2}</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mission split */}
      <Grid container id="mission" className={'missionGrid'}>
        <Grid size={{ xs: 12, md: 6 }} className={'missionFigure'}>
          <Box component="img" src={EDITORIAL_MISSION.image} alt={EDITORIAL_MISSION.imageAlt} loading="lazy" referrerPolicy="no-referrer" className={'missionImg'} />
          <Box className={'missionImgOverlay'} aria-hidden />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} className={'missionBody'}>
          <Box className={'missionSectionLabelWrap'}>
            <SectionLabel compact>{EDITORIAL_MISSION.label}</SectionLabel>
          </Box>
          <SerifHeading className={'missionSerifHeading'}>
            {EDITORIAL_MISSION.titleBefore}{" "}
            <Box component="em" className={'emItalic'}>
              {EDITORIAL_MISSION.titleEm}
            </Box>
          </SerifHeading>
          <Typography className={'missionLead'}>{EDITORIAL_MISSION.p}</Typography>
          <Stack component="ul" spacing={0} className={'missionList'}>
            {EDITORIAL_MISSION.bullets.map((line) => (
              <Box component="li" key={line} className={'missionListItem'}>
                <Typography component="span" className={'missionListArrow'}>
                  →
                </Typography>
                {line}
              </Box>
            ))}
          </Stack>
          <Button variant="text" className={cn('btnDark', 'btnAlignStart', 'btnIcon18')} onClick={openPartnerModal} startIcon={<AddOutlinedIcon />}>
            {EDITORIAL_MISSION.cta}
          </Button>
        </Grid>
      </Grid>

      {/* Features */}
      <Box component="section" id="features" className={'features'}>
        <Container maxWidth={false} disableGutters className={'containerNarrow'}>
          <SectionLabel>{EDITORIAL_FEATURES.label}</SectionLabel>
          <Grid container spacing={{ xs: 3, md: 6 }} alignItems="flex-end">
            <Grid size={{ xs: 12, md: 6 }}>
              <SerifHeading>
                Six pillars of <Box component="em" className={'emItalic'}>{EDITORIAL_FEATURES.titleEm}</Box>
              </SerifHeading>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} className={'featuresIntroCol'}>
              <Typography className={'featuresIntro'}>{EDITORIAL_FEATURES.intro}</Typography>
            </Grid>
          </Grid>
          <Box className={'featuresList'}>
            {EDITORIAL_FEATURES.rows.map((row) => (
              <Box key={row.idx} className={'featRow'}>
                <Typography className={'featIdx'}>{row.idx}</Typography>
                <Box>
                  <Typography className={'featTitle'}>{row.title}</Typography>
                  <Typography component="span" className={'featTag'}>
                    {row.tag}
                  </Typography>
                </Box>
                <Typography className={'featBody'}>{row.body}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Steps */}
      <Box component="section" id="how" className={'steps'}>
        <Container maxWidth={false} disableGutters className={'containerNarrow'}>
          <SectionLabel>{EDITORIAL_STEPS.label}</SectionLabel>
          <SerifHeading className={'stepsHeading'}>
            From application to active partner <Box component="em" className={'emItalic'}>{EDITORIAL_STEPS.titleEm}</Box>
          </SerifHeading>
          <Grid container className={'stepsGrid'}>
            {EDITORIAL_STEPS.steps.map((st, i) => (
              <Grid key={st.n} size={{ xs: 12, md: 4 }} className={cn('stepCol', i === 2 && 'stepColLast')}>
                <Typography className={'stepN'}>{st.n}</Typography>
                <Typography className={'stepTitle'}>{st.t}</Typography>
                <Typography className={'stepBody'}>{st.b}</Typography>
                <Typography className={'stepArrow'} aria-hidden>
                  ↗
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Partner split */}
      <Grid container className={'partnerSplit'}>
        <Grid size={{ xs: 12, md: 6 }} order={{ xs: 2, md: 1 }} className={'partnerBody'}>
          <Box className={'missionSectionLabelWrap'}>
            <SectionLabel compact>{EDITORIAL_PARTNER_SPLIT.label}</SectionLabel>
          </Box>
          <SerifHeading>
            Your operations. <Box component="em" className={'emItalic'}>{EDITORIAL_PARTNER_SPLIT.titleEm}</Box>
          </SerifHeading>
          <Paper elevation={0} className={'partnerBadgePaper'}>
            <Typography className={'partnerBadgeN'}>{EDITORIAL_PARTNER_SPLIT.badgeN}</Typography>
            <Typography className={'partnerBadgeL'}>{EDITORIAL_PARTNER_SPLIT.badgeL}</Typography>
          </Paper>
          <Typography className={'partnerText'}>{EDITORIAL_PARTNER_SPLIT.p}</Typography>
          <Button component={RouterLink} to="/login" variant="text" className={cn('btnLight', 'btnAlignStart', 'btnLoginLink', 'btnIcon18')} startIcon={<LoginOutlinedIcon />}>
            {EDITORIAL_PARTNER_SPLIT.cta}
          </Button>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} order={{ xs: 1, md: 2 }} className={'partnerFigure'}>
          <Box component="img" src={EDITORIAL_PARTNER_SPLIT.image} alt={EDITORIAL_PARTNER_SPLIT.imageAlt} loading="lazy" referrerPolicy="no-referrer" className={'partnerFigImg'} />
          <Box className={'partnerFigOverlay'} aria-hidden />
        </Grid>
      </Grid>

      {/* Testimonials */}
      <Box component="section" className={'testimonials'}>
        <Container maxWidth={false} disableGutters className={'containerNarrow'}>
          <SectionLabel>{EDITORIAL_TESTIMONIALS_HEADER.label}</SectionLabel>
          <SerifHeading className={'testimonialsHeading'}>
            {EDITORIAL_TESTIMONIALS_HEADER.titleBefore}
            <Box component="em" className={'emItalic'}>{EDITORIAL_TESTIMONIALS_HEADER.titleEm}</Box>
          </SerifHeading>
          <Grid container className={'testimonialsGrid'}>
            {EDITORIAL_TESTIMONIALS.map((t) => (
              <Grid key={t.name} size={{ xs: 12, md: EDITORIAL_TESTIMONIALS.length === 1 ? 12 : 6 }} className={cn('testimonialCell', EDITORIAL_TESTIMONIALS.length === 1 && 'testimonialCellSingle')}>
                <Typography className={'testimonialQuote'}>“{t.quote}”</Typography>
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Box className={'testimonialAvatar'}>{t.initials}</Box>
                  <Box>
                    <Typography className={'testimonialName'}>{t.name}</Typography>
                    <Typography className={'testimonialRole'}>{t.role}</Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ */}
      <Box component="section" id="faq" className={'faq'}>
        <Container maxWidth={false} disableGutters className={'containerNarrow'}>
          <SectionLabel>{EDITORIAL_FAQ_HEADER.label}</SectionLabel>
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 5 }}>
              <SerifHeading>
                Questions, <Box component="em" className={'emItalic'}>{EDITORIAL_FAQ_HEADER.titleEm}</Box>
              </SerifHeading>
              <Typography className={'faqSubtitle'}>{EDITORIAL_FAQ_HEADER.subtitle}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }} className={'faqListCol'}>
              {EDITORIAL_FAQ.map((item, i) => {
                const open = faqOpen.has(i);
                return (
                  <Box key={item.q} className={'faqItem'}>
                    <Box component="button" type="button" onClick={() => toggleFaq(i)} className={'faqQuestion'}>
                      {item.q}
                      <Box className={cn('faqToggle', open && 'faqToggleOpen')}>+</Box>
                    </Box>
                    <Collapse in={open}>
                      <Typography className={'faqAnswer'}>{item.a}</Typography>
                    </Collapse>
                  </Box>
                );
              })}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA — “Ready to begin?” */}
      <Box className={'ctaBand'}>
        <Container maxWidth={false} disableGutters className={'containerNarrow'}>
          <Box className={'ctaCard'}>
            <Box className={'ctaInner'}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.25} className={'ctaEyebrowRow'}>
                <Box className={'ctaEyebrowRule'} aria-hidden />
                <Typography component="p" className={'ctaEyebrow'}>
                  {EDITORIAL_CTA.label}
                </Typography>
                <Box className={'ctaEyebrowRule'} aria-hidden />
              </Stack>
              <SerifHeading className={'ctaTitle'}>
                {EDITORIAL_CTA.titleBefore}
                <Box component="em" className={'ctaTitleAccent'}>
                  {EDITORIAL_CTA.titleEm}
                </Box>
              </SerifHeading>
              <Typography component="p" className={'ctaBody'}>
                {EDITORIAL_CTA.p}
              </Typography>
              <Stack direction="row" spacing={1.25} justifyContent="center" alignItems="center" flexWrap="wrap" useFlexGap className={'ctaBtnRow'}>
                <Button variant="text" className={'btnDark'} onClick={openPartnerModal} startIcon={<EastIcon />}>
                  {EDITORIAL_CTA.primary}
                </Button>
                <Button variant="text" className={'btnLight'} onClick={openTrackModal}>
                  {EDITORIAL_CTA.secondary}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" className={'footer'}>
        <Typography component={RouterLink} to="/" className={'footerBrand'}>
          GloryWellnic
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography component={RouterLink} to="/" className={'footerLink'}>
            Home
          </Typography>
          <Typography component="a" href="#about" className={'footerLink'}>
            About
          </Typography>
          <Typography component="a" href="#features" className={'footerLink'}>
            Platform
          </Typography>
          <Typography component="a" href="#faq" className={'footerLink'}>
            FAQ
          </Typography>
          <Typography component={RouterLink} to="/login" className={'footerLink'}>
            Sign In
          </Typography>
          <Typography component="button" type="button" onClick={openPartnerModal} className={'footerLinkButton'}>
            Apply Now
          </Typography>
        </Stack>
        <Typography className={'footerCopy'}>© {new Date().getFullYear()} GloryWellnic</Typography>
      </Box>

      {/* Partner modal */}
      <Modal
        open={openNewForm}
        onClose={() => {
          setOpenNewForm(false);
          resetNewApplicationModal();
        }}
        aria-labelledby="modal-new-application-title"
        slotProps={{
          backdrop: { className: 'lp-modal-backdrop' },
        }}
      >
        <Box className={cn('lp-modal-wrap', 'lp-modal-wrap-tall')}>
          <Box className={'lp-modal-content-enter'} sx={{ width: "100%" }}>
            <EditorialModalShell
              titleId="modal-new-application-title"
              title={EDITORIAL_MODAL_PARTNER.title}
              subtitle={EDITORIAL_MODAL_PARTNER.subtitle}
              onClose={() => {
                setOpenNewForm(false);
                resetNewApplicationModal();
              }}
            >
              <Stack spacing={2}>
                <Typography className={'lp-modal-field-label'}>Organisation name *</Typography>
                <TextField fullWidth required size="small" placeholder="e.g. City Wellness Hospital" value={applicationForm.orgName} onChange={(e) => setApplicationForm((f) => ({ ...f, orgName: e.target.value }))} className={'lp-field'} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography className={cn('lp-modal-field-label', 'lp-modal-field-label-spaced')}>Your full name *</Typography>
                    <TextField fullWidth required size="small" placeholder="Dr. / Mr. / Ms." value={applicationForm.fullName} onChange={(e) => setApplicationForm((f) => ({ ...f, fullName: e.target.value }))} className={'lp-field'} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography className={cn('lp-modal-field-label', 'lp-modal-field-label-spaced')}>Short name *</Typography>
                    <TextField fullWidth required size="small" placeholder="CWH" value={applicationForm.orgShortName} onChange={(e) => setApplicationForm((f) => ({ ...f, orgShortName: e.target.value }))} className={'lp-field'} />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography className={cn('lp-modal-field-label', 'lp-modal-field-label-spaced')}>Mobile *</Typography>
                    <TextField fullWidth required size="small" placeholder="+91 …" value={applicationForm.phone} onChange={(e) => setApplicationForm((f) => ({ ...f, phone: e.target.value }))} className={'lp-field'} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography className={cn('lp-modal-field-label', 'lp-modal-field-label-spaced')}>Email *</Typography>
                    <TextField fullWidth required size="small" type="email" placeholder="admin@org.in" value={applicationForm.email} onChange={(e) => setApplicationForm((f) => ({ ...f, email: e.target.value }))} className={'lp-field'} />
                  </Grid>
                </Grid>
                <Typography className={'lp-modal-field-label'}>Address *</Typography>
                <TextField fullWidth required multiline minRows={3} size="small" placeholder="Full registered address…" value={applicationForm.address} onChange={(e) => setApplicationForm((f) => ({ ...f, address: e.target.value }))} className={'lp-field'} />
                <FormControl fullWidth required size="small" className={'lp-field'}>
                  <InputLabel id="ed-state-label">State *</InputLabel>
                  <Select labelId="ed-state-label" label="State *" value={applicationForm.state} onChange={(e) => setApplicationForm((f) => ({ ...f, state: e.target.value }))}>
                    {states.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errorMsgNewApplication && <Alert severity="error" variant="outlined" className={'lp-modal-alert'}>{errorMsgNewApplication}</Alert>}
                {successMsgNewApplication && (
                  <Alert severity="success" variant="outlined" className={cn('lp-modal-alert', 'lp-modal-alert-success')}>
                    {successMsgNewApplication}
                  </Alert>
                )}
                <Button variant="contained" onClick={submitNewApplicationRequest} disabled={submittingApplication} fullWidth className={cn('btnDark', 'lp-modal-submit')}>
                  {submittingApplication ? "Submitting…" : "Submit Application →"}
                </Button>
              </Stack>
            </EditorialModalShell>
          </Box>
        </Box>
      </Modal>

      {/* Track modal */}
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
          backdrop: { className: 'lp-modal-backdrop' },
        }}
      >
        <Box className={'lp-modal-wrap'}>
          <Box className={'lp-modal-content-enter'} sx={{ width: "100%" }}>
            <EditorialModalShell
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
                <Typography className={'lp-modal-field-label'}>Mobile number *</Typography>
                <TextField fullWidth size="small" value={trackingMobile} onChange={(e) => setTrackingMobile(e.target.value)} className={'lp-field'} />
                <Typography className={'lp-modal-field-label'}>Tracking ID *</Typography>
                <TextField fullWidth size="small" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} className={'lp-field'} />
                {errorTrackApplication && <Alert severity="error" variant="outlined" className={'lp-modal-alert'}>{errorTrackApplication}</Alert>}
                {successTrackApplication && (
                  <Alert severity="success" variant="outlined" className={cn('lp-modal-alert', 'lp-modal-alert-success')}>
                    {successTrackApplication}
                  </Alert>
                )}
                <Button variant="contained" onClick={trackApplicationStatus} disabled={trackingLoading} fullWidth className={cn('btnDark', 'lp-modal-submit', 'lp-modal-submit-track')}>
                  {trackingLoading ? "Checking…" : "Check Status →"}
                </Button>
              </Stack>
            </EditorialModalShell>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default HomePage;
