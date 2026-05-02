# CLAUDE.md — GloryWellNic Landing Page

> Hand this file to Claude Code. It contains every design decision, animation spec, component pattern, and implementation detail needed to build the GloryWellNic landing page exactly as designed.

---

## 1. Project Overview

**Product:** GloryWellNic — an all-in-one clinic management portal for Indian clinics  
**Page type:** Marketing landing page (two audiences: new clinics discovering the product + existing clinics signing in)  
**Visual reference:** Superconscious.app / luxury SaaS dark-mode aesthetic — deep purple gradient mesh, massive scroll-driven typography, glassmorphism cards  
**Stack:** Plain HTML + CSS + vanilla JS. No framework required. GSAP for all animations.

---

## 2. Design Language

### 2.1 Mood
- Dark, premium, futuristic but calm
- Purple/violet as the brand color — not aggressive, feels clinical and trustworthy
- Mixed typography: heavy sans-serif headlines + italic serif for elegance (same line)
- Everything feels like it's floating in space — glows, blurs, glass

### 2.2 Color Tokens

```css
:root {
  /* Backgrounds */
  --bg:   #06040D;   /* deepest — hero, lead, roles sections */
  --bg2:  #0D0820;   /* slightly lighter — features, testi, pricing */

  /* Purple palette */
  --p1:   #7B3FF2;   /* deep purple — gradients, glows */
  --p2:   #5B2BE0;   /* darker purple — secondary glows */
  --p3:   #9B6BFF;   /* mid purple — borders, accents, cursor */
  --p4:   #C4A8FF;   /* light lavender — highlight text, italic headings */
  --acc:  #A855F7;   /* accent purple */
  --glow: rgba(123,63,242,0.4); /* box-shadow glow color */

  /* Text */
  --txt:  #F0EAFF;                   /* primary text */
  --txt2: rgba(240,234,255,0.55);    /* secondary/body text */
  --txt3: rgba(240,234,255,0.30);    /* muted/label text */

  /* Cards */
  --card:  rgba(255,255,255,0.04);   /* glass card bg */
  --cardb: rgba(255,255,255,0.08);   /* glass card border */
}
```

### 2.3 Typography

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@200;300;400;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,300;1,400;1,700&display=swap');

--fs: 'Sora', sans-serif;           /* ALL body, UI, nav, labels */
--fd: 'Playfair Display', Georgia, serif;  /* Display italic moments only */
```

**Typographic rules:**
- Hero H1: `Sora 800`, `clamp(4rem, 9vw, 9.5rem)`, `letter-spacing: -0.03em`, `line-height: 0.95`
- Hero H2 (italic line): `Playfair Display 300 italic`, `clamp(3rem, 7vw, 7.5rem)`, color `var(--p4)`
- Section titles: `Playfair Display 400`, `clamp(2.8rem, 4.5vw, 4.8rem)`
- Section titles italic word: `font-style: italic`, color `var(--p4)`
- Body text: `Sora 300`, `0.88rem–0.95rem`, `line-height: 1.85`
- Labels/eyebrows: `Sora 400`, `0.60–0.72rem`, `letter-spacing: 0.18–0.22em`, `text-transform: uppercase`
- Numbers/stats: `Playfair Display 300`, large sizes

### 2.4 Spacing System
- Section padding: `140px 6vw` (top/bottom, left/right)
- Inner max-width: `1320px`, centered
- Grid gaps: `100px` for two-column layouts, `1px` background trick for feature grids
- Cards: `border-radius: 18–24px` for large cards, `50px` for pills/buttons

---

## 3. Dependencies

```html
<!-- In <head> -->
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@200;300;400;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
```

Always call `gsap.registerPlugin(ScrollTrigger)` before any scroll animations.

---

## 4. Global Elements

### 4.1 Custom Cursor
Two elements: a small fast dot + a larger slow-following ring.

```html
<div id="cur-dot"></div>
<div id="cur-ring"></div>
```

```css
body { cursor: none; }

