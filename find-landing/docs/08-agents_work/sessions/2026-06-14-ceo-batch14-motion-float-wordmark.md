---
date: 2026-06-14
role: ceo
task: batch14-motion-gate-float-hero-flow-arrows-wordmark
branch: feat/hero-rebuild
tier: lite
qa_verdict: PASS
---

# Batch 14 — Fix "no animations", phone float, hero even-flow, arrows, wordmark outline

## Root cause (one cause, two symptoms)
All site motion was gated behind `motionOk = !prefers-reduced-motion`. Founder's macOS has Reduce-Motion ON →
Lenis never initialized + every section early-returned → zero animation sitewide, and the hero rendered the
static `ReducedMotionHero` which still carried the old buggy `Math.min` float clamp (the phone-float they saw).

## Shipped (feat/hero-rebuild)
- **A1** `bf5e499` — decoupled scroll choreography from OS Reduce-Motion: `motionOk` always true (reveals + hero
  always animate); new `reducedMotion` context value gates ONLY infinite loops/autoplay (Hitech + BuyerGroups
  marquees, Testimonials autoplay, HeroClouds ambient drift). Verified: Lenis now runs under forced
  `reducedMotion:'reduce'`.
- **A2** `225e232` — ReducedMotionHero float clamp min→max (defensive).
- **A3** `2850897` — hero building float hardened vs mobile toolbar vh change (visualViewport resize listener).
- **A4** `3e3076a` — chevron arrow panels nested closer (negative `marginInlineStart` overlap).
- **A5** `98ca4ab` — wordmark outer-silhouette outline via `feMorphology dilate` behind the image-fill (removes
  inner-counter white lines in ם/ב/ע) + drop-shadow for depth.
- **B1+B2** `a3768ea` — hero master timeline rebuilt: constant-velocity (linear scrub eases), no dead holds
  (wordmark presence now drifts/scale-creeps), stretched cross-dissolves, wordmark beat ~40% longer, pin
  `+=720%` → `+=1000%`.
- **B3** `b3b58f9` — pin releases into a plain-white veil frame; weightier Lenis (`wheelMultiplier` 0.9→0.82);
  RewiredSteps + SupportBeyond entrance `start` → `top 92%` so post-hero content resolves as the user emerges
  (kills the "fly past 2 sections" feel).

## Verification
- `npx tsc --noEmit` clean; `npm run build` green.
- Building base flush at 390/768/1024/1280/1440/1920 (diag2: gapBelow 0 or negative).
- Filmstrip (1440, 12 frames across the +1000% pin): even building reveal → outline draw → image-fill wordmark
  (long beat) → release into plain white at p=1.0. No frozen frames, no fly-past.
- Wordmark: clean outer rim, no inner-counter lines, subtle shadow.

## Next (deferred — awaiting founder)
Founder hands-on "feel" tuning of the new scroll pacing; then Cloudflare Pages deploy via Wrangler CLI (free
`*.pages.dev`) on explicit "go".
