# Glory WellNic — Clinic Management Portal

> A warm, Apple-inspired operating system for the modern clinic. One workspace for appointments, doctors, inventory, employees, billing, and AI-powered growth.

---

## 1 · Product overview

**Glory WellNic** is a multi-tenant SaaS for clinics. A clinic owner signs up their enterprise, invites their team, and gets a single workspace for:

- **Front-desk** — appointments, booking, patient records
- **Clinical** — doctors, rooms, schedules
- **Operations** — inventory, employees, payroll
- **Finance** — quotations, invoices, receipts, taxes
- **Growth** — Meta Lead Ads → booked appointments
- **Alerts** — smart notifications (low stock, overdue invoice, leave)
- **AI co-pilot** — natural-language commands across the clinic

Primary users: clinic owner/admin, front desk, doctor, billing, inventory manager, marketing lead, patient (self-service portal).

Device targets: **desktop-first** (1440 wide) with responsive down to tablet/mobile.

---

## 2 · Design principles

1. **Calm over clever.** Negative space is a feature. One focus per screen.
2. **Warm, not clinical.** Soft off-whites, terracotta accent, serif headlines.
3. **Editorial type.** Instrument Serif for display; Inter for UI; JetBrains Mono for IDs and numbers.
4. **Motion with purpose.** Rise, fade, float, pulse — never spin or bounce.
5. **AI is ambient.** The co-pilot is present on every screen but never shouts.
6. **Airy density.** Avoid data-slop; show fewer, more meaningful numbers.
7. **No emoji. No gradient walls. No stock icons for medical symbols** — placeholders with explicit text are better than fake.

---

## 3 · Design tokens

### 3.1 Color (oklch)

| Token           | Value                   | Use                              |
| --------------- | ----------------------- | -------------------------------- |
| `--bg`          | `oklch(0.985 0.005 80)` | Paper background                 |
| `--bg-2`        | `oklch(0.965 0.008 80)` | Surface (sidebar, subtle cards)  |
| `--bg-3`        | `oklch(0.945 0.010 80)` | Hover surface                    |
| `--ink`         | `oklch(0.22 0.015 60)`  | Primary text + buttons           |
| `--ink-2`       | `oklch(0.42 0.012 60)`  | Secondary text                   |
| `--ink-3`       | `oklch(0.62 0.010 60)`  | Tertiary text, placeholders      |
| `--line`        | `oklch(0.90 0.008 80)`  | Hairlines, dividers              |
| `--line-2`      | `oklch(0.86 0.008 80)`  | Stronger hairlines               |
| `--accent`      | `oklch(0.68 0.15 48)`   | Terracotta — single brand accent |
| `--accent-soft` | `oklch(0.94 0.04 55)`   | Accent tint (chips, AI surfaces) |
| `--success`     | `oklch(0.68 0.12 145)`  | Confirmations, "In stock"        |
| `--warning`     | `oklch(0.78 0.13 75)`   | Low stock, probation             |
| `--danger`      | `oklch(0.62 0.18 25)`   | Overdue, out of stock            |

All whites stay below **chroma 0.02**. All accents share chroma/lightness — only hue varies.

### 3.2 Typography

```
Display  — Instrument Serif (italic variants for emphasis)
UI       — Inter 400/500/600
Mono     — JetBrains Mono (IDs, invoice numbers, timestamps)
```

Scale (desktop):

| Role              | Size                       | Weight      | Tracking |
| ----------------- | -------------------------- | ----------- | -------- |
| Hero display      | 96–180px                   | 400         | -0.025em |
| H1 page title     | 32–40px                    | 400 (serif) | -0.02em  |
| H2 section        | 22–28px                    | 400/500     | -0.02em  |
| Body              | 14px                       | 400         | -0.005em |
| Small             | 12–13px                    | 400         | 0        |
| Caption / eyebrow | 11–12px, uppercase, 0.08em | 400         | —        |

**Rule:** minimum 12px for print, 13px for UI, 24px for slides.

### 3.3 Radii, shadows, spacing