#cur-dot {
  position: fixed; width: 8px; height: 8px; border-radius: 50%;
  background: var(--p3); pointer-events: none; z-index: 9999;
  transform: translate(-50%, -50%);
  mix-blend-mode: screen;
}
#cur-ring {
  position: fixed; width: 38px; height: 38px; border-radius: 50%;
  border: 1px solid rgba(155,107,255,0.45); pointer-events: none; z-index: 9998;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s, border-color 0.3s;
}
/* Expand ring on hover */
body:has(a:hover) #cur-ring,
body:has(button:hover) #cur-ring {
  width: 56px; height: 56px; border-color: var(--p3);
}
```

```js
const cd = document.getElementById('cur-dot');
const cr = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function anim() {
  rx += (mx - rx) * 0.12;  // lerp — adjust 0.12 for lag amount
  ry += (my - ry) * 0.12;
  cd.style.left = mx + 'px'; cd.style.top = my + 'px';
  cr.style.left = rx + 'px'; cr.style.top = ry + 'px';
  requestAnimationFrame(anim);
})();
```

### 4.2 Scroll Progress Bar

```html
<div id="spb"></div>
```

```css
#spb {
  position: fixed; top: 0; left: 0; height: 2px; width: 0;
  background: linear-gradient(90deg, var(--p1), var(--p4));
  z-index: 9997; pointer-events: none;
}
```

```js
window.addEventListener('scroll', () => {
  const s = document.documentElement.scrollTop;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  document.getElementById('spb').style.width = (s / h * 100) + '%';
});
```

### 4.3 Canvas Particle Field
Fixed behind everything. 160 drifting particles in purple/violet hues. Particles within 90px draw connecting lines.

```html
<canvas id="bgcanvas"></canvas>
```

```css
#bgcanvas {
  position: fixed; inset: 0; z-index: 0;
  pointer-events: none; opacity: 0.7;
}
```

```js
const cv = document.getElementById('bgcanvas');
const ctx = cv.getContext('2d');
let W, H, pts = [];

function rsz() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
rsz(); window.addEventListener('resize', rsz);

class Pt {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.r = Math.random() * 1.2 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.op = Math.random() * 0.3 + 0.04;
    this.hue = Math.random() > 0.5 ? 270 : 290; // purple range
  }
  upd() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue},70%,70%,${this.op})`;
    ctx.fill();
  }
}

for (let i = 0; i < 160; i++) pts.push(new Pt());

(function drawPts() {
  ctx.clearRect(0, 0, W, H);
  pts.forEach(p => { p.upd(); p.draw(); });
  // Connection lines
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 90) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(123,63,242,${0.05 * (1 - d / 90)})`;
        ctx.lineWidth = 0.5; ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawPts);
})();
```

### 4.4 Wavy Ripple Background (SVG)
Used in hero section and as decorative element in other sections. SVG `feTurbulence` + `feDisplacementMap` distorts grid lines into waves.

```html
<div class="wave-bg">
  <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="wf">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.008" numOctaves="3" seed="2" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
    <g filter="url(#wf)" stroke="rgba(155,107,255,1)" stroke-width="1" fill="none">
      <!-- Horizontal lines every 50px -->
      <line x1="0" y1="50" x2="1440" y2="50"/>
      <!-- ... repeat for y=100,150,200,...,850 -->
      <!-- Vertical lines every 80px -->
      <line x1="80" y1="0" x2="80" y2="900"/>
      <!-- ... repeat for x=160,240,...,1360 -->
    </g>
  </svg>
</div>
```

```css
.wave-bg {
  position: absolute; inset: 0; opacity: 0.07;
  pointer-events: none; overflow: hidden;
}
.wave-bg svg { width: 100%; height: 100%; }
```

**For corner-only decorative waves** (features/roles sections), use `opacity: 0.05`, position `absolute right: 0`, `width: 50%`.  
**For scroll section waves**, use `opacity: 0.06`, change `seed` to differentiate.

---

## 5. Navigation

```html
<nav id="nav">
  <div class="nav-logo">Glory<span>Well</span>Nic</div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#lead">Upcoming</a>
    <a href="#testi">Clients</a>
    <a href="#pricing">Pricing</a>
  </div>
  <div class="nav-r">
    <a href="#" class="btn-si">Sign In</a>
    <a href="#pricing" class="btn-bd">Book Demo</a>
  </div>
