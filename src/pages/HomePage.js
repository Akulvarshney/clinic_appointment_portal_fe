import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
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
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { BACKEND_URL, states } from "../assets/constants";
import "./HomePage.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ────────── Content (CLAUDE.md §17) ────────── */

const HERO = {
  tag: "Built for Medical Clinics",
  words: ["Manage", "Your", "Entire"],
  italic: "Clinic, Beautifully.",
  sub: "Smart scheduling, auto-GST billing, inventory, role-based access and more — one powerful portal built for modern clinics across India.",
  primary: "Book a Demo",
  secondary: "Track Application",
  stats: [
    { n: 1300, suf: "+", l: "Active Clients" },
    { n: 50, suf: "+", l: "Daily Appts" },
    { n: 8, suf: "", l: "Modules" },
    { n: null, lit: "∞", l: "Custom Roles" },
  ],
};

const TICKER = [
  { t: "Appointment Calendar", hi: true },
  { t: "Auto GST Billing" },
  { t: "Employee Management", hi: true },
  { t: "Role-Based Access" },
  { t: "Inventory", hi: true },
  { t: "Feedback" },
  { t: "Reminders", hi: true },
  { t: "Clinic Data Hub" },
];

const SCROLL_CARDS = [
  {
    ico: "📅",
    ttl: "Appointment Calendar",
    dsc: "Smart scheduling with room & doctor allocation.",
    badge: "Core",
    pos: { top: "8%", left: "5%" },
  },
  {
    ico: "🧾",
    ttl: "Auto GST Billing",
    dsc: "CGST + SGST or IGST handled automatically per state.",
    badge: "Finance",
    pos: { top: "6%", right: "6%" },
  },
  {
    ico: "🧩",
    ttl: "Resource Management",
    dsc: "Manage doctors, patients, staff and clinic resources in one unified system.",
    badge: "Core",
    pos: { bottom: "12%", left: "4%" },
  },
  {
    ico: "🔐",
    ttl: "Role-Based Access",
    dsc: "Admin, doctor, receptionist, billing — granular control.",
    badge: "Security",
    pos: { bottom: "8%", right: "5%" },
  },
  {
    ico: "📦",
    ttl: "Inventory",
    dsc: "Live stock counts, low-stock alerts, batch tracking.",
    badge: "Operations",
    pos: { top: "52%", left: "50%" },
  },
  {
    ico: "⭐",
    ttl: "Feedback Management",
    dsc: "Capture patient feedback and escalate low ratings instantly.",
    badge: "Client Care",
    pos: { top: "4%", right: "50%" },
  },
];