```
--r-1: 6px    --r-2: 10px    --r-3: 14px    --r-4: 20px    --r-pill: 999px

--shadow-1: 0 1px 2px / 0.04          /* hairline lift */
--shadow-2: 0 4px 16px / 0.06         /* hover card */
--shadow-3: 0 12px 36px / 0.08        /* elevated modal / floating card */

--s-1:4  --s-2:8  --s-3:12  --s-4:16  --s-5:24  --s-6:32  --s-7:48  --s-8:64
```

### 3.4 Motion

| Name         | Use               | Spec                                                                      |
| ------------ | ----------------- | ------------------------------------------------------------------------- |
| `gw-rise`    | Content enter     | `translateY(8px) → 0`, `opacity 0 → 1`, 700ms, `cubic-bezier(.2,.7,.3,1)` |
| `gw-fade`    | Reveals           | opacity 0→1, 400ms                                                        |
| `gw-float`   | Floating cards    | 6px loop, 4.5–6s ease-in-out                                              |
| `gw-pulse`   | Live indicator    | opacity 1↔0.4, 1.5s                                                       |
| `gw-bar`     | Bar charts        | scaleY 0→1, staggered 40ms                                                |
| `gw-marquee` | Logo / word strip | translateX 30s linear                                                     |

Stagger entry animations with `--rise-d{1-6}` (80ms increments).

---

## 4 · Components

### Buttons

- **Primary** — ink fill, paper text, pill radius. Hover: slight lift + shadow.
- **Accent** — terracotta fill. Used for CTAs tied to growth/AI.
- **Outline** — transparent, 1px line. For secondary actions.
- **Ghost** — transparent, hover tint. For tertiary/nav actions.
- Sizes: sm (32h), default (40h), lg (48h).

### Inputs

44px tall, 1px inset line, 10px radius. Focus = 1.5px ink line, no blue glow.

### Card

`--bg` surface, 14px radius, 1px inset line. Hover variant lifts 2px + shadow-2.

### Chip / Pill

24px tall, 10px radius, 12px text. Variants: default, accent, success, warn, ink.

### Avatar

Circle, initials or image. Tone palettes (warm/sage/sky/rose/ink) — never bright.

### Sidebar

240px wide (72px compact). Logo top, nav items, AI assistant card at bottom, footer with notifications + settings. Active item: `--bg` surface with inset line + accent-tinted icon.

### Topbar

Subtitle eyebrow + large serif page title. Optional tabs below. Action buttons right-aligned.

---

## 5 · Screens

### 5.1 Marketing landing

Three directions; pick one to commit.

**A · Editorial calm** _(recommended)_

- Transparent blurred nav on paper background
- Hero: 96px serif headline with italic accent word
- Radial gradient wash in accent-soft
- Product shot on elevated rounded card
- Logo strip · feature grid (3×2) · dark quote section · CTA

**B · Split product-forward**

- 50/50 split: message left, live product right
- Floating cards over gradient canvas: AI command · monthly revenue · low-inventory alert
- Thin 4-column metrics strip at bottom

**C · Bold statement (dark)**

- Ink background, 180px serif headline
- Word marquee ("Appointments · AI triage · Billing · …")
- Three numbered story cards
- Live ticker footer

### 5.2 Sign up (enterprise onboarding)

4-step wizard on split canvas.

```
01 Clinic   → name, legal, GSTIN, address
02 Team     → invite teammates by email + role (current step shown)
03 Plan     → starter / growth / enterprise
04 Go live  → confirmation, first appointment created
```

- Left: accent-soft gradient canvas with step indicator (checkmarks for done, accent dot for active).
- Right: form card with 440px max width.

### 5.3 Sign in

Centered 400px card on radial accent-soft wash. Continue-with-Google first, divider, email + password, remember + forgot, primary sign-in button.

### 5.4 Dashboard

```
┌─ Sidebar ──┬─ Topbar ─────────────────────────────────┐
│            │  "Good morning, Arjun"                    │
│            │  [search] [bell] [+ New appt] [avatar]    │
│            ├───────────────────────────────────────────┤
│            │  AI assistant strip                       │
│            │  [4× stat cards with sparklines]          │
│            │  ┌─ Today's rounds ───┬─ Revenue ────┐   │
│            │  │ time · patient ·    │ bar chart    │   │
│            │  │ doctor · status     ├──────────────┤   │
│            │  │                      │ Needs        │   │
│            │  │                      │ attention    │   │
│            └──┴──────────────────────┴──────────────┘
```