</nav>
```

```css
nav {
  position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
  z-index: 1000;
  display: flex; align-items: center; gap: 40px;
  background: rgba(13,8,32,0.6); backdrop-filter: blur(20px);
  border: 1px solid rgba(155,107,255,0.2);
  border-radius: 100px; padding: 12px 28px;
  transition: all 0.4s;
}
/* On scroll: goes wide */
nav.scrolled {
  top: 0; left: 0; right: 0; transform: none;
  border-radius: 0; border-left: none; border-right: none; border-top: none;
  padding: 18px 6vw;
}
```

```js
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
});
```

---

## 6. Hero Section

### Structure
```
#hero
├── .hero-glow1  (top center, largest)
├── .hero-glow2  (bottom right)
├── .hero-glow3  (bottom left)
├── .wave-bg     (SVG distorted grid)
├── .hero-tag    (pill badge with pulsing dot)
├── h1.hero-h    (each word wrapped in .hw span)
├── .hero-h2     (italic serif line)
├── p.hero-sub   (subtext)
├── .hero-btns   (primary + ghost CTAs)
└── .hero-mockup
    ├── .fpill.fp1  (floating pill badge)
    ├── .fpill.fp2
    ├── .fpill.fp3
    └── .mockup-shell
        ├── .mock-topbar (traffic lights)
        ├── .mock-grid   (3 stat cards)
        ├── .mock-appts  (appointment rows)
        └── .mock-bill   (GST billing strip)
```

### Animated Glow Orbs

```css
.hero-glow1 {
  position: absolute; width: 700px; height: 700px; border-radius: 50%;
  background: radial-gradient(circle, rgba(123,63,242,0.35) 0%, transparent 70%);
  top: -150px; left: 50%; transform: translateX(-50%);
  pointer-events: none; animation: orb1 8s ease-in-out infinite;
}
/* orb2: 400px, bottom right, rgba(91,43,224,.25), 10s */
/* orb3: 300px, bottom left, rgba(168,85,247,.2), 12s */

@keyframes orb1 {
  0%,100% { transform: translateX(-50%) scale(1); }
  50%      { transform: translateX(-50%) scale(1.15) translateY(20px); }
}
@keyframes orb2 {
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.2) translate(-20px,-15px); }
}
@keyframes orb3 {
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.3) translate(15px,-10px); }
}
```

### Hero Pill Badge

```css
.hero-tag {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 0.68rem; font-weight: 400; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--p4); padding: 7px 16px;
  background: rgba(155,107,255,0.1); border: 1px solid rgba(155,107,255,0.25);
  border-radius: 50px; margin-bottom: 32px;
  opacity: 0; transform: translateY(20px); /* GSAP animates this in */
}
.tag-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--p3);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(155,107,255,0.5); }
  50%     { opacity:0.5; box-shadow: 0 0 0 6px rgba(155,107,255,0); }
}
```

### Hero H1 Word-by-Word Reveal

Wrap every word in a `.hw` span:
```html
<h1 class="hero-h">
  <span class="hw">Manage</span> <span class="hw">Your</span> <span class="hw">Entire</span>
</h1>
<div class="hero-h2">Clinic, Beautifully.</div>
```

```css
.hero-h { overflow: hidden; }
.hero-h .hw { display: inline-block; opacity: 0; transform: translateY(100%); }
```

```js
// Set initial state then animate
gsap.set('.hero-h .hw', { y: '110%', opacity: 0 });

const htl = gsap.timeline({ delay: 0.4 });
htl
  .to('.hero-tag',    { opacity:1, y:0, duration:0.7, ease:'power2.out' })
  .to('.hero-h .hw',  { y:'0%', opacity:1, duration:0.8, stagger:0.10, ease:'power3.out' }, '-=0.3')
  .to('.hero-h2',     { opacity:1, y:0, duration:0.8, ease:'power2.out' }, '-=0.5')
  .to('.hero-sub',    { opacity:1, y:0, duration:0.7, ease:'power2.out' }, '-=0.4')
  .to('.hero-btns',   { opacity:1, y:0, duration:0.6, ease:'power2.out' }, '-=0.4')
  .to('.hero-mockup', { opacity:1, y:0, rotateX:0, duration:1.1, ease:'power3.out' }, '-=0.5');