function ScrollSection() {
  const containerRef = useRef(null);
  const bigTextRef = useRef(null);
  const cardsRef = useRef([]);

  // reset refs on each render
  cardsRef.current = [];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean);

      // initial state
      gsap.set(cards, {
        opacity: 0,
        y: 100,
        scale: 0.85,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=1000", // shorter
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          // 👇 important
        },
      });

      // TEXT ENTER
      tl.fromTo(
        bigTextRef.current,
        { scale: 0.6, opacity: 0 },
        { scale: 1.1, opacity: 1, duration: 1 },
      );

      // CARDS ENTER
      cards.forEach((card) => {
        tl.to(
          card,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
          },
          "-=0.3",
        );
      });

      // PARALLAX DRIFT
      cards.forEach((card, i) => {
        const depth = (i + 1) * 20;

        tl.to(
          card,
          {
            y: `+=${depth}`,
            x: i % 2 === 0 ? `+=${depth * 0.3}` : `-=${depth * 0.3}`,
            duration: 2,
            ease: "none",
          },
          "<",
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="scroll-container">
      <div className="scroll-sticky">
        <h1 ref={bigTextRef} className="big-words">
          Manage <em>Everything</em>
        </h1>

        <div className="cards-layer">
          {SCROLL_CARDS.map((card, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="float-card"
              style={card.pos}
            >
              <div className="fc-ico">{card.ico}</div>
              <div className="fc-ttl">{card.ttl}</div>
              <div className="fc-dsc">{card.dsc}</div>
              <div className="fc-badge">{card.badge}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    idx: "01",
    ttl: "Appointment Calendar",
    dsc: "Drag-to-reschedule, doctor + room allocation, smart conflict detection.",
    tag: "Core",
  },
  {
    idx: "02",
    ttl: "Employee Management",
    dsc: "Roster, attendance, leaves and salary roll-ups in one workspace.",
    tag: "Core",
  },
  {
    idx: "03",
    ttl: "Clinic Data Hub",
    dsc: "Single source of truth for patients, doctors, services and history.",
    tag: "Core",
  },
  {
    idx: "04",
    ttl: "Billing & Auto-GST",
    dsc: "CGST + SGST same-state, IGST inter-state — calculated automatically.",
    tag: "Finance",
  },
  {
    idx: "05",
    ttl: "Inventory",
    dsc: "Track consumables and retail stock with batch and expiry awareness.",
    tag: "Operations",
  },
  {
    idx: "06",
    ttl: "Feedback Management",
    dsc: "Capture post-visit feedback and route low scores to ownership.",
    tag: "Client Care",
  },
  {
    idx: "07",
    ttl: "To-do & Reminders",
    dsc: "Daily checklists per role and automated patient reminders.",
    tag: "Productivity",
  },
  {
    idx: "08",
    ttl: "Role-Based Access",
    dsc: "Granular permissions for every persona, plus custom roles.",
    tag: "Security",
  },
  {
    idx: "09",
    ttl: "Lead Tracker",
    dsc: "Sync Meta ad leads straight into your front desk pipeline.",
    tag: "Coming Soon",
  },
];

const TESTIMONIAL = {
  quote:
    "Before GloryWellNic, managing 50 appointments a day meant constant juggling between spreadsheets, WhatsApp and memory. Now everything is in one place. It has genuinely transformed how we run Elaria.",
  name: "Akansha Srivastava",
  role: "Founder, Elaria Esthetique · Gurgaon",
  images: [
    {
      src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=82",
      alt: "Calm aesthetic clinic treatment room",
      label: "Treatment Suites",
    },
    {
      src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=82",
      alt: "Aesthetic skincare consultation detail",
      label: "Client Care",
    },
    {
      src: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=82",
      alt: "Premium wellness and skincare setup",
      label: "Wellness Flow",
    },
  ],
  metrics: [
    { n: "1,300+", l: "Clients" },
    { n: "50+", l: "Appts / day" },
    { n: "#1", l: "First Partner" },
    { n: "0", l: "Schedule Conflicts" },
  ],
};

const ROLES = [
  { name: "Admin", pillCls: "rp-a", perms: ["f", "f", "f", "f"] },
  { name: "Doctor", pillCls: "rp-d", perms: ["f", "p", "n", "p"] },
  { name: "Receptionist", pillCls: "rp-r", perms: ["f", "f", "n", "n"] },
  { name: "Billing", pillCls: "rp-b", perms: ["p", "n", "f", "n"] },
  { name: "Custom", pillCls: "rp-c", perms: ["p", "p", "p", "p"] },
];

const PRICING = [
  {
    name: "Essential",
    badge: "Starter",
    aud: "14-day free trial",
    price: "₹0",
    sub: "Up to 3 staff",
    perks: ["Appointment calendar", "Patient records", "Basic billing"],
    cta: "Start Free",
  },
  {
    name: "Growth",
    badge: "Most Popular",
    aud: "Single clinic, all modules",
    price: "₹4,999",
    sub: "per month · unlimited staff",
    perks: [
      "All 8 modules",
      "Auto-GST billing",
      "Role-based access",
      "Priority support",
    ],
    cta: "Book a Demo",
    feat: true,
  },
  {
    name: "Chain",
    badge: "Enterprise",
    aud: "Multi-branch operations",
    price: "Custom",
    sub: "Tailored to your network",
    perks: ["Multi-branch dashboards", "SSO + audit logs", "Dedicated CSM"],
    cta: "Talk to Sales",
  },
];

/* ────────── Decorative components ────────── */

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      className="gw-spb"
      style={{ width: "100%", scaleX, transformOrigin: "0% 50%" }}
      aria-hidden
    />
  );
}

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const target = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (!fine) return;
    let raf;
    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };
    const tick = () => {
      ring.current.x += (target.current.x - ring.current.x) * 0.12;
      ring.current.y += (target.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    document.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="gw-cur-dot" aria-hidden />
      <div ref={ringRef} className="gw-cur-ring" aria-hidden />
    </>
  );
}

function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W = 0,
      H = 0,
      raf;
    const pts = [];

    const reset = (p) => {
      p.x = Math.random() * W;
      p.y = Math.random() * H;
      p.r = Math.random() * 1.2 + 0.3;
      p.vx = (Math.random() - 0.5) * 0.25;
      p.vy = (Math.random() - 0.5) * 0.25;
      p.op = Math.random() * 0.3 + 0.04;
      p.hue = Math.random() > 0.5 ? 270 : 290;
    };
    const rsz = () => {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    };
    rsz();
    for (let i = 0; i < 140; i++) {
      const p = {};
      reset(p);
      pts.push(p);
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) reset(p);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},70%,70%,${p.op})`;
        ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(123,63,242,${0.05 * (1 - d / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", rsz);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", rsz);
    };
  }, []);
  return <canvas ref={ref} className="gw-canvas" aria-hidden />;
}

function WaveBg({ seed = 2 }) {
  const lines = [];
  for (let y = 50; y <= 850; y += 50)
    lines.push({ k: `h${y}`, x1: 0, y1: y, x2: 1440, y2: y });
  for (let x = 80; x <= 1360; x += 80)
    lines.push({ k: `v${x}`, x1: x, y1: 0, x2: x, y2: 900 });
  return (
    <div className="gw-wave-bg" aria-hidden>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={`wf-${seed}`}>
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
          filter={`url(#wf-${seed})`}
          stroke="rgba(155,107,255,1)"
          strokeWidth="1"
          fill="none"
        >
          {lines.map((l) => (
            <line key={l.k} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ────────── Animated counter ────────── */

function StatNumber({ target, suffix = "", literal }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (literal != null || target == null) return;
    if (!inView) return;
    let raf,
      t0 = null;
    const dur = 1800;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, literal]);

  return (
    <span ref={ref} className="gw-stat-n">
      {literal != null ? literal : `${val.toLocaleString("en-IN")}${suffix}`}
    </span>
  );
}

/* ────────── Generic scroll-reveal ────────── */

const sr = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

function Reveal({ children, className, delay = 0, as: Tag = motion.div }) {
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: { opacity: 0, y: 28 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
        },
      }}
    >
      {children}
    </Tag>
  );
}