### 5.5 Doctors

Grid of doctor cards: avatar, name, specialty + experience, status chip, rating, patients/mo, next slot. Tabs for All / In clinic / On leave / New. Search + specialization + availability filters. Grid/List toggle.

### 5.6 Employees

Three summary cards (payroll, attendance viz, on-leave stack). Table: employee · role · dept · joined · salary · status.

### 5.7 Inventory

Four KPI cards (total SKUs, low, out, expiring). Table with name, category, SKU (mono), stock with threshold bar, expiry, status chip (In stock / Low / Out / Expiring soon). "Scan barcode" CTA.

### 5.8 Billing

Tabs: Invoices (default) · Quotations · Receipts · Taxes.
Hero summary card (dark ink) with collected / outstanding / overdue breakdown. Three side stat cards. Invoice table: id (mono) · patient · issued · due · amount (tnum right-aligned) · status.

### 5.9 Settings

Two-column layout. Left nav: Clinic Profile · Team & Roles · Billing & Plan · Notifications · Integrations · AI Assistant (new) · Security · Data & Export.
Right: branding card with logo tile, clinic details form (2-col), preferences with iOS-style toggles.

---

## 6 · Patterns

### Status chips

| Status                     | Background   | Text        |
| -------------------------- | ------------ | ----------- |
| Paid / In stock / Active   | success tint | success ink |
| Sent / Scheduled           | accent tint  | accent ink  |
| Draft                      | bg-2         | ink-3       |
| Overdue / Out              | danger tint  | danger      |
| Low / Probation / Expiring | warning tint | warning ink |

### AI surfaces

Every AI touchpoint uses `--accent-soft` background or accent-tinted icon. Copy uses natural language in quotes: _"Reschedule Dr. Kapoor's afternoon…"_.

### Numbers

All monetary and tabular numbers use `font-variant-numeric: tabular-nums`. Currency shown with `₹ ` prefix and a space. Large amounts use Indian abbreviation (L, Cr).

### Empty states

Never show cartoon illustrations. Use a short serif headline, one line of body copy, one primary action.

---

## 7 · File structure

```
Glory WellNic.html              — canvas entry
styles/tokens.css               — all design tokens
components/shared.jsx           — Logo, Icon, Avatar, Sidebar, Topbar, StatCard, Sparkline, Grain, Screen
screens/
  landing-a.jsx                 — editorial calm
  landing-b.jsx                 — split product-forward
  landing-c.jsx                 — bold statement
  auth.jsx                      — SignUp + Login
  dashboard.jsx                 — home
  doctors.jsx
  inventory.jsx
  employees.jsx
  billing.jsx
  settings.jsx
design-canvas.jsx               — pan/zoom canvas wrapper
```

All component files export to `window` so each Babel script can reach them.

---

## 8 · Next screens to build

- **Appointments** — week/day calendar, booking drawer, no-show predictions
- **Rooms** — floor map + occupancy timeline
- **Billing detail** — quotation builder, invoice editor, receipt view
- **Notifications center** — categorized feed with mark-all-read
- **Leads (Meta)** — ad-spend → patient attribution funnel
- **Patient portal** — self-service booking, records, invoices
- **Reports** — doctor retention, revenue by specialty, inventory turnover

---

## 9 · Accessibility checklist

- All interactive targets ≥ 44px (mobile), ≥ 32px (desktop dense)
- Color contrast: ink on paper = 12:1; ink-2 on paper = 6:1; ink-3 on paper = 3.5:1 (non-text only)
- Never convey state with color alone — always pair with icon or label
- Focus ring: 1.5px `--ink` inset on inputs; 2px outer offset on buttons
- All chips include a `•` dot for redundant encoding

---

## 10 · Do / Don't

✅ **Do**

- Use the italic serif for one emphasized word per headline
- Keep one CTA primary per screen
- Use tabular numerics for every number in a list or table
- Let cards breathe — 20–28px padding minimum

❌ **Don't**

- Stack multiple gradients or add aurora backgrounds
- Invent new icons — use the 30-glyph set in `Icon` only
- Use saturated color fills on large surfaces (keep accent small)
- Fake medical imagery with SVG — use subtle-striped placeholders with monospace labels

---

_Glory WellNic v1 · April 2026 · warm, calm, intelligent._
