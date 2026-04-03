/**
 * Static copy, image URLs, and structured data for the public landing (HomePage).
 * Icons are imported here so the page file stays focused on layout and behavior.
 */
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

export const BRAND = {
  deep: "#4A70A9",
  main: "#8FABD4",
  light: "#C4D4EF",
  muted: "#DAD6CC",
  surface: "#EFECE3",
};

/** Unsplash URLs — use `referrerPolicy="no-referrer"` on <img> where needed */
export const LANDING_IMAGES = {
  hero:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&q=85&fm=jpg",
  team:
    "https://images.unsplash.com/photo-1516549655169-df83a0774519?w=1600&q=85&fm=jpg",
  reception:
    "https://images.unsplash.com/photo-1586773860418-d372422d8fce?w=1600&q=85&fm=jpg",
  dashboard:
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&q=85&fm=jpg",
};

/** Quick snapshot of core modules every role can touch (within their permissions) */
export const LANDING_STATS = [
  { value: "Doctors", label: "Clinical roster & capacity", Icon: LocalHospitalOutlinedIcon },
  { value: "Staff", label: "Roles that match reality", Icon: ManageAccountsOutlinedIcon },
  { value: "Services", label: "Catalog your care", Icon: DesignServicesOutlinedIcon },
  { value: "Bookings", label: "Live appointment fabric", Icon: CalendarMonthOutlinedIcon },
  { value: "Reminders", label: "Timely, automated nudges", Icon: NotificationsActiveOutlinedIcon },
  { value: "Billing", label: "Revenue without rework", Icon: ReceiptLongOutlinedIcon },
];

/** Infinite strip — credibility signals (render twice in UI for seamless loop) */
export const TRUST_MARQUEE_ITEMS = [
  "Organization-scoped data",
  "Tabs & permissions per role",
  "From booking to invoice",
  "Built for clinics & diagnostics",
  "Partner onboarding & review",
  "One backbone, six workflows",
];

export const TESTIMONIALS = [
  {
    quote:
      "Elaria Esthetique finally feels like one studio—not a patchwork of apps. Appointments, client flow, and follow-ups live in a single rhythm. GloryWellnic is the layer we trust to keep that experience elevated.",
    name: "Akansha Srivastava",
    role: "Owner, Elaria Esthetique",
    avatar:
      "https://ui-avatars.com/api/?name=Akansha+Srivastava&size=200&background=8FABD4&color=fff&bold=true",
  },
];

export const FAQ_ITEMS = [
  {
    kicker: "Partnership 101",
    q: "Who can apply as a partner organization?",
    a: "Registered clinics, diagnostic centers, and healthcare groups that need structured staff access, appointments, and billing can submit an application. Our team reviews each request before activation.",
  },
  {
    kicker: "Timeline",
    q: "How long does approval take?",
    a: "Timing depends on verification of your details. You can track status anytime with the mobile number and tracking ID from your submission confirmation.",
  },
  {
    kicker: "Privacy & data",
    q: "Is my data isolated from other organizations?",
    a: "The platform is built for multi-tenant use with organization-scoped access so your team only sees what they are permitted to manage.",
  },
  {
    kicker: "After you’re in",
    q: "What happens after I receive credentials?",
    a: "You sign in as an admin, select your organization, and configure users, roles, and services according to your operational needs.",
  },
];

export const FAQ_ACCENT_STOPS = [
  ["#8FABD4", "#C4D4EF"],
  ["#C4D4EF", "#DAD6CC"],
  ["#4A70A9", "#8FABD4"],
  ["#8FABD4", "#DAD6CC"],
];

export const PARTNER_STEPS = [
  {
    step: 1,
    Icon: AssignmentTurnedInIcon,
    title: "Submit your application",
    desc: "Tell us who you are, where you operate, and how your team runs day to day.",
    accent: BRAND.main,
  },
  {
    step: 2,
    Icon: VerifiedUserIcon,
    title: "Verification & approval",
    desc: "Our super-admin team validates your details and activates your organization with care.",
    accent: BRAND.light,
  },
  {
    step: 3,
    Icon: MailOutlineIcon,
    title: "Credentials in your inbox",
    desc: "Admins receive secure sign-in details instantly—your clinic can start configuring the same day.",
    accent: BRAND.muted,
  },
];