```

### Mockup Card

Initial state has `rotateX(8deg)` perspective tilt. GSAP animates to `rotateX(0)` on load. After load, gentle float loop:

```js
gsap.to('.hero-mockup', { y: -16, duration: 4, ease:'sine.inOut', yoyo:true, repeat:-1, delay:2 });
```

Floating pill badges use `@keyframes` CSS animation (no GSAP needed):
```css
.fpill { position: absolute; /* glassmorphism styling */ }
.fp1 { top:-20px; left:-20px; animation: fp1 3.5s ease-in-out infinite; }
.fp2 { bottom:-16px; right:-16px; animation: fp2 4s ease-in-out infinite; }
.fp3 { top:30%; right:-30px; animation: fp1 5s ease-in-out infinite 0.5s; }

@keyframes fp1 { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-10px) rotate(1deg)} }
@keyframes fp2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
```

---

## 7. Marquee Strip

Sits between Hero and the scroll-text section. Purple gradient background.

```html
<div class="mstrip">
  <div class="mtrack">
    <!-- Duplicate all items twice for seamless loop -->
    <span class="mi hi">Appointment Calendar <span class="msep">✦</span></span>
    <span class="mi">Auto GST Billing <span class="msep">✦</span></span>
    <!-- ...8 items, then repeat the same 8 -->
  </div>
</div>
```

```css
.mstrip {
  overflow: hidden; padding: 14px 0;
  background: linear-gradient(90deg, var(--p2), var(--p1), var(--p2));
  border-top: 1px solid rgba(155,107,255,0.2);
  border-bottom: 1px solid rgba(155,107,255,0.2);
}
.mtrack {
  display: flex; white-space: nowrap;
  animation: mq 30s linear infinite;
}
@keyframes mq { from{transform:translateX(0)} to{transform:translateX(-50%)} }
.mi { display:inline-flex; align-items:center; gap:16px; padding:0 28px; font-size:0.62rem; font-weight:400; letter-spacing:0.2em; text-transform:uppercase; color:rgba(240,234,255,0.6); }
.mi.hi { color: rgba(240,234,255,0.95); }
.msep { color: rgba(255,255,255,0.25); }
```

---

## 8. ⭐ Signature Scroll-Text + Cards Effect

This is the most important section — the Pinterest effect. A tall sticky container where giant text scales in, then feature cards fly over it as you scroll.

### HTML Structure

```html
<div id="scroll-text-sec">        <!-- height: 400vh -->
  <div class="scroll-sticky">     <!-- position:sticky; height:100vh -->

    <!-- Wavy bg lines -->
    <div class="scroll-wave"><!-- SVG wavy lines --></div>

    <!-- Giant text in center -->
    <div class="big-words" id="bw">
      Manage <em>Everything</em>
    </div>

    <!-- Cards layer — floats above text -->
    <div class="cards-layer">
      <div class="float-card" style="top:8%; left:6%">...</div>
      <div class="float-card" style="top:5%; right:5%">...</div>
      <div class="float-card" style="bottom:12%; left:4%">...</div>
      <div class="float-card" style="bottom:8%; right:6%">...</div>
      <div class="float-card" style="top:40%; left:50%; transform:translateX(-50%)">...</div>
    </div>
  </div>
