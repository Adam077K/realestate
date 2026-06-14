---
date: 2026-06-14
role: ceo
task: wordmark-redesign + perf + preloader + headline
branch: feat/hero-rebuild
tier: full
qa_verdict: PASS
deployed: https://bonimatid.pages.dev (deploy e8d2d40f, main @ 7e07574)
---

# Hero wordmark redesign + scroll perf + preloader + direct headline

## 1. Wordmark redesign — match founder's reference video (frames 4–11)
Reference choreography: building rises → letters draw in as a THIN WHITE HOLLOW OUTLINE (line-draw)
→ building image FILLS the letter interiors → the white outline is REMOVED → image-filled letters float
in clean sky (no rim). Commits 03f4bd1, ccc1cde.
- `Logo.tsx` BrandWordmarkMask: REMOVED the always-on `feMorphology` dilate rim; added a stroked hollow
  outline `<g class="wm-outline-group">` (fill:none, stroke:#fff) that draws in via an RTL clip-path wipe and
  fades out independently; kept the `wm-fill-group` image fill. New `outlineRef` prop. Lighter drop-shadow.
- `Hero.tsx` timeline re-timed to the reference rhythm (even, ease:'none'): p0.42–0.56 outline draws in
  (fill 0), p0.56–0.70 fill 0→1 + building behind fades, p0.66–0.74 outline opacity 1→0 (rim removed),
  p0.74–0.90 settle, p0.90–1.0 release into white veil.
- VERIFIED (CEO Playwright filmstrip vs frames 6/8/10): outline(1,0)→fill(~0.84,~0.80)→done(0,1); visuals
  match (hollow white outline → filling → clean image-filled, no rim).

## 2. Scroll performance pass (site was laggy) — from a profiling audit
Commits a916f38, 4dbb109, 2c65eb9, 2070337, 38315d1, 92cbd87.
- P1 removed `blur(6px)` on the full-screen front cloud veil (opacity mutated per-rAF → killed GPU layer cache).
- P2 dropped `mix-blend-mode:screen` on faint FAR cloud layers + the 2 Hero wisps (13 blended layers → ~5).
- P3 replaced the building warm-rim `mask-image`+`soft-light` (re-stenciled every scrubbed tick, inside the
  GSAP-animated building wrap) with a cheap CSS gradient glow.
- P4 `scrub:0.8` → `scrub:true` — removed GSAP's internal smoothing loop fighting Lenis lerp (eases already
  'none' → zero visual change). P5 rAF dirty-check skips ~21 cloud style writes/frame when scroll is idle.
- P7 deferred the 600ms safety `ScrollTrigger.refresh` to `requestIdleCallback` (no mid-scroll forced reflow).
- Note: the wordmark redesign also removed the per-frame `feMorphology` (audit item P6) for free.

## 3. Branded preloader (commit 7e07574)
`components/sections/Preloader.tsx`, mounted first in `app/page.tsx`. Full-screen sky-gradient overlay with the
`bonim-logo.webp` + slim indeterminate bar. On mount it cache-warms the heavy below-fold images (manifest) so
downward scroll is smoother. Fades when `document.fonts.ready` + hero building loaded, OR 1800ms cap, with a
600ms min floor; unmounts (no DOM/pointer overhead) after. Reduced-motion safe.

## 4. Direct webinar headline (commit 7bce8be, founder-chosen option)
`data/content.ts` he+en. HE title `וובינר חינם: איך קונים דירה מקבלן נכון ב-2026`, subhead with date/time/Zoom/
hosts. EN mirror. Subhead allowed to wrap + font floor raised so the longer logistics line fits RTL on mobile.

## Verification (CEO, production build, reduce-motion)
- tsc clean; `npm run build` green.
- Desktop: new headline renders; wordmark filmstrip outline→fill→no-rim intact AFTER perf changes; clouds/sky
  clean (no P1/P2/P3 regression).
- Mobile 360/390/414: building grounded (rest gap −91, worst −39 → no float); 0 horizontal overflow.
- Preloader shows logo ~200ms, gone by ~2.5s, page interactive after.

## Pending (next)
Registration form has no backend (`CtaFooter.handleRegister` just setSubmitted) — wire to a 3rd-party endpoint.
Optional: awwwards reveal polish (SplitType masked stagger); real on-device mobile perf check.
