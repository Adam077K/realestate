---
date: 2026-06-14
role: ceo
task: fix-scroll-reveals
branch: feat/hero-rebuild
tier: full
qa_verdict: PASS
deployed: https://bonimatid.pages.dev (deploy dbac5213)
---

# FIX 1 — Section scroll-reveals fire at load (founder's #1 complaint) — RESOLVED

## Problem
All ~12 page sections animated via `gsap.fromTo(..., {immediateRender:false, scrollTrigger:{start:'top 80%'}})`.
The Hero pin inserts a ~10×vh pin-spacer AFTER sibling triggers are created, so ScrollTrigger
computed their positions as already-scrolled-past and fired the one-shot tweens at page-load; they
completed and never re-armed (refresh() can't un-fire a completed one-shot). Plus Services/CtaFooter/Blog
gated animation on `!useReducedMotion()` → zero animation under the founder's reduce-motion OS setting.

## Fix (13 commits, frontend-engineer worker, CEO-verified)
- New `hooks/useScrollReveal.ts`: IntersectionObserver-driven reveal — builds each GSAP tween PAUSED
  (immediateRender applies the hidden `from` at build = armed), plays ONCE on first viewport intersection.
  Immune to ScrollTrigger/pin position math. Keeps GSAP for the animations themselves.
- Converted all 12 page.tsx sections' one-shot reveals to `useScrollReveal`. Scrub parallax tweens
  (SupportBeyond ghost, OwnYourCareer portrait, CtaFooter regBg) stay on ScrollTrigger (continuous).
- Decoupled Services.tsx + CtaFooter.tsx from `useReducedMotion()` → `useSmoothScroll().motionOk` (always true).
- Hook hardening (f24f2fa): `trigger: ref.current` is captured at render when the ref is still null;
  added `el = resolved ?? scope` fallback so section-rise specs still arm/reveal. This was a real latent
  miss that left testimonials (and section-level rises) unarmed.

## Verification (CEO, not worker-trusted)
- `npx tsc --noEmit` clean; `npm run build` green (static export).
- Playwright acceptance under `reducedMotion:'reduce'` (founder's real machine), production build:
  fresh load @ scroll 0 → services/buyer-groups/chevron-strip/testimonials `.tt-word` opacity = 0 (ARMED);
  after scrolling each heading into view → opacity = 1 (REVEALS). VERDICT: PASS.
- Visual sanity screenshots desktop (1280) + mobile (390): no regressions; RTL intact.

## Deploy
Pushed feat/hero-rebuild → GitHub; fast-forwarded origin/main (9dff013→f24f2fa) with founder authorization;
`wrangler pages deploy out` → live. QA gate: tsc+build+Playwright acceptance PASS; founder authorized deploy.

## Still pending (next jobs)
Mobile layout (chevron 4→2×2, building fill, heading clip), branded preloader, wordmark visual verify
(345ac1e), awwwards-grade reveal polish (SplitType masked stagger, blur-in, clip+parallax).