</div>
```

### CSS

```css
#scroll-text-sec {
  position: relative; z-index: 2;
  height: 400vh; /* TALL — controls scroll speed */
}
.scroll-sticky {
  position: sticky; top: 0; height: 100vh;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.big-words {
  position: absolute;
  font-family: var(--fs); font-weight: 800;
  font-size: clamp(5rem, 13vw, 13rem);
  letter-spacing: -0.04em; line-height: 0.9;
  text-align: center; color: var(--txt);
  pointer-events: none; user-select: none; white-space: nowrap;
}
.big-words em {
  font-family: var(--fd); font-style: italic;
  font-weight: 300; color: var(--p4);
}
.cards-layer {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}
.float-card {
  position: absolute; width: 230px;
  background: rgba(255,255,255,0.05); backdrop-filter: blur(20px);
  border: 1px solid rgba(155,107,255,0.18); border-radius: 18px; padding: 20px;
  opacity: 0; transform: translateY(60px) scale(0.9); /* GSAP animates */
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
```

### GSAP Animation (THE KEY PART)

```js
const bwEl = document.getElementById('bw');
const cards = document.querySelectorAll('.float-card');

// Phase 1: Big text scales UP as section enters viewport
gsap.fromTo(bwEl,
  { scale: 0.7, opacity: 0 },
  {
    scale: 1.1, opacity: 1, ease: 'none',
    scrollTrigger: {
      trigger: '#scroll-text-sec',
      start: 'top bottom',
      end: '25% center',
      scrub: 1
    }
  }
);

// Phase 2: Big text continues scaling and fades out
gsap.to(bwEl, {
  scale: 1.6, opacity: 0, ease: 'none',
  scrollTrigger: {
    trigger: '#scroll-text-sec',
    start: '30% center',
    end: '60% center',
    scrub: 1
  }
});

// Phase 3: Cards fly in one by one as scroll progresses
cards.forEach((card, i) => {
  gsap.to(card, {
    opacity: 1, y: 0, scale: 1, ease: 'power2.out',
    scrollTrigger: {
      trigger: '#scroll-text-sec',
      start: `${15 + i * 12}% center`,
      end:   `${30 + i * 12}% center`,
      scrub: 0.8
    }
  });
});
```

**Key insight:** `scrub: 1` ties animation to scroll position directly. The cards each start at `15%, 27%, 39%, 51%, 63%` of the section height so they stagger in sequentially as user scrolls.

### Float Card Inner Content

```html
<div class="float-card" style="top:8%; left:6%">
  <div class="fc-ico">📅</div>
  <div class="fc-ttl">Appointment Calendar</div>
  <div class="fc-dsc">Smart scheduling with room & doctor allocation.</div>
  <span class="fc-badge">Core</span>
</div>
```

```css
.fc-ico { font-size: 22px; margin-bottom: 12px; }
.fc-ttl { font-size: 0.82rem; font-weight: 600; color: var(--txt); margin-bottom: 6px; line-height: 1.3; }
.fc-dsc { font-size: 0.70rem; font-weight: 300; color: var(--txt2); line-height: 1.6; }
.fc-badge {
  display: inline-block; margin-top: 10px;
  font-size: 0.56rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 4px 10px; border-radius: 50px;
  background: rgba(155,107,255,0.15); color: var(--p4); border: 1px solid rgba(155,107,255,0.2);
}
```

---

## 9. Features Grid Section

Two-column header (title left, subtitle right), then 3×3 grid with `1px` gap trick.

```css
#features { background: var(--bg2); padding: 120px 6vw; position: relative; overflow: hidden; }

/* The 1px gap trick — background on parent, no gap on children */
.feat-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1px; background: rgba(155,107,255,0.08);
}
.fg-card {
  background: var(--bg2); padding: 36px 28px;
  position: relative; overflow: hidden; transition: background 0.4s;
  opacity: 0; transform: translateY(28px); /* GSAP animates */
}
.fg-card:hover { background: rgba(155,107,255,0.05); }

/* Bottom highlight line on hover */
.fg-card::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(155,107,255,0.3), transparent);
  transform: scaleX(0); transition: transform 0.4s;
}
.fg-card:hover::after { transform: scaleX(1); }
```

**Section eyebrow pattern** (used on every section):
```html
<div class="sec-ey">
  <div class="sec-ey-line"></div>
  <span class="sec-ey-txt">What's Inside</span>