/** Full capability list — this is what the product homepage is built around */
export const FEATURES = [
  {
    Icon: LocalHospitalOutlinedIcon,
    title: "Doctors",
    desc: "Elevate every clinician with rich profiles, clear availability, and a roster your schedulers actually trust—not a spreadsheet ghost town.",
    accent: BRAND.main,
  },
  {
    Icon: ManageAccountsOutlinedIcon,
    title: "Employees & access",
    desc: "Onboard people in minutes. Roles unlock the right tabs instantly so reception never sees finance—and nobody fights the wrong dashboard.",
    accent: BRAND.light,
  },
  {
    Icon: DesignServicesOutlinedIcon,
    title: "Services",
    desc: "Define what you sell once. Services flow through booking, reminders, and billing so your front desk and your ledger always agree.",
    accent: BRAND.muted,
  },
  {
    Icon: EventAvailableIcon,
    title: "Appointments",
    desc: "A calendar that behaves like your clinic: slots, resources, and doctors in sync—see the day, move it, own it.",
    accent: BRAND.deep,
  },
  {
    Icon: NotificationsActiveOutlinedIcon,
    title: "Reminders",
    desc: "Gentle, reliable nudges for patients and staff—timed so no-shows shrink and your team stops playing phone tag.",
    accent: BRAND.main,
  },
  {
    Icon: ReceiptLongOutlinedIcon,
    title: "Invoices & billing",
    desc: "Issue invoices where the visit already lives. Context stays attached so collections feel intentional, not archaeological.",
    accent: BRAND.light,
  },
];

/** Premium “why us” bento — icons + copy for flagship section */
export const PREMIUM_BENTO = [
  {
    key: "unified",
    Icon: HubOutlinedIcon,
    title: "One operating layer",
    body: "Doctors, staff, services, calendar, reminders, and billing share one backbone. Handoffs stay clean because the data never fragments.",
    accent: BRAND.main,
    large: true,
  },
  {
    key: "roles",
    Icon: GroupsOutlinedIcon,
    title: "Designed for how people work",
    body: "Each role opens a focused workspace. Permissions follow responsibility—so power users move fast and everyone else stays safe.",
    accent: BRAND.light,
    large: false,
  },
  {
    key: "velocity",
    Icon: BoltOutlinedIcon,
    title: "Velocity without chaos",
    body: "Fewer tools to juggle means faster check-ins, tighter days, and a front desk that breathes again.",
    accent: BRAND.muted,
    large: false,
  },
  {
    key: "trust",
    Icon: VerifiedUserOutlinedIcon,
    title: "Governance you can stand behind",
    body: "Organization-scoped access, super-admin separation, and audit-friendly flows—built for teams who take compliance seriously.",
    accent: BRAND.deep,
    large: false,
  },
];

export const HERO_GLANCE_LINES = [
  "Clinical roster + staff directory—unified",
  "Service catalog wired to the calendar",
  "Live bookings, zero spreadsheet drift",
  "Reminders that fire when it matters",
  "Invoices anchored to real visits",
  "Role-perfect tabs, one source of truth",
];

/** FAQ section UI strings (Gen-Z block) */
export const FAQ_SECTION_UI = {
  chipLabel: "Straight talk",
  overline: "Questions worth asking",
  titleLead: "Answers that",
  titleAccent: "respect your time.",
  subtitle:
    "Tap to expand. No sales poetry—just how onboarding, data isolation, and day-one access actually work.",
  footerPrompt:
    "Ready when you are: start a partner application or check an existing request in seconds.",
  startApplication: "Start application",
  trackStatus: "Track status",
};

