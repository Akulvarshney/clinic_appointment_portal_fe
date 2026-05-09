import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import toast from "react-hot-toast";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


import { BACKEND_URL, states } from "../assets/constants";
import "./HomePage.css";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────
   Static content
   ───────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Upcoming", href: "#lead" },
  { label: "Clients", href: "#testi" },
  { label: "Pricing", href: "#pricing" },
];

const HERO_WORDS = ["Manage", "Your", "Entire"];

const TICKER_ITEMS = [
  { label: "Appointment Calendar", hi: true },
  { label: "Auto GST Billing" },
  { label: "Employee Management" },
  { label: "Inventory" },
  { label: "Role-Based Access" },
  { label: "Feedback" },
  { label: "Reminders" },
  { label: "Clinic Data Hub" },
];

const FLOAT_CARDS = [
  {
    icon: "📅",
    title: "Appointment Calendar",
    desc: "Smart scheduling with room & doctor allocation.",
    badge: "Core",
    pos: { top: "8%", left: "6%" },
  },
  {
    icon: "🧾",
    title: "Auto GST Billing",
    desc: "CGST/SGST or IGST handled automatically by state.",
    badge: "Finance",
    pos: { top: "5%", right: "5%" },
  },
  {
    icon: "👥",
    title: "Employee Management",
    desc: "Roles, shifts and access — one organised view.",
    badge: "Core",
    pos: { bottom: "12%", left: "4%" },
  },
  {
    icon: "🔐",
    title: "Role-Based Access",
    desc: "Custom permissions for every team member.",
    badge: "Security",
    pos: { bottom: "8%", right: "6%" },
  },
  {
    icon: "📦",
    title: "Inventory Management",
    desc: "Track stock across rooms in real time.",
    badge: "Operations",
    pos: { top: "55%", left: "40%", x: "-50%" },
  },
];

const FEATURES = [
  {
    num: "01",
    icon: "📅",
    tag: "Core",
    title: "Appointment Calendar",
    desc: "Smart scheduling with room and doctor allocation, conflict prevention, and one-tap reschedules.",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=2068",
  },
  {
    num: "02",
    icon: "👥",
    tag: "Core",
    title: "Employee Management",
    desc: "Onboard staff, manage shifts, attendance and performance from a single organised workspace.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=2084",
  },
  {
    num: "03",
    icon: "🏥",
    tag: "Core",
    title: "Clinic Data Hub",
    desc: "All your clinic information, services, rooms and configuration in one searchable place.",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2070",
  },
  {
    num: "04",
    icon: "🧾",
    tag: "Finance",
    title: "Billing & Auto-GST",
    desc: "Same-state CGST+SGST, inter-state IGST — calculated automatically on every invoice.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=2011",
  },
  {
    num: "05",
    icon: "📦",
    tag: "Operations",
    title: "Inventory Management",
    desc: "Live stock visibility across rooms, low-stock alerts, and structured procurement records.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2070",
  },
  {
    num: "06",
    icon: "⭐",
    tag: "Client Care",
    title: "Feedback Management",
    desc: "Capture client sentiment, route concerns and turn responses into measurable improvements.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2070",
  },
  {
    num: "07",
    icon: "🔔",
    tag: "Productivity",
    title: "To-do & Reminders",
    desc: "Personal and team reminders so nothing slips through — from follow-ups to inventory checks.",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=2072",
  },
  {
    num: "08",
    icon: "🔐",
    tag: "Security",
    title: "Role-Based Access",
    desc: "Define exactly who sees what. Custom roles, granular permissions, full audit trail.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070",
  },
];

const ROLES = [
  {
    pill: "Admin",
    cls: "rp-a",
    desc: "Full control over the clinic, billing and team",
    perms: ["f", "f", "f", "f"],
  },
  {
    pill: "Doctor",
    cls: "rp-d",
    desc: "Patient records, appointments, prescriptions",
    perms: ["f", "p", "n", "p"],
  },
  {
    pill: "Reception",
    cls: "rp-r",
    desc: "Booking, billing and check-ins",
    perms: ["p", "f", "p", "n"],
  },
  {
    pill: "Billing",
    cls: "rp-b",
    desc: "Invoicing, GST and payment reconciliation",
    perms: ["n", "f", "p", "n"],
  },
  {
    pill: "Custom",
    cls: "rp-c",
    desc: "Build your own permission set in seconds",
    perms: ["p", "p", "p", "p"],
  },
];