</div>
```
```css
.sec-ey { display: inline-flex; align-items: center; gap: 12px; opacity: 0; transform: translateY(14px); }
.sec-ey-line { width: 30px; height: 1px; background: var(--p3); }
.sec-ey-txt { font-size: 0.62rem; font-weight: 400; letter-spacing: 0.20em; text-transform: uppercase; color: var(--p3); }
```

**GSAP for feature cards:**
```js
gsap.utils.toArray('.fg-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1, y: 0, duration: 0.7, delay: (i % 3) * 0.1, ease: 'power2.out',
    scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
  });
});
```

---

## 10. Lead Tracker Section

Dark section with purple glow orb top-right. Two columns: text left, glassmorphism UI card right.

```css
#lead { background: var(--bg); padding: 140px 6vw; overflow: hidden; }
.lead-orb {
  position: absolute; width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(91,43,224,0.2) 0%, transparent 65%);
  top: -100px; right: -100px; pointer-events: none;
}
.lead-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 100px; align-items: center; }
```

Lead UI card animation:
```js
gsap.to('.lead-ui', { opacity:1, x:0, duration:0.9, ease:'power3.out',
  scrollTrigger: { trigger:'#lead', start:'top 75%' }
});
```

Lead card initial state: `opacity: 0; transform: translateX(30px);`

Coming Soon badge:
```css
.soon-badge {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 0.62rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--p4); padding: 9px 18px;
  background: rgba(155,107,255,0.08); border: 1px solid rgba(155,107,255,0.2); border-radius: 50px;
}
.pulse-d { width:6px; height:6px; border-radius:50%; background:var(--p3); animation: pulse-dot 1.5s ease-in-out infinite; }
```

---

## 11. Testimonial Section

```css
#testi { background: var(--bg2); padding: 140px 6vw; overflow: hidden; }
.testi-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 100px; align-items: center; }

/* Decorative glow */
.testi-glow {
  position: absolute; width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 65%);
  bottom: -100px; left: -80px;
}

/* Large italic quote */
.big-quote {
  font-family: var(--fd); font-size: clamp(1.7rem, 3vw, 2.8rem);
  font-weight: 300; font-style: italic; color: var(--txt); line-height: 1.5;
  opacity: 0; transform: translateY(24px);
}
.big-quote::before {
  content: '\201C'; display: block; font-size: 5rem;
  color: var(--p3); line-height: 0.5; margin-bottom: 24px; opacity: 0.5;
}
```

Metric tiles grid (right column):
```css
/* 1px gap trick again */
.t-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(155,107,255,0.1); }
.t-met { background: var(--bg2); padding: 28px; transition: background 0.3s; opacity: 0; transform: translateY(18px); }
.t-met:hover { background: rgba(155,107,255,0.04); }
.tm-n { font-family: var(--fd); font-size: 2.8rem; font-weight: 300; color: var(--p4); line-height: 1; }
.tm-l { font-size: 0.65rem; font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; color: var(--txt3); margin-top: 6px; }
```

---

## 12. Role-Based Access Section

```css
#roles { background: var(--bg); padding: 140px 6vw; }
.roles-inner { display: grid; grid-template-columns: 1fr 1.1fr; gap: 100px; align-items: start; }

/* Role list container */
.r-list { background: rgba(255,255,255,0.02); border: 1px solid rgba(155,107,255,0.12); border-radius: 16px; overflow: hidden; }
.r-row {
  display: flex; align-items: center; gap: 16px; padding: 20px 22px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.2s; opacity: 0; transform: translateX(20px);
}
.r-row:hover { background: rgba(155,107,255,0.04); }

/* Role pill colors */
.rp-a { background:rgba(155,107,255,.15); color:var(--p4); border:1px solid rgba(155,107,255,.25); }
.rp-d { background:rgba(100,200,140,.1); color:rgba(100,220,140,.9); border:1px solid rgba(100,200,140,.2); }
.rp-r { background:rgba(200,160,80,.1); color:rgba(220,180,80,.9); border:1px solid rgba(200,160,80,.2); }
.rp-b { background:rgba(255,255,255,.06); color:var(--txt2); border:1px solid rgba(255,255,255,.1); }
.rp-c { background:rgba(155,107,255,.06); color:var(--p3); border:1px dashed rgba(155,107,255,.2); } /* custom - dashed */

/* Permission dots */
.dp   { width:10px; height:10px; border-radius:3px; }
.dp-f { background: rgba(100,200,140,0.7); }   /* full */
.dp-p { background: rgba(155,107,255,0.5); }   /* partial */
.dp-n { background: rgba(255,255,255,0.10); }  /* none */
```

```js
gsap.utils.toArray('.r-row').forEach((el, i) => {
  gsap.to(el, { opacity:1, x:0, duration:0.55, delay: i * 0.08, ease:'power2.out',
    scrollTrigger: { trigger:'.r-list', start:'top 80%' }
  });
});
```

---

## 13. Pricing Section

```css
#pricing { background: var(--bg2); padding: 140px 6vw; }
.pricing-glow {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 800px; height: 400px;
  background: radial-gradient(ellipse, rgba(123,63,242,0.12) 0%, transparent 70%);
}
.pc-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; max-width: 1100px; margin: 0 auto; }