/** Hero + section headings and body copy */
export const LANDING_COPY = {
  hero: {
    chipLabel: "The clinic operating system",
    titleLead: "Run care, people, and revenue in ",
    titleAccent: "one breathtaking flow.",
    subtitle:
      "GloryWellnic is where high-performing clinics orchestrate doctors, staff, services, the calendar, reminders, and billing—each role sees exactly what matters, with context that never breaks between the front desk and finance.",
    primaryCta: "Request partner access",
    secondaryCta: "Track my application",
    heroImageAlt: "Healthcare professionals collaborating in a clinical setting",
    scrollCue: "Discover what’s inside",
  },
  glance: {
    title: "Inside your workspace",
  },
  storyPrimary: {
    teamImageAlt: "Clinical team at work",
    overline: "Operational excellence",
    title: "The six rhythms of a modern clinic—mastered in one place",
    body1:
      "Reception, admin, clinical leads, and owners deserve software that mirrors how they actually move through the day. Rosters, services, the live calendar, reminders, and invoices sit together—no duct tape between tools.",
    body2:
      "After approval, you define roles once. Every sign-in inherits the right tabs and permissions, so the thread from first booking to final payment stays intact without micromanagement.",
    cta: "Begin partner onboarding",
  },
  partnership: {
    overline: "Go live with confidence",
    title: "Three deliberate steps from application to first login",
    subtitle:
      "Submit your organization, pass verification, receive credentials—then switch on doctors, staff, services, scheduling, reminders, and billing for your entire team.",
  },
  storyReverse: {
    receptionImageAlt: "Modern clinic reception",
    overline: "Precision access",
    title: "The right screen for every seat at the table",
    body:
      "One platform: manage doctors and employees, curate services, run appointments, automate reminders, and close the loop with invoices. Permissions follow the job—focused UX up front, unified data underneath.",
    bullets: [
      "Roster + directory with role-aware views",
      "Services synchronized with bookings",
      "Calendar intelligence + reminder automation",
      "Invoicing grounded in real encounters",
    ],
    signInCta: "Member sign in",
  },
  premium: {
    overline: "Why clinics upgrade",
    title: "Built for operators who refuse fragmented software",
    subtitle:
      "Every highlight below is reflected in how GloryWellnic ships: fewer seams, clearer accountability, and a product your team wants to open every morning.",
  },
  features: {
    overline: "Capability map",
    title: "Everything your organization can run",
    subtitle:
      "Six modules. One narrative. Each surface respects the role you assign—so power stays where it belongs and workflows feel inevitable.",
  },
  accountability: {
    imageAlt: "Healthcare technology and data on a screen",
    title: "Handoffs your team can trust",
    body:
      "When appointments, clients, reminders, and revenue ride the same rails, nothing gets “lost in translation” between the desk, the clinician, and finance.",
    calloutTitle: "Security & isolation, by design",
    calloutBody:
      "Per-organization sign-in, separated super-admin flows, and tab-level permissions mean people see only what they should—without slowing operators down.",
  },
  testimonials: {
    overline: "Proof, not promises",
    title: "Our first partner on GloryWellnic",
    subtitle:
      "Elaria Esthetique, led by owner Akansha Srivastava—we’re proud to serve this studio today and to grow carefully from here.",
  },
  ctaBand: {
    title: "Ready for software that matches your ambition?",
    subtitle:
      "Partner with GloryWellnic and give your team a single, premium workspace for doctors, staff, services, appointments, reminders, and invoices—without sacrificing governance.",
    primaryCta: "Start partner application",
    secondaryCta: "Check application status",
  },
  footer: {
    home: "Home",
    signIn: "Sign in",
    tagline:
      "Clinic operations in one deliberate workspace—doctors, staff, services, appointments, reminders, and billing.",
    rights: "All rights reserved.",
  },
};

export const LANDING_MODALS = {
  partner: {
    title: "Partner with GloryWellnic",
    subtitle:
      "Share a few details about your organization. Our team reviews every request with care.",
  },
  track: {
    title: "Application status",
    subtitle:
      "Enter the mobile number and tracking ID from your confirmation message.",
  },
};