const PRICING = [
  {
    name: "Essential",
    desc: "Try the full platform for two weeks",
    price: "₹0",
    per: "14-day trial · up to 3 staff",
    feats: [
      "Appointment Calendar",
      "Basic Billing",
      "Employee Management",
      "Email support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Growth",
    desc: "Everything you need to run a busy clinic",
    price: "₹4,999",
    per: "/month · unlimited staff",
    feats: [
      "All 8 management modules",
      "Auto-GST billing",
      "Role-based access",
      "Priority 24/7 support",
      "Inventory & reminders",
    ],
    cta: "Become a Partner",
    featured: true,
  },
  {
    name: "Chain",
    desc: "Multi-branch clinics and franchises",
    price: "Custom",
    per: "Tailored to your network",
    feats: [
      "Multi-branch dashboard",
      "Centralised billing",
      "Dedicated specialist",
      "Custom integrations",
    ],
    cta: "Talk to Sales",
  },
];

const TESTI = {
  quote:
    "Before GloryWellNic, managing 50 appointments a day meant constant juggling between spreadsheets, WhatsApp and memory. Now everything is in one place. It has genuinely transformed how we run Elaria.",
  initials: "AS",
  name: "Akansha Srivastava",
  role: "Founder, Elaria Esthetique · Gurgaon",
};

const TESTI_METRICS = [
  { n: "1,300+", l: "Active clients" },
  { n: "50+", l: "Daily appointments" },
  { n: "#1", l: "First partner studio" },
  { n: "Zero", l: "Scheduling conflicts" },
];

/* ─────────────────────────────────────────────────────────────
   Wavy SVG bg primitive
   ───────────────────────────────────────────────────────────── */
function WaveBg({ seed = 2, className = "wave-bg" }) {
  const hLines = useMemo(
    () => Array.from({ length: 17 }, (_, i) => 50 + i * 50),
    [],
  );
  const vLines = useMemo(
    () => Array.from({ length: 17 }, (_, i) => 80 + i * 80),
    [],
  );
  const filterId = `wf-${seed}`;
  return (
    <div className={className} aria-hidden>
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={filterId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.008"
              numOctaves="3"
              seed={seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <g
          filter={`url(#${filterId})`}
          stroke="var(--gw-accent-dark)"
          strokeWidth="1"
          fill="none"
        >
          {hLines.map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="1440" y2={y} />
          ))}
          {vLines.map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="900" />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Sticky scroll-text + cards section (framer-motion adapter
   of the GSAP signature effect from CLAUDE.md §8)
   ───────────────────────────────────────────────────────────── */
function ScrollTextSection({ reduceMotion }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    // If reduceMotion is on, we don't want to scrub a timeline, 
    // just let CSS/Static render handle it or simple fades.
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2, // Smooth follow
        },
      });

      // 1. Text fades in & scales to 1
      tl.fromTo(
        ".big-words",
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1, ease: "power2.out" },
      );

      // 2. Cards stagger in
      tl.fromTo(
        ".float-card",
        { opacity: 0, y: 80, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.25,
          duration: 1.5,
          ease: "back.out(1.2)",
        },
        "-=0.4",
      );

      // 3. Hold for a moment
      tl.to({}, { duration: 1 });

      // 4. Exit text
      tl.to(".big-words", {
        opacity: 0,
        scale: 1.1,
        duration: 0.8,
        ease: "power2.in",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="scroll-text-sec"
      aria-label="Manage everything"
    >
      <div className="scroll-sticky">
        <div className="scroll-wave">
          <WaveBg seed={5} className="wave-bg" />
        </div>

        <div className="big-words">
          Manage <em>Everything</em>
        </div>

        <div className="cards-layer">
          {FLOAT_CARDS.map((card, i) => (
            <FloatCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FloatCard({ card }) {
  return (
    <div className="float-card" style={card.pos}>
      <div className="fc-ico">{card.icon}</div>
      <div className="fc-ttl">{card.title}</div>
      <div className="fc-dsc">{card.desc}</div>
      <span className="fc-badge">{card.badge}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Animated counter (in-view triggered)
   ───────────────────────────────────────────────────────────── */
function Counter({ target, suffix = "", duration = 1800 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !done) {
            const t0 = performance.now();
            const step = (ts) => {
              const p = Math.min((ts - t0) / duration, 1);
              const ease = 1 - Math.pow(1 - p, 4);
              setVal(Math.floor(ease * target));
              if (p < 1) requestAnimationFrame(step);
              else setDone(true);
            };
            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration, done]);

  return (
    <span ref={ref}>
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Modal shell
   ───────────────────────────────────────────────────────────── */
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
        <IconButton
          onClick={onClose}
          aria-label="Close dialog"
          size="small"
          className="gwl-modal-close"
        >
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

/* ─────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────── */
const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  // Nav scrolled state
  const [navScrolled, setNavScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hero parallax for mockup
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const mockupY = useTransform(
    heroProgress,
    [0, 1],
    [0, reduceMotion ? 0 : 80],
  );

  // Modals & form state (preserved from original)
  const [openNewForm, setOpenNewForm] = useState(false);
  const [openTrackForm, setOpenTrackForm] = useState(false);
  const [applicationForm, setApplicationForm] = useState(
    initialApplicationForm,
  );
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

  const submitNewApplicationRequest = async () => {
    setErrorMsgNewApplication("");
    setSuccessMsgNewApplication("");
    const { orgName, fullName, orgShortName, phone, email, address, state } =
      applicationForm;
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
      const response = await axios.post(
        `${BACKEND_URL}/noAuth/newApplication/submitApplication`,
        {
          org_name: orgName.trim(),
          phone: phone.trim(),
          org_short_name: orgShortName.trim(),
          client_name: fullName.trim(),
          email: email.trim(),
          state,
          address: address.trim(),
        },
      );
      if (!response.data.success) {
        const msg = response.data.message || "Failed to submit application.";
        toast.error(msg);
        setErrorMsgNewApplication(msg);
        return;
      }
      const tid = response.data.trackingId;
      setSuccessMsgNewApplication(
        `Application submitted successfully. Tracking ID: ${tid}`,
      );
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
      const response = await axios.get(
        `${BACKEND_URL}/noAuth/newApplication/trackApplication`,
        {
          params: {
            mobileNumber: trackingMobile.trim(),
            trackingId: trackingId.trim(),
          },
        },
      );
      setSuccessTrackApplication(response.data.message || "Status retrieved.");
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorTrackApplication(
          error.response.data?.message || "Unable to verify tracking details.",
        );
      } else {
        setErrorTrackApplication("Something went wrong. Try again.");
      }
    } finally {
      setTrackingLoading(false);
    }
  };

  const tickerLoop = [...TICKER_ITEMS, ...TICKER_ITEMS];

  const [activeFeature, setActiveFeature] = useState(0);
  const [isAutoPlayingFeatures, setIsAutoPlayingFeatures] = useState(true);

  useEffect(() => {
    if (!isAutoPlayingFeatures) return;
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoPlayingFeatures]);

  const heroTransition = (delay = 0) =>
    reduceMotion
      ? { duration: 0 }
      : { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay };

  const reveal = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 24 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box id="homepage">
      <motion.div className="gwl-spb" style={{ scaleX }} />

      {/* ── Nav ── */}
      {/* <nav className={`gwl-nav ${navScrolled ? "scrolled" : ""}`}>
        <RouterLink to="/" className="gwl-nav__logo">
          Glory<span>Well</span>Nic
        </RouterLink>
        <div className="gwl-nav__links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="gwl-nav__r">
          <RouterLink to="/login" className="btn-ghost btn-sm">
            Sign In
          </RouterLink>
          <button
            type="button"
            className="btn-prim btn-sm"
            onClick={openPartnerModal}
          >
            Book Demo
          </button>
        </div>
      </nav> */}

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="gwl-hero"
        aria-labelledby="gwl-hero-title"
      >
        <div className="hero-glow hero-glow1" aria-hidden />
        <div className="hero-glow hero-glow2" aria-hidden />
        <div className="hero-glow hero-glow3" aria-hidden />
        <WaveBg seed={2} />

        <div className="gwl-container">
          <div className="gwl-hero__inner">
            <div>
              <motion.div
                className="hero-tag"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={heroTransition(0.05)}
              >
                <span className="tag-dot" />
                Healthcare Partnership Platform
              </motion.div>

              <h1 id="gwl-hero-title" className="gwl-h1-display">
                <span className="hero-h-wrap">
                  {HERO_WORDS.map((w, i) => (
                    <motion.span
                      key={w}
                      className="hero-hw"
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                            duration: 0.85,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.15 + i * 0.1,
                          }
                      }
                    >
                      {w}
                    </motion.span>
                  ))}
                </span>
              </h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={heroTransition(0.55)}
              >
                <div className="gwl-h2-italic">Clinic, Beautifully.</div>
              </motion.div>

              <motion.p
                className="hero-sub"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={heroTransition(0.7)}
              >
                Smart scheduling, auto-GST billing, inventory, role-based access
                and more — one powerful portal built for modern clinics across
                India.
              </motion.p>

              <motion.div
                className="hero-btns"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={heroTransition(0.85)}
              >
                <button
                  type="button"
                  className="btn-prim"
                  onClick={openPartnerModal}
                >
                  Become a Partner
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={openTrackModal}
                >
                  Track Status
                </button>
              </motion.div>

              <motion.p
                className="hero-foot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={heroTransition(1)}
              >
                Partner applications reviewed individually — same-day
                credentials when approved.
              </motion.p>
            </div>

            <motion.div
              className="hero-mockup"
              style={{ y: mockupY }}
              initial={{ opacity: 0, y: 60, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }
              }
            >
              <motion.div
                className="fpill fp1"
                animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="ico">📅</span> 12 appointments today
              </motion.div>
              <motion.div
                className="fpill fp2"
                animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="ico">🧾</span> GST auto-applied
              </motion.div>
              <motion.div
                className="fpill fp3"
                animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
              >
                <span className="ico">🟢</span> Live
              </motion.div>

              <div className="mockup-shell">
                <div className="mock-topbar">
                  <span className="mock-dot" />
                  <span className="mock-dot" />
                  <span className="mock-dot" />
                </div>
                <div className="mock-body">
                  <div className="mock-grid">
                    <div className="mock-stat">
                      <div className="mock-stat-l">Today</div>
                      <div className="mock-stat-n">12</div>
                    </div>
                    <div className="mock-stat">
                      <div className="mock-stat-l">Revenue</div>
                      <div className="mock-stat-n">
                        ₹38<em>k</em>
                      </div>
                    </div>
                    <div className="mock-stat">
                      <div className="mock-stat-l">Staff</div>
                      <div className="mock-stat-n">8</div>
                    </div>
                  </div>

                  <div className="mock-appts">
                    {[
                      { t: "10:00", n: "Riya Sharma", s: "Confirmed" },
                      { t: "10:45", n: "Aman Verma", s: "Confirmed" },
                      { t: "11:30", n: "Neha Iyer", s: "Pending" },
                    ].map((a) => (
                      <div className="mock-appt" key={a.t}>
                        <div className="mock-appt-l">
                          <span className="mock-appt-time">{a.t}</span>
                          <span>{a.n}</span>
                        </div>
                        <span className="mock-appt-pill">{a.s}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mock-bill">
                    <div className="mock-bill-row">
                      <span>Service Total</span>
                      <span>₹2,000</span>
                    </div>
                    <div className="mock-bill-row">
                      <span>CGST 9%</span>
                      <span>₹180</span>
                    </div>
                    <div className="mock-bill-row">
                      <span>SGST 9%</span>
                      <span>₹180</span>
                    </div>
                    <div className="mock-bill-row tot">
                      <span>Total</span>
                      <span>₹2,360</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Marquee strip ── */}
      <div className="mstrip" aria-hidden>
        <div className="mtrack">
          {tickerLoop.map((it, i) => (
            <span
              key={`${it.label}-${i}`}
              className={`mi ${it.hi ? "hi" : ""}`}
            >
              {it.label} <span className="msep">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── ⭐ Sticky scroll-text + cards ── */}
      <ScrollTextSection reduceMotion={reduceMotion} />

      {/* ── Features grid ── */}
      <section id="features" className="gwl-features">
        <div className="gwl-container">
          <motion.div
            className="feat-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={reveal}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <div className="sec-ey">
                <span className="sec-ey-line" />
                <span className="sec-ey-txt">What's Inside</span>
              </div>
              <h2 className="gwl-sec-title">
                Eight pillars of <em>everyday excellence.</em>
              </h2>
            </div>
            <p className="gwl-body">
              Precision-engineered modules that eliminate complexity and amplify
              the quality of care your clinic delivers every day.
            </p>
          </motion.div>

          <div className="feat-grid-pillars">
            {FEATURES.map((f, i) => (
              <motion.article
                key={f.num}
                className={`fg-pillar ${activeFeature === i ? "active" : ""}`}
                onMouseEnter={() => {
                  setActiveFeature(i);
                  setIsAutoPlayingFeatures(false);
                }}
                onMouseLeave={() => setIsAutoPlayingFeatures(true)}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                  delay: reduceMotion ? 0 : (i % 8) * 0.05,
                }}
              >
                <div className="fg-pillar-inner">
                  <div
                    className="fg-pillar-bg"
                    style={{ backgroundImage: `url(${f.image})` }}
                  />
                  <div className="fg-pillar-overlay" />
                  <div className="fg-pillar-collapsed">
                    <div className="fg-num">{f.num}</div>
                    <div className="fg-ico-mini">{f.icon}</div>
                  </div>
                  <div className="fg-pillar-expanded">
                    <div className="fg-ico">{f.icon}</div>
                    <span className="fg-tag">{f.tag}</span>
                    <h3 className="fg-ttl">{f.title}</h3>
                    <p className="fg-dsc">{f.desc}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lead tracker ── */}
      <section id="lead" className="gwl-lead">
        <div className="lead-orb" aria-hidden />
        <div className="gwl-container">
          <div className="lead-inner">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="soon-badge">
                <span className="tag-dot" /> Coming soon · Join waitlist
              </div>
              <h2 className="gwl-sec-title">
                Your Meta ads, <em>finally connected.</em>
              </h2>
              <p className="gwl-body" style={{ marginTop: 16 }}>
                Capture leads from Instagram and Facebook campaigns directly
                into your GloryWellNic pipeline. Attribute every booking back to
                the ad that drove it — without the spreadsheets.
              </p>
              <div style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="btn-prim"
                  onClick={openPartnerModal}
                >
                  Join the waitlist
                </button>
              </div>
            </motion.div>

            <motion.div
              className="lead-ui"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="lead-ui-head">
                <div className="lead-ui-title">Lead pipeline</div>
                <span className="fg-tag">Preview</span>
              </div>
              <div className="lead-platforms">
                <div className="lead-plat">
                  <span className="ico">📸</span> Instagram Ads
                </div>
                <div className="lead-plat">
                  <span className="ico">👤</span> Facebook Ads
                </div>
              </div>
              <div className="lead-row">
                <span className="l">New leads this week</span>
                <span className="v">42</span>
              </div>
              <div className="lead-row">
                <span className="l">Booked consultations</span>
                <span className="v">18</span>
              </div>
              <div className="lead-row">
                <span className="l">Avg. cost per lead</span>
                <span className="v">₹84</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section id="testi" className="gwl-testi">
        <div className="testi-glow" aria-hidden />
        <div className="gwl-container">
          <div className="testi-inner">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="sec-ey">
                <span className="sec-ey-line" />
                <span className="sec-ey-txt">Partner story</span>
              </div>
              <p className="big-quote">{TESTI.quote}</p>
              <div className="testi-attr">
                <div className="testi-init">{TESTI.initials}</div>
                <div>
                  <div className="testi-name">{TESTI.name}</div>
                  <div className="testi-role">{TESTI.role}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="t-metrics"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: reduceMotion ? 0 : 0.08 },
                },
              }}
            >
              {TESTI_METRICS.map((m) => (
                <motion.div
                  key={m.l}
                  className="t-met"
                  variants={reveal}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="tm-n">{m.n}</div>
                  <div className="tm-l">{m.l}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="roles" className="gwl-roles">
        <div className="gwl-container">
          <div className="roles-inner">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="sec-ey">
                <span className="sec-ey-line" />
                <span className="sec-ey-txt">Role-Based Access</span>
              </div>
              <h2 className="gwl-sec-title">
                The right people see the <em>right things.</em>
              </h2>
              <p className="gwl-body" style={{ marginTop: 16 }}>
                Pre-built roles for clinical, front-desk and finance teams —
                plus fully custom permission sets for the way your clinic
                actually works.
              </p>
              <div className="roles-legend">
                <span className="lg">
                  <span className="dp dp-f" /> Full
                </span>
                <span className="lg">
                  <span className="dp dp-p" /> Partial
                </span>
                <span className="lg">
                  <span className="dp dp-n" /> None
                </span>
              </div>
            </motion.div>

            <motion.div
              className="r-list"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: reduceMotion ? 0 : 0.08 },
                },
              }}
            >
              {ROLES.map((r) => (
                <motion.div
                  key={r.pill}
                  className="r-row"
                  variants={{
                    hidden: { opacity: 0, x: reduceMotion ? 0 : 20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className={`r-pill ${r.cls}`}>{r.pill}</span>
                  <div className="r-desc">{r.desc}</div>
                  <div className="r-perms">
                    {r.perms.map((p, i) => (
                      <span key={i} className={`dp dp-${p}`} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="gwl-pricing">
        <div className="pricing-glow" aria-hidden />
        <div className="gwl-container">
          <motion.div
            className="pricing-head"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="sec-ey" style={{ justifyContent: "center" }}>
              <span className="sec-ey-line" />
              <span className="sec-ey-txt">Pricing</span>
            </div>
            <h2 className="gwl-sec-title">
              Simple plans, <em>built for growth.</em>
            </h2>
            <p
              className="gwl-body"
              style={{
                marginTop: 16,
                maxWidth: 620,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Start free, upgrade when you're ready. Every plan includes
              continuous updates and Indian-time support.
            </p>
          </motion.div>

          <div className="pc-grid">
            {PRICING.map((p, i) => (
              <motion.div
                key={p.name}
                className={`pc ${p.featured ? "pc-feat" : ""}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                  delay: reduceMotion ? 0 : i * 0.08,
                }}
              >
                <span className="pc-badge">
                  {p.featured ? "Most popular" : p.name}
                </span>
                <h3 className="pc-name">{p.name}</h3>
                <p className="pc-desc">{p.desc}</p>
                <div className="pc-price">{p.price}</div>
                <div className="pc-per">{p.per}</div>
                <ul className="pc-feats">
                  {p.feats.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="btn-pc"
                  onClick={p.featured ? openPartnerModal : openTrackModal}
                >
                  {p.cta}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Hero stats counter row */}
          <motion.div
            style={{
              marginTop: 80,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 40,
              textAlign: "center",
            }}
            className="pricing-counters"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <div className="tm-n">
                <Counter target={1300} suffix="+" />
              </div>
              <div className="tm-l">Active clients</div>
            </div>
            <div>
              <div className="tm-n">
                <Counter target={50} suffix="+" />
              </div>
              <div className="tm-l">Daily appointments</div>
            </div>
            <div>
              <div className="tm-n">∞</div>
              <div className="tm-l">Custom roles</div>
            </div>
            <div>
              <div className="tm-n">
                <Counter target={8} />
              </div>
              <div className="tm-l">Modules</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Box component="footer" className="gwl-footer">
        <div className="gwl-footer__inner">
          <RouterLink to="/" className="gwl-footer__brand">
            Glory<span>Well</span>Nic
          </RouterLink>
          <nav className="gwl-footer__links" aria-label="Footer">
            <a href="#features" className="gwl-footer__link">
              Features
            </a>
            <a href="#lead" className="gwl-footer__link">
              Upcoming
            </a>
            <a href="#testi" className="gwl-footer__link">
              Clients
            </a>
            <a href="#pricing" className="gwl-footer__link">
              Pricing
            </a>
            <RouterLink to="/login" className="gwl-footer__link">
              Sign in
            </RouterLink>
            <button
              type="button"
              className="gwl-footer__link"
              onClick={openPartnerModal}
            >
              Apply
            </button>
          </nav>
          <p className="gwl-footer__copy">
            © {new Date().getFullYear()} GloryWellNic
          </p>
        </div>
      </Box>

      {/* ── Modals (preserved) ── */}
      <Modal
        open={openNewForm}
        onClose={() => {
          setOpenNewForm(false);
          resetNewApplicationModal();
        }}
        aria-labelledby="modal-new-application-title"
        slotProps={{ backdrop: { className: "gwl-modal-backdrop" } }}
      >
        <Box className="gwl-modal-wrap gwl-modal-wrap--tall">
          <motion.div
            style={{ width: "100%" }}
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 340, damping: 30 }
            }
          >
            <ModalShell
              titleId="modal-new-application-title"
              title="Partner Application"
              subtitle="Tell us about your organisation — we review every request with care."
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
                  onChange={(e) =>
                    setApplicationForm((f) => ({
                      ...f,
                      orgName: e.target.value,
                    }))
                  }
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <span className="gwl-field-label gwl-field-label--spaced">
                      Your full name *
                    </span>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      placeholder="Dr. / Mr. / Ms."
                      value={applicationForm.fullName}
                      onChange={(e) =>
                        setApplicationForm((f) => ({
                          ...f,
                          fullName: e.target.value,
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <span className="gwl-field-label gwl-field-label--spaced">
                      Short name *
                    </span>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      placeholder="CWH"
                      value={applicationForm.orgShortName}
                      onChange={(e) =>
                        setApplicationForm((f) => ({
                          ...f,
                          orgShortName: e.target.value,
                        }))
                      }
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <span className="gwl-field-label gwl-field-label--spaced">
                      Mobile *
                    </span>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      placeholder="+91 …"
                      value={applicationForm.phone}
                      onChange={(e) =>
                        setApplicationForm((f) => ({
                          ...f,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <span className="gwl-field-label gwl-field-label--spaced">
                      Email *
                    </span>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      type="email"
                      placeholder="admin@org.in"
                      value={applicationForm.email}
                      onChange={(e) =>
                        setApplicationForm((f) => ({
                          ...f,
                          email: e.target.value,
                        }))
                      }
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
                  onChange={(e) =>
                    setApplicationForm((f) => ({
                      ...f,
                      address: e.target.value,
                    }))
                  }
                />
                <FormControl fullWidth required size="small">
                  <InputLabel id="gwl-state-label">State *</InputLabel>
                  <Select
                    labelId="gwl-state-label"
                    label="State *"
                    value={applicationForm.state}
                    onChange={(e) =>
                      setApplicationForm((f) => ({
                        ...f,
                        state: e.target.value,
                      }))
                    }
                  >
                    {states.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {errorMsgNewApplication && (
                  <Alert
                    severity="error"
                    variant="outlined"
                    className="gwl-modal-alert"
                  >
                    {errorMsgNewApplication}
                  </Alert>
                )}
                {successMsgNewApplication && (
                  <Alert
                    severity="success"
                    variant="outlined"
                    className="gwl-modal-alert"
                  >
                    {successMsgNewApplication}
                  </Alert>
                )}
                <Button
                  variant="contained"
                  onClick={submitNewApplicationRequest}
                  disabled={submittingApplication}
                  fullWidth
                  disableElevation
                  className="gwl-modal-submit"
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
        slotProps={{ backdrop: { className: "gwl-modal-backdrop" } }}
      >
        <Box className="gwl-modal-wrap">
          <motion.div
            style={{ width: "100%" }}
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 340, damping: 30 }
            }
          >
            <ModalShell
              titleId="modal-track-title"
              title="Track Application"
              subtitle="Enter your details to check status"
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
                />
                <span className="gwl-field-label">Tracking ID *</span>
                <TextField
                  fullWidth
                  size="small"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                />
                {errorTrackApplication && (
                  <Alert
                    severity="error"
                    variant="outlined"
                    className="gwl-modal-alert"
                  >
                    {errorTrackApplication}
                  </Alert>
                )}
                {successTrackApplication && (
                  <Alert
                    severity="success"
                    variant="outlined"
                    className="gwl-modal-alert"
                  >
                    {successTrackApplication}
                  </Alert>
                )}
                <Button
                  variant="contained"
                  onClick={trackApplicationStatus}
                  disabled={trackingLoading}
                  fullWidth
                  disableElevation
                  className="gwl-modal-submit gwl-modal-submit--alt"
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