.pc {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(155,107,255,0.10);
  border-radius: 22px; padding: 38px 30px;
  transition: all 0.4s; opacity: 0; transform: translateY(28px);
}
.pc:hover { border-color: rgba(155,107,255,0.3); transform: translateY(-5px); }

/* Featured card */
.pc.pc-feat {
  background: linear-gradient(145deg, rgba(123,63,242,0.18), rgba(91,43,224,0.08));
  border-color: rgba(155,107,255,0.35);
}
.pc.pc-feat:hover { transform: translateY(-8px); border-color: rgba(155,107,255,0.6); }

/* Featured badge — gradient instead of border */
.pc-feat .pc-badge {
  background: linear-gradient(135deg, var(--p4), var(--p3));
  color: var(--bg); border: none;
}

/* Featured price — colored */
.pc-feat .pc-price { color: var(--p4); }

/* Featured CTA button */
.pc-feat .btn-pc {
  background: linear-gradient(135deg, var(--p4), var(--p1));
  border: none; color: var(--bg);
}
.pc-feat .btn-pc:hover { box-shadow: 0 12px 40px var(--glow); transform: scale(1.02); }
```

---

## 14. Reusable Animation Patterns

### Generic Scroll Reveal (`.sr` class)

Apply class `sr` to any element for a fade-up reveal:
```css
.sr { opacity: 0; transform: translateY(24px); }
```
```js
gsap.utils.toArray('.sr').forEach(el => {
  gsap.to(el, { opacity:1, y:0, duration:0.75, ease:'power2.out',
    scrollTrigger: { trigger:el, start:'top 84%', toggleActions:'play none none none' }
  });
});
```

### Staggered Children (eyebrow → title → subtitle)

```js
// Apply to any section header group
gsap.utils.toArray('.sec-ey').forEach(el => {
  gsap.to(el, { opacity:1, y:0, duration:0.7, ease:'power2.out',
    scrollTrigger: { trigger:el, start:'top 85%', toggleActions:'play none none none' }
  });
});
```

### Slide-in from Right

```js
gsap.to(element, { opacity:1, x:0, duration:0.9, ease:'power3.out',
  scrollTrigger: { trigger: section, start:'top 75%' }
});
// Initial CSS: opacity:0; transform:translateX(30px);
```

### Animated Number Counter

```html
<span data-target="1300" data-suf="+">0+</span>
```
```js
function runCounter(el) {
  const target = +el.dataset.target;
  const suffix = el.dataset.suf || '';
  if (!target) return;
  let t0 = null;
  const dur = 2000;
  (function step(ts) {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.floor(ease * target).toLocaleString('en-IN') + suffix;
    if (p < 1) requestAnimationFrame(step);
  })(performance.now());
}

new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) document.querySelectorAll('[data-target]').forEach(runCounter);
  });
}, { threshold: 0.5 }).observe(triggerElement);
```

---

## 15. Glassmorphism Card Pattern

Used for floating pills, lead card, hero mockup, float-cards:

```css
.glass-card {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(155,107,255,0.18);
  border-radius: 18–24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
}
```

For cards on lighter sections, increase bg to `rgba(255,255,255,0.06)` and add `border: 1px solid rgba(255,255,255,0.08)`.

---

## 16. Page Sections Order

1. `<nav>` — fixed, pill shape, becomes full-width on scroll
2. `#hero` — 100vh, centered, glows + waves + mockup
3. `.mstrip` — marquee ticker strip
4. `#scroll-text-sec` — 400vh tall, sticky scroll-text + cards effect ⭐
5. `#features` — feature grid (bg2)
6. `#lead` — lead tracker teaser (bg)
7. `#testi` — testimonial + metrics (bg2)
8. `#roles` — role-based access (bg)
9. `#pricing` — pricing cards (bg2)
10. `<footer>` — (bg)

---

## 17. Content — GloryWellNic

### Brand
- **Name:** GloryWellNic
- **Tagline:** "Manage Your Entire Clinic, Beautifully."
- **Sub:** "Smart scheduling, auto-GST billing, inventory, role-based access and more — one powerful portal built for modern clinics across India."

