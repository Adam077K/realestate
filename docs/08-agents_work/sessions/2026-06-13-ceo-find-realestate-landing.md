---
date: 2026-06-13
role: ceo
task: find-realestate-landing
tier: full
qa_verdict: PASS
branch: ceo-1-1781364202
---

# FIND Real Estate — Awwwards-Grade Landing Page Recreation

## Goal
Faithful, awwwards-worthy recreation of findrealestate.com as a cinematic, scroll-driven
single-page experience, driven by a 46-frame reference walkthrough. Stack: Next.js 16 +
GSAP/ScrollTrigger + Lenis + Three.js (R3F). Full design pipeline + visual QA loop.

## Outcome — DELIVERED
Self-contained Next 16 app at `find-landing/`. All 10 sections built motion-faithful:
hero (pinned clouds → building rise → building-filled F]ND clip-mask wordmark reveal),
Why FIND + city b-roll, chevron image strip, Real-Estate-Rewired steps, Own Your Career,
testimonial slider, dark Buy/Sell/Rent giant-type Services, Support Beyond 3-card grid,
blog rows, and CTA + footer with the massive full-width F]ND wordmark. Build + tsc +
runtime all clean; reduced-motion + mobile/no-WebGL fallbacks in place.

## Orchestration
- WP-0 scaffold (frontend-engineer): Next app, Lenis+GSAP scroll engine, design tokens,
  UI primitives, F]ND chevron logo, typed content, 16 Pexels images.
- WP-1 hero (frontend-engineer, opus) · WP-2 light sections · WP-3 dark sections + footer.
- Visual QA: test-engineer Playwright capture (25 shots) → design-critic side-by-side vs
  reference frames → design-polisher P1/P2 fixes → re-capture verify.

## Key fixes during build
- TDZ ReferenceError in `useGsapContext` (page-breaking) — caught by QA harness, fixed.
- R3F v8 → v9 upgrade for React 19 JSX types.
- P1 word-space collapse in TwoToneHeading/RewiredSteps; P1 chevron clip-path reshape.
- P2 display font Space Grotesk → Onest (closer to reference grotesk); testimonial quote
  promoted to display scale; hero wordmark enlarged + higher-contrast fill.

## QA gate (Full tier — static marketing page, no auth/DB/billing; security surface nil)
- code-reviewer: zero P1 blockers. Verdict PASS.
- Visual fidelity (design-critic): section scores 78–92 post-polish (SupportBeyond 90,
  footer 92, OwnYourCareer 88, Services 85, WhyFind 82, hero wordmark 80).

## Known follow-ups (non-blocking, P2/P3)
- SmoothScrollProvider exposes `lenis: null` via context (async init, ref non-reactive) —
  harmless (no consumer reads `.lenis`); tidy if Lenis instance is ever needed downstream.
- Reduced-motion read from two sources (`motionOk` vs `useReducedMotion`) — unify.
- Unused `ScrollTrigger` imports in WhyFind/ChevronStrip — remove.
- Hero-rest headline gradient-fill (P2-4) and source a taller hero-building render for more
  full-bleed drama (deferred).

## Run / verify
```
cd find-landing && npm install && npm run dev   # http://localhost:3000
npm run build                                    # production build (passes)
node tests/visual-capture.mjs                    # regenerate qa-screens/ for regression
```
Reference frames: docs/reference-video-screenshots/. Capture harness: find-landing/tests/visual-capture.mjs.