function Eyebrow({ children }) {
  return (
    <Reveal as={motion.div} className="gw-eyebrow">
      <span className="gw-eyebrow-line" />
      <span className="gw-eyebrow-txt">{children}</span>
    </Reveal>
  );
}

/* ────────── Hero ────────── */

function HeroSection({ onPartnerOpen, onTrackOpen }) {
  return (
    <section className="gw-hero">
      <div className="gw-hero-inner">
        {/* ================= TEXT ================= */}
        <div>
          <div className="gw-hero-tag">{HERO.tag}</div>

          <h1 className="gw-hero-h">
            {HERO.words.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </h1>

          <div className="gw-hero-h2">{HERO.italic}</div>

          <p className="gw-hero-sub">{HERO.sub}</p>

          <div className="gw-hero-btns">
            <button className="gw-btn gw-btn-prim" onClick={onPartnerOpen}>
              {HERO.primary}
            </button>
            <button className="gw-btn gw-btn-ghost" onClick={onTrackOpen}>
              {HERO.secondary}
            </button>
          </div>

          <div className="gw-hero-stats">
            {HERO.stats.map((s, i) => (
              <div key={i}>
                <div className="gw-stat-n">{s.n}</div>
                <div className="gw-stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= MOCKUP ================= */}
        <motion.div
          className="gw-hero-mockup"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="gw-fpill gw-fp1">📅 12 appts today</div>
          <div className="gw-fpill gw-fp2">🧾 GST auto</div>

          <div className="gw-mockup-shell">
            <div className="gw-mock-topbar">
              <span />
              <span />
              <span />
            </div>

            <div className="gw-mock-grid">
              <div className="gw-mock-stat">
                <div className="gw-mock-stat-l">Today</div>
                <div className="gw-mock-stat-n">12</div>
              </div>
              <div className="gw-mock-stat">
                <div className="gw-mock-stat-l">This Week</div>
                <div className="gw-mock-stat-n">68</div>
              </div>
              <div className="gw-mock-stat">
                <div className="gw-mock-stat-l">Revenue</div>
                <div className="gw-mock-stat-n">₹84k</div>
              </div>
            </div>

            <div className="gw-mock-appts">
              <div className="gw-mock-appt-row">
                <div>
                  <b>Aarav Mehta</b>
                  <span> · Botox · Dr. Kapoor</span>
                </div>
                <div className="gw-mock-appt-time">11:00</div>
              </div>

              <div className="gw-mock-appt-row">
                <div>
                  <b>Riya Shah</b>
                  <span> · HydraFacial · Dr. Iyer</span>
                </div>
                <div className="gw-mock-appt-time">12:30</div>
              </div>

              <div className="gw-mock-appt-row">
                <div>
                  <b>Karan Singh</b>
                  <span> · Consult · Dr. Kapoor</span>
                </div>
                <div className="gw-mock-appt-time">14:15</div>
              </div>
            </div>

            <div className="gw-mock-bill">
              <div className="gw-mock-bill-row">
                <span>Service Total</span>
                <span>₹6,000</span>
              </div>
              <div className="gw-mock-bill-row">
                <span>CGST 9%</span>
                <span>₹540</span>
              </div>
              <div className="gw-mock-bill-row">
                <span>SGST 9%</span>
                <span>₹540</span>
              </div>
              <div className="gw-mock-bill-row gw-mock-bill-total">
                <span>Total</span>
                <span>₹7,080</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
/* ────────── Marquee ────────── */

function Marquee() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="gw-mstrip" aria-hidden>
      <div className="gw-mtrack">
        {items.map((it, i) => (
          <span key={i} className={`gw-mi${it.hi ? " hi" : ""}`}>
            {it.t}
            <span className="gw-msep">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ────────── Page ────────── */

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

  // Modal state (preserved from prior implementation)
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

  return (
    <Box id="homepage">
      <ParticleCanvas />
      <ScrollProgressBar />
      <CustomCursor />

      {/* ── Hero ── */}
      <HeroSection
        onPartnerOpen={openPartnerModal}
        onTrackOpen={openTrackModal}
      />

      {/* ── Marquee ── */}
      <Marquee />

      {/* ── Signature scroll-text + cards ── */}
      <ScrollSection />

      {/* ── Features ── */}
      <section id="gw-features" className="gw-section">
        <div className="gw-inner">
          <div className="gw-feat-head">
            <div>
              <Eyebrow>What's Inside</Eyebrow>
              <Reveal as={motion.h2} className="gw-sec-title">
                Eight pillars of <em>everyday operations.</em>
              </Reveal>
            </div>
            <Reveal as={motion.p} className="gw-sec-sub" delay={0.1}>
              Each module is built around the realities of an Medical clinic —
              GST, multi-doctor schedules, walk-ins and inventory that moves
              daily.
            </Reveal>
          </div>

          <motion.div
            className="gw-feat-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {FEATURES.map((f) => (
              <motion.article
                key={f.idx}
                className="gw-fg-card"
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <div className="gw-fg-num">{f.idx}</div>
                <h3 className="gw-fg-ttl">{f.ttl}</h3>
                <p className="gw-fg-dsc">{f.dsc}</p>
                <span className="gw-fg-tag">{f.tag}</span>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Lead Tracker (Coming Soon) ── */}
      <section id="gw-lead" className="gw-section">
        <div className="gw-lead-orb" />
        <div className="gw-inner">
          <div className="gw-lead-inner">
            <div>
              <Reveal as={motion.div} className="gw-soon-badge">
                <span className="gw-soon-dot" />
                Coming Soon — Join Waitlist
              </Reveal>
              <Reveal as={motion.h2} className="gw-sec-title">
                Your Meta ads, <em>finally connected.</em>
              </Reveal>
              <Reveal as={motion.p} className="gw-sec-sub">
                Pull Instagram and Facebook lead-ad submissions straight into
                your front desk pipeline. Assign owners, track follow-ups and
                convert in one place — no more spreadsheets.
              </Reveal>
              <Reveal as={motion.div}>
                <button
                  type="button"
                  className="gw-btn gw-btn-prim gw-btn-lg"
                  onClick={openPartnerModal}
                >
                  Join Waitlist
                </button>
              </Reveal>
            </div>

            <Reveal as={motion.div} className="gw-lead-ui">
              <div className="gw-lead-ui-row">
                <span className="gw-lead-ui-ico">📸</span>
                <div>
                  <div className="gw-lead-ui-ttl">Instagram Ads</div>
                  <div className="gw-lead-ui-sub">
                    Sync lead form submissions in real-time
                  </div>
                </div>
                <span className="gw-lead-ui-cta">Soon</span>
              </div>
              <div className="gw-lead-ui-row">
                <span className="gw-lead-ui-ico">👤</span>
                <div>
                  <div className="gw-lead-ui-ttl">Facebook Ads</div>
                  <div className="gw-lead-ui-sub">
                    Auto-assign to receptionists by branch
                  </div>
                </div>
                <span className="gw-lead-ui-cta">Soon</span>
              </div>
              <div className="gw-lead-ui-row">
                <span className="gw-lead-ui-ico">📊</span>
                <div>
                  <div className="gw-lead-ui-ttl">Conversion Funnel</div>
                  <div className="gw-lead-ui-sub">
                    Lead → Consult → Treatment, by source
                  </div>
                </div>
                <span className="gw-lead-ui-cta">Soon</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section id="gw-testi" className="gw-section">
        <div className="gw-testi-glow" />
        <div className="gw-inner">
          <div className="gw-testi-inner">
            <div>
              <Eyebrow>Trusted By</Eyebrow>
              <Reveal as={motion.blockquote} className="gw-bigquote">
                {TESTIMONIAL.quote}
              </Reveal>
              <Reveal as={motion.div} className="gw-quote-author" delay={0.1}>
                <div className="gw-quote-author-n">{TESTIMONIAL.name}</div>
                <div className="gw-quote-author-r">{TESTIMONIAL.role}</div>
              </Reveal>
            </div>

            <div className="gw-testi-proof">
              <motion.div
                className="gw-elaria-gallery"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.1 } },
                }}
              >
                {TESTIMONIAL.images.map((img, index) => (
                  <motion.figure
                    key={img.src}
                    className={`gw-elaria-img gw-elaria-img--${index + 1}`}
                    variants={{
                      hidden: { opacity: 0, y: 24, scale: 0.96 },
                      show: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          duration: 0.7,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                    }}
                  >
                    <img src={img.src} alt={img.alt} loading="lazy" />
                    <figcaption>{img.label}</figcaption>
                  </motion.figure>
                ))}
              </motion.div>

              <motion.div
                className="gw-tmetrics"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.08 } },
                }}
              >
                {TESTIMONIAL.metrics.map((mt) => (
                  <motion.div
                    key={mt.l}
                    className="gw-tmet"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.6,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                    }}
                  >
                    <div className="gw-tm-n">{mt.n}</div>
                    <div className="gw-tm-l">{mt.l}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="gw-roles" className="gw-section">
        <div className="gw-inner">
          <div className="gw-roles-inner">
            <div>
              <Eyebrow>Role-Based Access</Eyebrow>
              <Reveal as={motion.h2} className="gw-sec-title">
                Right access for <em>every persona.</em>
              </Reveal>
              <Reveal as={motion.p} className="gw-sec-sub">
                Pre-built roles for admin, doctor, receptionist and billing —
                plus custom roles when your clinic doesn't fit the mould.
              </Reveal>
            </div>

            <motion.div
              className="gw-rlist"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
              }}
            >
              {ROLES.map((r) => (
                <motion.div
                  key={r.name}
                  className="gw-rrow"
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    show: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  <span className={`gw-rpill ${r.pillCls}`}>{r.name}</span>
                  <span className="gw-rrow-name">
                    {r.name === "Custom"
                      ? "Build your own"
                      : `Pre-configured for ${r.name.toLowerCase()}s`}
                  </span>
                  <span className="gw-rrow-perm">
                    {r.perms.map((p, i) => (
                      <span key={i} className={`gw-dp dp-${p}`} />
                    ))}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="gw-pricing" className="gw-section">
        <div className="gw-pricing-glow" />
        <div className="gw-inner" style={{ textAlign: "center" }}>
          <Eyebrow>Pricing</Eyebrow>
          <Reveal as={motion.h2} className="gw-sec-title">
            Simple plans, <em>no surprises.</em>
          </Reveal>
          <Reveal as={motion.p} className="gw-sec-sub" delay={0.1}>
            Start with a 14-day trial. Upgrade when you're ready, scale across
            branches when you grow.
          </Reveal>

          <motion.div
            className="gw-pc-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
            style={{ textAlign: "left" }}
          >
            {PRICING.map((p) => (
              <motion.div
                key={p.name}
                className={`gw-pc${p.feat ? " gw-pc-feat" : ""}`}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <span className="gw-pc-badge">{p.badge}</span>
                <h3 className="gw-pc-name">{p.name}</h3>
                <p className="gw-pc-aud">{p.aud}</p>
                <div className="gw-pc-price">{p.price}</div>
                <div className="gw-pc-price-sub">{p.sub}</div>
                <ul className="gw-pc-list">
                  {p.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="gw-btn-pc"
                  onClick={openPartnerModal}
                >
                  {p.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="gw-footer">
        <div className="gw-footer-inner">
          <RouterLink to="/" className="gw-nav-logo">
            Glory<span>Well</span>Nic
          </RouterLink>
          <div className="gw-footer-links">
            <a href="#gw-features">Features</a>
            <a href="#gw-lead">Upcoming</a>
            <a href="#gw-testi">Clients</a>
            <a href="#gw-pricing">Pricing</a>
            <RouterLink to="/login">Sign In</RouterLink>
            <button type="button" onClick={openPartnerModal}>
              Book Demo
            </button>
          </div>
          <div className="gw-footer-copy">
            © {new Date().getFullYear()} GloryWellNic
          </div>
        </div>
      </footer>

      {/* ── Partner application modal (logic preserved) ── */}
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
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
          >
            <Paper elevation={0} className="gwl-modal-paper">
              <Box className="gwl-modal-head">
                <Box sx={{ minWidth: 0 }}>
                  <h2
                    id="modal-new-application-title"
                    className="gwl-modal-title"
                  >
                    Become a Partner Clinic
                  </h2>
                  <p className="gwl-modal-sub">
                    Tell us a bit about your clinic and we'll set you up.
                  </p>
                </Box>
                <IconButton
                  onClick={() => {
                    setOpenNewForm(false);
                    resetNewApplicationModal();
                  }}
                  aria-label="Close dialog"
                  size="small"
                  className="gwl-modal-close"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box className="gwl-modal-body">
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
                    className="gwl-field"
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
                        className="gwl-field"
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
                        className="gwl-field"
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
                        className="gwl-field"
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
                    onChange={(e) =>
                      setApplicationForm((f) => ({
                        ...f,
                        address: e.target.value,
                      }))
                    }
                    className="gwl-field"
                  />
                  <FormControl
                    fullWidth
                    required
                    size="small"
                    className="gwl-field"
                  >
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
                    {submittingApplication
                      ? "Submitting…"
                      : "Submit application"}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Modal>

      {/* ── Track application modal (logic preserved) ── */}
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
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
          >
            <Paper elevation={0} className="gwl-modal-paper">
              <Box className="gwl-modal-head">
                <Box sx={{ minWidth: 0 }}>
                  <h2 id="modal-track-title" className="gwl-modal-title">
                    Track Your Application
                  </h2>
                  <p className="gwl-modal-sub">
                    Enter your mobile and tracking ID to see status.
                  </p>
                </Box>
                <IconButton
                  onClick={() => {
                    setOpenTrackForm(false);
                    setTrackingMobile("");
                    setTrackingId("");
                    setErrorTrackApplication("");
                    setSuccessTrackApplication("");
                  }}
                  aria-label="Close dialog"
                  size="small"
                  className="gwl-modal-close"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box className="gwl-modal-body">
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
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Modal>
    </Box>
  );
};

export default HomePage;