### 8 Features
| # | Name | Icon | Tag |
|---|------|------|-----|
| 01 | Appointment Calendar | 📅 | Core |
| 02 | Employee Management | 👥 | Core |
| 03 | Clinic Data Hub | 🏥 | Core |
| 04 | Billing & Auto-GST | 🧾 | Finance |
| 05 | Inventory Management | 📦 | Operations |
| 06 | Feedback Management | ⭐ | Client Care |
| 07 | To-do & Reminders | 🔔 | Productivity |
| 08 | Role-Based Access | 🔐 | Security |
| 09 | Lead Tracker | 📲 | Coming Soon |

### Scroll-Text Cards (5 cards over giant text)
- Top-left: Appointment Calendar
- Top-right: Auto GST Billing
- Bottom-left: Employee Management
- Bottom-right: Role-Based Access
- Center: Inventory Management

### Testimonial
- **Quote:** "Before GloryWellNic, managing 50 appointments a day meant constant juggling between spreadsheets, WhatsApp and memory. Now everything is in one place. It has genuinely transformed how we run Elaria."
- **Name:** Akansha Srivastava
- **Clinic:** Founder, Elaria Esthetique · Gurgaon
- **Stats:** 1,300+ clients / 50+ appointments/day / #1 first client / Zero scheduling conflicts

### Hero Stats
- 1,300+ Active Clients (`data-target="1300" data-suf="+"`)
- 50+ Daily Appointments (`data-target="50" data-suf="+"`)
- ∞ Custom Roles
- 8 Management Modules (`data-target="8"`)

### Pricing
| Plan | Price | Audience |
|------|-------|----------|
| Essential | ₹0 | 14-day trial, 3 staff |
| Growth | ₹4,999/mo | All 8 modules, unlimited staff (FEATURED) |
| Chain | Custom | Multi-branch enterprise |

### Lead Tracker Section
- **Headline:** "Your Meta ads, *finally connected.*"
- **Platforms:** 📸 Instagram Ads · 👤 Facebook Ads
- **Badge:** Coming Soon — Join Waitlist

### GST Billing Logic (for mockup accuracy)
- Same state: CGST 9% + SGST 9%
- Different state: IGST 18%
- Show in bill strip: Service Total → CGST → SGST → divider → Total

---

## 18. Do's and Don'ts for Claude Code

### ✅ DO
- Keep `z-index: 0` on canvas, `z-index: 1+` on content sections
- Use `will-change: transform` on animated elements that use GSAP
- Use `pointer-events: none` on all decorative elements (glows, canvas, waves)
- Always set initial opacity/transform in CSS before GSAP animates them
- Use `toggleActions: 'play none none none'` for one-shot reveals (not scrub)
- Use `scrub: 1` only for scroll-linked continuous effects
- Keep `overflow: hidden` on `#hero`, each section with glows, and the scroll-text section

### ❌ DON'T
- Don't add `scroll-behavior: smooth` to html — GSAP ScrollTrigger conflicts with it
- Don't use `position: sticky` anywhere except inside `#scroll-text-sec`
- Don't forget to call `gsap.registerPlugin(ScrollTrigger)` before any ST usage
- Don't apply `backdrop-filter` on elements with many siblings — use sparingly for perf
- Don't use `overflow: hidden` on `body` — breaks ScrollTrigger pinning

---

## 19. Framework Adaptation Notes

### React / Next.js
- Move all GSAP animations into `useEffect(() => { ... return () => ctx.revert(); }, [])`
- Use `useRef` for element references instead of `document.querySelector`
- Canvas particle system can go in its own `<ParticleCanvas />` component with `useEffect`
- Wrap ScrollTrigger cleanup: `ScrollTrigger.getAll().forEach(t => t.kill())`

### Vue
- Animations go in `onMounted()`, cleanup in `onUnmounted()`
- Use `ref` + `$el` for element references

### Tailwind
- Color tokens map: `bg-[#06040D]`, `bg-[#0D0820]`, `text-[#C4A8FF]`, etc.
- The `1px gap` grid trick: `gap-px bg-purple-500/10` on parent, no gap on children

---

*End of CLAUDE.md — This file contains the complete design system for GloryWellNic landing page v1.0*
